//go:build darwin

package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// CreateChineseShortcut 创建一个运行动态汉化的 “原名字 中文.app” 包装应用
func CreateChineseShortcut(cfg AppConfig) error {
	// 获取当前 antigravity-hans 的绝对路径
	selfExe, err := os.Executable()
	if err != nil {
		return fmt.Errorf("无法获取当前程序路径: %v", err)
	}
	selfExeAbs, err := filepath.Abs(selfExe)
	if err != nil {
		selfExeAbs = selfExe
	}

	homeDir, err := os.UserHomeDir()
	if err != nil {
		return fmt.Errorf("无法获取用户主目录: %v", err)
	}

	// 确定应用程序目录
	appsDir := "/Applications"
	// 检查 /Applications 是否可写，若不可写则使用用户目录下的 Applications
	testPath := filepath.Join(appsDir, ".tmp_write_test")
	if err := os.WriteFile(testPath, []byte("test"), 0644); err != nil {
		appsDir = filepath.Join(homeDir, "Applications")
	} else {
		_ = os.Remove(testPath)
	}
	wrapperAppName := cfg.Name + " 中文.app"
	wrapperAppPath := filepath.Join(appsDir, wrapperAppName)

	// 创建目录结构
	contentsDir := filepath.Join(wrapperAppPath, "Contents")
	macosDir := filepath.Join(contentsDir, "MacOS")
	resourcesDir := filepath.Join(contentsDir, "Resources")

	if err := os.MkdirAll(macosDir, 0755); err != nil {
		return err
	}
	if err := os.MkdirAll(resourcesDir, 0755); err != nil {
		return err
	}

	// 1. 写 Info.plist
	infoPlistContent := `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleExecutable</key>
	<string>launcher</string>
	<key>CFBundleIconFile</key>
	<string>icon.icns</string>
	<key>CFBundleIdentifier</key>
	<string>com.antigravity.hans.wrapper.` + strings.ReplaceAll(strings.ToLower(cfg.Name), " ", "") + `</string>
	<key>CFBundleName</key>
	<string>` + cfg.Name + ` 中文</string>
	<key>CFBundlePackageType</key>
	<string>APPL</string>
	<key>LSUIElement</key>
	<true/>
</dict>
</plist>
`
	if err := os.WriteFile(filepath.Join(contentsDir, "Info.plist"), []byte(infoPlistContent), 0644); err != nil {
		return err
	}

	// 2. 确定原 app 路径
	var originalAppPath string
	detected := DetectApp(cfg)
	if detected.Path != "" {
		originalAppPath = filepath.Dir(filepath.Dir(filepath.Dir(detected.Path)))
	} else if len(detected.AllPaths) > 0 {
		originalAppPath = filepath.Dir(filepath.Dir(filepath.Dir(detected.AllPaths[0])))
	} else if len(cfg.PossiblePaths) > 0 {
		originalAppPath = filepath.Dir(filepath.Dir(filepath.Dir(cfg.PossiblePaths[0])))
	}

	// 3. 写 launcher 脚本
	arg := "--app"
	if strings.Contains(strings.ToLower(cfg.Name), "ide") {
		arg = "--ide"
	}
	launcherContent := fmt.Sprintf(`#!/bin/bash
# 启动后台汉化监视进程
nohup "%s" %s --nogui > /dev/null 2>&1 &
# 启动原版应用
open "%s"
`, selfExeAbs, arg, originalAppPath)

	launcherPath := filepath.Join(macosDir, "launcher")
	if err := os.WriteFile(launcherPath, []byte(launcherContent), 0755); err != nil {
		return err
	}

	// 4. 复制 .icns 图标
	if originalAppPath != "" {
		origResources := filepath.Join(originalAppPath, "Contents", "Resources")
		if files, err := os.ReadDir(origResources); err == nil {
			for _, file := range files {
				if filepath.Ext(file.Name()) == ".icns" {
					srcFile := filepath.Join(origResources, file.Name())
					dstFile := filepath.Join(resourcesDir, "icon.icns")
					_ = copyFile(srcFile, dstFile)
					break
				}
			}
		}
	}

	fmt.Printf("[成功] 已在应用程序目录创建包装应用: %s\n", wrapperAppPath)
	return nil
}
