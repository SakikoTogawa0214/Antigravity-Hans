package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gorilla/websocket"
)

// CDPTarget 调试目标页面
type CDPTarget struct {
	ID                   string `json:"id"`
	Type                 string `json:"type"`
	Title                string `json:"title"`
	WebSocketDebuggerURL string `json:"webSocketDebuggerUrl"`
}

// cdpIDCounter CDP 消息 ID 计数器
var cdpIDCounter atomic.Int64

// cdpCall 向 WebSocket 发送一条 CDP 命令并等待响应（最多 5 秒）
func cdpCall(conn *websocket.Conn, method string, params map[string]interface{}) (map[string]interface{}, error) {
	id := cdpIDCounter.Add(1)
	payload := map[string]interface{}{
		"id":     id,
		"method": method,
		"params": params,
	}
	data, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
		return nil, fmt.Errorf("发送 CDP 消息失败: %w", err)
	}

	deadline := time.Now().Add(5 * time.Second)
	for time.Now().Before(deadline) {
		conn.SetReadDeadline(deadline)
		_, msg, err := conn.ReadMessage()
		if err != nil {
			return nil, fmt.Errorf("接收 CDP 响应失败: %w", err)
		}
		var resp map[string]interface{}
		if err := json.Unmarshal(msg, &resp); err != nil {
			continue
		}
		if respID, ok := resp["id"]; ok {
			// JSON 数字默认反序列化为 float64
			if int64(respID.(float64)) == id {
				return resp, nil
			}
		}
	}
	return nil, fmt.Errorf("等待 %s 响应超时", method)
}

// CheckPort 查询调试端口，返回可注入的目标页面列表
func CheckPort(port int) []CDPTarget {
	url := fmt.Sprintf("http://127.0.0.1:%d/json/list", port)
	client := &http.Client{Timeout: 1500 * time.Millisecond}
	resp, err := client.Get(url)
	if err != nil {
		return nil
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		return nil
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil
	}

	var targets []CDPTarget
	if err := json.Unmarshal(body, &targets); err != nil {
		return nil
	}

	ignoredTypes := map[string]bool{
		"worker": true, "service_worker": true,
		"shared_worker": true, "background_page": true,
	}
	var result []CDPTarget
	for _, t := range targets {
		if !ignoredTypes[t.Type] && t.WebSocketDebuggerURL != "" {
			result = append(result, t)
		}
	}
	return result
}

// IsTargetInjected 检测页面是否已注入汉化（检查 window.__antigravityZhPatchInstalled == 7）
func IsTargetInjected(target CDPTarget) bool {
	dialer := websocket.DefaultDialer
	conn, _, err := dialer.Dial(target.WebSocketDebuggerURL, nil)
	if err != nil {
		return false
	}
	defer conn.Close()

	conn.SetReadDeadline(time.Now().Add(2 * time.Second))
	resp, err := cdpCall(conn, "Runtime.evaluate", map[string]interface{}{
		"expression":   "window.__antigravityZhPatchInstalled",
		"awaitPromise": false,
	})
	if err != nil {
		return false
	}
	result, ok := resp["result"].(map[string]interface{})
	if !ok {
		return false
	}
	inner, ok := result["result"].(map[string]interface{})
	if !ok {
		return false
	}
	val, _ := inner["value"].(float64)
	return val == 7
}

// InjectTarget 向目标页面注入汉化脚本
func InjectTarget(target CDPTarget, overlaySource string, injectedSet map[string]bool, mu *sync.Mutex) error {
	dialer := websocket.DefaultDialer
	conn, _, err := dialer.Dial(target.WebSocketDebuggerURL, nil)
	if err != nil {
		return fmt.Errorf("连接 WebSocket 失败: %w", err)
	}
	defer conn.Close()

	conn.SetReadDeadline(time.Now().Add(10 * time.Second))
	_, err = cdpCall(conn, "Page.addScriptToEvaluateOnNewDocument", map[string]interface{}{
		"source": overlaySource,
	})
	if err != nil {
		return fmt.Errorf("addScriptToEvaluateOnNewDocument 失败: %w", err)
	}

	_, err = cdpCall(conn, "Runtime.evaluate", map[string]interface{}{
		"expression":   overlaySource,
		"awaitPromise": false,
	})
	if err != nil {
		return fmt.Errorf("Runtime.evaluate 失败: %w", err)
	}

	if target.ID != "" && mu != nil {
		mu.Lock()
		injectedSet[target.ID] = true
		mu.Unlock()
	}
	return nil
}

// WaitForPort 等待调试端口就绪
func WaitForPort(port int, maxWaitMs int) bool {
	start := time.Now()
	limit := time.Duration(maxWaitMs) * time.Millisecond
	for time.Since(start) < limit {
		targets := CheckPort(port)
		if len(targets) > 0 {
			return true
		}
		time.Sleep(500 * time.Millisecond)
	}
	return false
}

// Run 普通运行模式：检测 -> 重启 -> 监视
func Run(cfg AppConfig, overlaySource string) {
	injectedSet := make(map[string]bool)
	var mu sync.Mutex

	app := DetectApp(cfg)

	// 1. 已开启调试端口，直接进入监视模式
	targets := CheckPort(app.Port)
	if len(targets) > 0 {
		fmt.Printf("检测到 %s 调试端口已开启，直接进入监视模式...\n", app.Name)
		Watch(cfg, overlaySource, injectedSet, &mu)
		return
	}

	// 2. 进程在运行但未开启调试端口，先结束它
	if app.Running {
		fmt.Printf("检测到 %s 正在运行，但未开启调试端口。准备重新拉起...\n", app.Name)
		KillProcess(cfg)
		time.Sleep(1500 * time.Millisecond)
	}

	// 3. 确定启动路径
	app = DetectApp(cfg)
	targetPath := app.Path
	if targetPath == "" {
		switch len(app.AllPaths) {
		case 0:
			fmt.Printf("[ERROR] 未能在本机找到 %s 的安装路径。\n", app.Name)
			return
		case 1:
			targetPath = app.AllPaths[0]
		default:
			fmt.Printf("\n检测到本机存在多个 %s 安装实例，请选择启动哪一个：\n", app.Name)
			for i, p := range app.AllPaths {
				fmt.Printf(" [%d] %s\n", i+1, p)
			}
			var choice int
			fmt.Printf("请选择 (1-%d, 默认 1): ", len(app.AllPaths))
			fmt.Scan(&choice)
			if choice < 1 || choice > len(app.AllPaths) {
				choice = 1
			}
			targetPath = app.AllPaths[choice-1]
		}
	}

	// 4. 启动 + 监视
	fmt.Printf("正在以调试模式启动 %s: %s ...\n", app.Name, targetPath)
	if err := LaunchWithDebug(targetPath, app.Port); err != nil {
		fmt.Printf("[ERROR] 启动失败: %v\n", err)
		return
	}
	fmt.Printf("正在等待 %s 调试端口就绪并建立监视...\n", app.Name)
	if WaitForPort(app.Port, 20000) {
		fmt.Printf("[成功] %s 调试接口已就绪。\n", app.Name)
	} else {
		fmt.Printf("[警告] 等待 %s 调试端口超时，尝试直接连接...\n", app.Name)
	}

	Watch(cfg, overlaySource, injectedSet, &mu)
}

// getBrowserWSURL 获取浏览器级别的 WebSocket 调试端点 URL
func getBrowserWSURL(port int) (string, error) {
	url := fmt.Sprintf("http://127.0.0.1:%d/json/version", port)
	client := &http.Client{Timeout: 1500 * time.Millisecond}
	resp, err := client.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		return "", fmt.Errorf("HTTP 状态码错误: %d", resp.StatusCode)
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}
	var versionInfo map[string]string
	if err := json.Unmarshal(body, &versionInfo); err != nil {
		return "", err
	}
	wsURL := versionInfo["webSocketDebuggerUrl"]
	if wsURL == "" {
		return "", fmt.Errorf("webSocketDebuggerUrl 为空")
	}
	return wsURL, nil
}

// Watch 监视模式：使用 CDP Target 事件订阅彻底取代轮询
func Watch(cfg AppConfig, overlaySource string, injectedSet map[string]bool, mu *sync.Mutex) {
	fmt.Printf("启动 %s 汉化监视模式 (CDP 事件驱动型)...\n", cfg.Name)

	var wsURL string
	var err error

	// 1. 等待端口就绪并获取浏览器 WebSocket 连接 URL
	for i := 0; i < 40; i++ {
		wsURL, err = getBrowserWSURL(cfg.Port)
		if err == nil && wsURL != "" {
			break
		}
		time.Sleep(500 * time.Millisecond)
	}

	if err != nil || wsURL == "" {
		fmt.Printf("[错误] 无法连接到 %s 调试接口: %v\n", cfg.Name, err)
		return
	}

	// 2. 连接到 Browser 级调试会话
	dialer := websocket.DefaultDialer
	conn, _, err := dialer.Dial(wsURL, nil)
	if err != nil {
		fmt.Printf("[错误] 建立 CDP 事件长连接失败: %v\n", err)
		return
	}
	defer conn.Close()

	// 3. 启用 Target 发现
	discoverCmd := map[string]interface{}{
		"id":     1,
		"method": "Target.setDiscoverTargets",
		"params": map[string]bool{
			"discover": true,
		},
	}
	discoverJSON, _ := json.Marshal(discoverCmd)
	if err := conn.WriteMessage(websocket.TextMessage, discoverJSON); err != nil {
		fmt.Printf("[错误] 发送 Target.setDiscoverTargets 失败: %v\n", err)
		return
	}

	fmt.Println("[成功] 汉化监视连接已建立，进入事件驱动注入状态。")

	// 4. 事件监听循环
	type TargetInfo struct {
		TargetID string `json:"targetId"`
		Type     string `json:"type"`
		Title    string `json:"title"`
		URL      string `json:"url"`
	}
	type CDPNotification struct {
		Method string `json:"method"`
		Params struct {
			TargetInfo TargetInfo `json:"targetInfo"`
		} `json:"params"`
	}

	ignoredTypes := map[string]bool{
		"worker": true, "service_worker": true,
		"shared_worker": true, "background_page": true,
	}
	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			// 连接断开，等待 1.5 秒以确保进程有足够时间彻底关闭并被操作系统回收
			fmt.Printf("与 %s 调试端口的连接断开，正在确认应用状态...\n", cfg.Name)
			time.Sleep(1500 * time.Millisecond)
			app := DetectApp(cfg)
			if !app.Running {
				fmt.Printf("检测到 %s 已退出，结束汉化监视。\n", cfg.Name)
				return
			}
			Watch(cfg, overlaySource, injectedSet, mu)
			return
		}

		var notif CDPNotification
		if err := json.Unmarshal(msg, &notif); err != nil {
			continue
		}

		// 捕获新页面创建与页面信息变更（如重载、重定向）
		if notif.Method == "Target.targetCreated" || notif.Method == "Target.targetInfoChanged" {
			info := notif.Params.TargetInfo
			if info.TargetID == "" || ignoredTypes[info.Type] {
				continue
			}

			// 只监听主要的汉化页面标识
			urlLower := strings.ToLower(info.URL)
			var isTargetPage bool
			if cfg.Port == 9222 { // IDE 版
				isTargetPage = strings.HasSuffix(urlLower, "workbench.html") ||
					strings.HasSuffix(urlLower, "workbench-jetski-agent.html") ||
					strings.Contains(urlLower, "workbench.html?") ||
					strings.Contains(urlLower, "workbench-jetski-agent.html?")
			} else { // 普通版 Antigravity
				isTargetPage = strings.HasPrefix(urlLower, "data:text/html") ||
					strings.Contains(urlLower, "127.0.0.1") ||
					strings.Contains(urlLower, "localhost")
			}

			if !isTargetPage {
				continue
			}

			t := CDPTarget{
				ID:                   info.TargetID,
				Type:                 info.Type,
				Title:                info.Title,
				WebSocketDebuggerURL: fmt.Sprintf("ws://127.0.0.1:%d/devtools/page/%s", cfg.Port, info.TargetID),
			}

			mu.Lock()
			alreadyInjected := injectedSet[t.ID]
			mu.Unlock()

			if !alreadyInjected || !IsTargetInjected(t) {
				if err := InjectTarget(t, overlaySource, injectedSet, mu); err == nil {
					title := t.Title
					if title == "" {
						if strings.HasPrefix(urlLower, "data:text/html") {
							title = "首屏加载页"
						} else if strings.Contains(urlLower, "127.0.0.1") || strings.Contains(urlLower, "localhost") {
							title = "应用主页面"
						} else {
							title = "主窗口"
						}
					}
					// 限制标题打印长度，防止超长 data:text 撑爆控制台
					if len(title) > 300 {
						title = title[:297] + "..."
					}
					fmt.Printf("[事件驱动] 捕获到目标页面变动，成功注入汉化: %s (ID: %s)\n", title, t.ID)
				}
			}
		}
	}
}
