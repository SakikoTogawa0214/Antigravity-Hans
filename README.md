# Antigravity 汉化工具 (Antigravity-Hans)

这是一个专为 Google Antigravity 及 Antigravity IDE 开发的中文汉化工具。它提供了动态注入与静态补丁两种方式，方便您在使用中享受到更符合中文阅读习惯的界面体验。

> 基于 Go 重写，**无需安装任何运行时环境**，下载即用。

---

## 预览图

<img width="2560" height="1600" alt="81563fe34f792c74c50cb1e922ffd2ae" src="https://github.com/user-attachments/assets/4afcc033-34e4-47f7-bca1-53c341780b36" />
<img width="2560" height="1600" alt="7c09d929bcb0e1103f01e2160c31ee36" src="https://github.com/user-attachments/assets/db2173c3-6c92-493c-bcb0-d3235133a381" />

---

## 快速开始

前往 [Releases](../../releases) 页面下载对应平台的可执行文件。

### Windows

直接双击 `antigravity-hans-windows-amd64.exe` 运行，在菜单中选择汉化模式即可。

### macOS

```bash
# Apple Silicon (M 系列芯片)
chmod +x antigravity-hans-macos-arm64
./antigravity-hans-macos-arm64

# Intel Mac
chmod +x antigravity-hans-macos-amd64
./antigravity-hans-macos-amd64
```

> **提示**：若 macOS 提示"无法验证开发者"，请前往「系统设置 → 隐私与安全性」，点击「仍要打开」。

---

## 模式说明

### 1. 动态汉化
- **原理**：以 `--remote-debugging-port` 启动目标应用，通过 CDP WebSocket 向页面注入 `antigravity-hans-overlay.js`。
- **特点**：不修改任何本地程序文件，安全无痕；基于 CDP 事件订阅监听，实时捕获并立即完成汉化注入。
- **缺点**：每次启动应用前需运行本工具（已解决,通过本工具创建快捷方式）。

### 2. 静态汉化补丁（实验性）
- **原理**：定位本地 Antigravity IDE 安装目录，修改 VS Code 架构的 HTML 文件，并重新计算 SHA256 校验和更新 `product.json`。
- **特点**：一劳永逸，无需每次注入；支持一键还原至官方原始状态。
- **缺点**：应用自动更新后会被覆盖，需重新注入。

---

## 命令行参数

```bash
# 直接启动（跳过菜单）
antigravity-hans --app    # 动态汉化 Antigravity
antigravity-hans --ide    # 动态汉化 Antigravity IDE
antigravity-hans --patch  # 静态补丁菜单
```

---

## 文件结构

```text
├── *.go                        # Go 源码
├── go.mod / go.sum             # Go 模块定义
├── antigravity-hans-overlay.js # 核心汉化字典与 DOM 替换补丁
├── build.sh                    # 一键交叉编译脚本
└── README.md
```

## 从源码编译

需要安装 [Go 1.21+](https://go.dev/dl/)：

```bash
./build.sh
```

编译产物输出至 `dist/` 目录。

---

## 致谢
- 大部分翻译来自：https://github.com/kdczyz/antigravity-chinese
