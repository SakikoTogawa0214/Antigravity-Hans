package main

import (
	_ "embed"
	"os"
	"path/filepath"
)

//go:embed antigravity-hans-overlay.js
var embeddedOverlayJS []byte

// LoadOverlaySource 优先从可执行文件同目录加载外部 JS，
// 若不存在则使用编译期内嵌版本。
func LoadOverlaySource() string {
	// 尝试从可执行文件同目录读取外部文件
	exePath, err := os.Executable()
	if err == nil {
		exeDir := filepath.Dir(exePath)
		extPath := filepath.Join(exeDir, "antigravity-hans-overlay.js")
		if data, err := os.ReadFile(extPath); err == nil {
			return string(data)
		}
	}
	// 兜底：使用内嵌版本
	return string(embeddedOverlayJS)
}
