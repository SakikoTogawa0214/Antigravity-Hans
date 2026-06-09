package main

import (
	"bufio"
	"fmt"
	"os"
	"os/signal"
	"strings"
	"syscall"
)

// Version 由编译时通过 -ldflags "-X main.Version=v1.0.0" 注入
var Version = "dev"

func getBanner() string {
	return `
  ___        _   _                     _ _          _   _
 / _ \      | | (_)                   (_) |        | | | |
/ /_\ \_ __ | |_ _  __ _ _ __ __ ___   _| |_ _   _| |_| | __ _ _ __  ___
|  _  | '_ \| __| |/ _  | '__/ _  \ \ / / | __| | | |  _  |/ _  | '_ \/ __|
| | | | | | | |_| | (_| | | | (_| |\ V /| | |_| |_| | | | | (_| | | | \__ \
\_| |_/_| |_|\__|_|\__, |_|  \__,_| \_/ |_|\__|\__, \_/ |_|\__,_|_| |_|___/
                    __/ |                        __/ |
                   |___/                        |___/  汉化工具 ` + Version + `
`
}

func main() {
	// 捕获 Ctrl+C
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-sigCh
		fmt.Println("\n\n[提示] 汉化监视已由用户终止退出。")
		os.Exit(0)
	}()

	// 加载汉化 JS
	overlaySource := LoadOverlaySource()

	// 命令行参数模式（非交互）
	args := os.Args[1:]
	if len(args) > 0 {
		// 静态补丁参数
		if containsArg(args, "--patch") || containsArg(args, "-patch") {
			runPatchMenu(overlaySource)
			return
		}

		// 动态汉化参数
		isApp := containsArg(args, "--app") || containsArg(args, "-app")
		isIDE := containsArg(args, "--ide") || containsArg(args, "-ide")

		if isIDE {
			Run(AppIDE, overlaySource)
			return
		} else if isApp {
			Run(AppNormal, overlaySource)
			return
		}

		// 传入了无效的参数，输出提示
		fmt.Println("未知的命令行参数。用法：")
		fmt.Println("  antigravity-hans --app    # 动态汉化 Antigravity")
		fmt.Println("  antigravity-hans --ide    # 动态汉化 Antigravity IDE")
		fmt.Println("  antigravity-hans --patch  # 静态补丁菜单")
		return
	}

	// 交互式主菜单
	runMainMenu(overlaySource)
}

func runMainMenu(overlaySource string) {
	reader := bufio.NewReader(os.Stdin)
	for {
		fmt.Print(getBanner())
		fmt.Println("Antigravity-Hans 启动器")
		fmt.Println("----------------------------------------")
		fmt.Println("1. 动态汉化 (Antigravity)")
		fmt.Println("2. 动态汉化 (Antigravity IDE)")
		fmt.Println("3. 静态汉化 (Antigravity IDE)")
		fmt.Println("4. 退出")
		fmt.Println("----------------------------------------")
		fmt.Print("\n选择 (1-4): ")

		line, _ := reader.ReadString('\n')
		choice := strings.TrimSpace(line)

		switch choice {
		case "1":
			fmt.Println("\n正在启动 Antigravity 动态汉化...")
			Run(AppNormal, overlaySource)
			fmt.Println("\n任务执行完毕。")
			pressEnterToContinue(reader)
		case "2":
			fmt.Println("\n正在启动 Antigravity IDE 动态汉化...")
			Run(AppIDE, overlaySource)
			fmt.Println("\n任务执行完毕。")
			pressEnterToContinue(reader)
		case "3":
			fmt.Println("\n正在运行静态汉化工具（实验性）...")
			runPatchMenu(overlaySource)
			pressEnterToContinue(reader)
		case "4":
			fmt.Println("再见！")
			os.Exit(0)
		default:
			fmt.Println("无效的选择，请重新输入。")
		}
		clearScreen()
	}
}

func runPatchMenu(overlaySource string) {
	reader := bufio.NewReader(os.Stdin)

	fmt.Println("\nAntigravity-Hans 静态注入工具")
	fmt.Println("----------------------------------------")

	apps := GetInstalledIDEApps()
	if len(apps) == 0 {
		fmt.Println("[ERROR] 本机未检测到任何 Antigravity IDE 安装实例。")
		return
	}

	for _, app := range apps {
		fmt.Printf("检测到实例: %s\n", app.Name)
	}

	fmt.Println("\n请选择您要执行的操作：")
	fmt.Println(" 1. 注入静态汉化")
	fmt.Println(" 2. 还原")
	fmt.Println(" 3. 退出")
	fmt.Println("----------------------------------------")
	fmt.Print("选择 (1-3): ")

	line, _ := reader.ReadString('\n')
	choice := strings.TrimSpace(line)
	if choice != "1" && choice != "2" {
		fmt.Println("已退出。")
		return
	}

	// 选择目标实例
	var targetApps []PatchAppInstance
	if len(apps) == 1 {
		targetApps = apps
	} else {
		fmt.Printf("\n请选择要操作的应用实例：\n")
		for i, app := range apps {
			fmt.Printf(" [%d] %s\n", i+1, app.Name)
		}
		fmt.Printf(" [%d] 全部应用\n", len(apps)+1)
		fmt.Printf(" [%d] 取消\n", len(apps)+2)
		fmt.Printf("\n选择 (1-%d): ", len(apps)+2)

		line, _ = reader.ReadString('\n')
		var appChoice int
		fmt.Sscan(strings.TrimSpace(line), &appChoice)

		if appChoice == len(apps)+2 || appChoice == 0 {
			fmt.Println("操作已取消。")
			return
		} else if appChoice == len(apps)+1 {
			targetApps = apps
		} else if appChoice >= 1 && appChoice <= len(apps) {
			targetApps = []PatchAppInstance{apps[appChoice-1]}
		} else {
			fmt.Println("无效的选择，操作取消。")
			return
		}
	}

	// 执行对应操作
	for _, app := range targetApps {
		if choice == "1" {
			InstallPatch(app, overlaySource)
		} else {
			UninstallPatch(app)
		}
	}
}

func pressEnterToContinue(reader *bufio.Reader) {
	fmt.Print("\n按回车键返回主菜单...")
	reader.ReadString('\n')
}

func clearScreen() {
	fmt.Print("\033[H\033[2J")
}

func containsArg(args []string, s string) bool {
	for _, a := range args {
		if a == s {
			return true
		}
	}
	return false
}
