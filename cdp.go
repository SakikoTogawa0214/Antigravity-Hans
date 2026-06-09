package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gorilla/websocket"
)

// CDPTarget 调试目标页面
type CDPTarget struct {
	ID                  string `json:"id"`
	Type                string `json:"type"`
	Title               string `json:"title"`
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

// WaitAndInject 轮询等待调试端口就绪并注入，返回成功注入的页面数
func WaitAndInject(port int, maxWaitMs int, overlaySource string, injectedSet map[string]bool, mu *sync.Mutex) int {
	start := time.Now()
	limit := time.Duration(maxWaitMs) * time.Millisecond
	for time.Since(start) < limit {
		targets := CheckPort(port)
		if len(targets) > 0 {
			count := 0
			for _, t := range targets {
				mu.Lock()
				alreadyInjected := injectedSet[t.ID]
				mu.Unlock()
				if alreadyInjected && IsTargetInjected(t) {
					continue
				}
				if err := InjectTarget(t, overlaySource, injectedSet, mu); err != nil {
					fmt.Printf("向页面注入失败: %v\n", err)
				} else {
					count++
				}
			}
			if count > 0 {
				return count
			}
		}
		time.Sleep(800 * time.Millisecond)
	}
	return 0
}

// Run 普通运行模式：检测 -> 重启 -> 注入 -> 监视
func Run(cfg AppConfig, overlaySource string) {
	injectedSet := make(map[string]bool)
	var mu sync.Mutex

	app := DetectApp(cfg)

	// 1. 已开启调试端口，直接注入
	targets := CheckPort(app.Port)
	if len(targets) > 0 {
		count := 0
		for _, t := range targets {
			mu.Lock()
			alreadyInjected := injectedSet[t.ID]
			mu.Unlock()
			if alreadyInjected && IsTargetInjected(t) {
				continue
			}
			if err := InjectTarget(t, overlaySource, injectedSet, &mu); err == nil {
				count++
			}
		}
		if count > 0 {
			fmt.Printf("已成功向已开启调试的 %s 注入中文汉化。\n", app.Name)
			Watch(cfg, overlaySource, injectedSet, &mu)
			return
		}
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

	// 4. 启动 + 注入
	fmt.Printf("正在以调试模式启动 %s: %s ...\n", app.Name, targetPath)
	if err := LaunchWithDebug(targetPath, app.Port); err != nil {
		fmt.Printf("[ERROR] 启动失败: %v\n", err)
		return
	}
	fmt.Printf("正在等待 %s 调试端口就绪并注入...\n", app.Name)
	count := WaitAndInject(app.Port, 20000, overlaySource, injectedSet, &mu)
	if count > 0 {
		fmt.Printf("[成功] 已向 %s 页面应用中文汉化。\n", app.Name)
	} else {
		fmt.Printf("[ERROR] 向 %s 注入超时，可能是启动过慢或被拦截。\n", app.Name)
	}

	Watch(cfg, overlaySource, injectedSet, &mu)
}

// Watch 监视模式：持续检测并重新注入
func Watch(cfg AppConfig, overlaySource string, injectedSet map[string]bool, mu *sync.Mutex) {
	fmt.Printf("启动 %s 汉化监视模式 (每3秒检测一次)...\n", cfg.Name)

	app := DetectApp(cfg)
	if app.Running && CheckPort(app.Port) == nil {
		fmt.Printf("检测到 %s 正在运行但未开启调试，正在重启...\n", app.Name)
		KillProcess(cfg)
		time.Sleep(1 * time.Second)
	}

	app = DetectApp(cfg)
	if CheckPort(app.Port) == nil && !app.Running && app.Path != "" {
		fmt.Printf("正在自动拉起 %s...\n", app.Name)
		_ = LaunchWithDebug(app.Path, app.Port)
	}

	everRunning := false
	emptyChecks := 0

	for {
		app = DetectApp(cfg)
		if app.Running {
			everRunning = true
			emptyChecks = 0
		} else {
			if everRunning {
				fmt.Printf("检测到 %s 已退出，自动结束汉化监视。\n", cfg.Name)
				return
			}
			emptyChecks++
			if emptyChecks >= 15 {
				fmt.Println("超时未检测到运行中的实例，自动结束汉化监视。")
				return
			}
		}

		// 检测并注入新页面
		activeTargetIDs := make(map[string]bool)
		targets := CheckPort(app.Port)
		for _, t := range targets {
			if t.ID != "" {
				activeTargetIDs[t.ID] = true
				mu.Lock()
				alreadyInjected := injectedSet[t.ID]
				mu.Unlock()
				if !alreadyInjected || !IsTargetInjected(t) {
					if err := InjectTarget(t, overlaySource, injectedSet, mu); err != nil {
						title := t.Title
						if title == "" {
							title = "未命名"
						}
						fmt.Printf("检测到页面但注入失败: %s (ID: %s): %v\n", title, t.ID, err)
					} else {
						title := t.Title
						if title == "" {
							title = "未命名"
						}
						fmt.Printf("检测到新页面或页面已重载: %s (ID: %s)，注入成功。\n", title, t.ID)
					}
				}
			}
		}

		// 清理已关闭页面的记录
		mu.Lock()
		for id := range injectedSet {
			if !activeTargetIDs[id] {
				delete(injectedSet, id)
			}
		}
		mu.Unlock()

		time.Sleep(3 * time.Second)
	}
}
