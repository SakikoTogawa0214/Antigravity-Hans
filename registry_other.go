//go:build !windows

package main

// GetPathsFromRegistry 在非 Windows 平台返回空列表
func GetPathsFromRegistry(appName, exeName string) []string {
	return []string{}
}
