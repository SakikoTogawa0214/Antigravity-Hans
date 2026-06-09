# Antigravity 汉化工具 (Antigravity-Hans)

这是一个专为 Google Antigravity 及 Antigravity IDE 开发的中文汉化工具。它提供了动态注入与静态补丁两种方式，方便您在使用中享受到更符合中文阅读习惯的界面体验。

---

## 功能特性

- **动态汉化**：通过 CDP 调试接口动态注入汉化脚本，不修改任何原始文件，安全无痕。
- **静态补丁（实验性）**：直接修改 IDE 核心 HTML 资源文件，并自动更新 `product.json` 校验实现汉化，支持一键还原。

---

## 预览图

---

## 快速开始

在 Windows 环境下：

1. **运行启动器**  
   双击运行根目录下的 `start.cmd`。它会自动检查环境，并在需要时在当前目录创建 `.venv` 虚拟环境并安装运行依赖 (`psutil`, `websocket-client`)。

2. **选择汉化模式**  
   在终端菜单中输入对应的数字即可

---

## 模式说明

### 1. 动态汉化 (`antigravity-all-hans.py`)
- **原理**：杀死已运行的实例，并以 `--remote-debugging-port` 启动，再通过 WebSocket 连接向网页环境注入 `antigravity-hans-overlay.js`。
- **特点**：不改变任何本地程序文件；自带监视模式，每 3 秒检测一次实例状态，页面刷新或重载后会自动重新注入。
- **缺点**：每次启动都需要重新注入。

### 2. 静态汉化补丁（实验性） (`antigravity-ide-patch.py`)
- **原理**：寻找本地已安装的 Antigravity IDE 实例，修改其 `resources/app` 内的 VS Code 架构 HTML 文件，并重新计算 SHA256 校验和以更新 `product.json`。
- **特点**：一劳永逸。再次运行该脚本可以选择 `2. 卸载/还原补丁`，安全恢复至官方原始状态。
- **缺点**：应用更新后会被覆盖，需重新注入。

---

## 文件结构

```text
├── .venv/                      # 自动生成的 Python 虚拟环境
├── antigravity-all-hans.py     # 动态汉化控制脚本
├── antigravity-ide-patch.py    # 静态补丁汉化脚本
├── antigravity-hans-overlay.js # 核心汉化字典与 DOM 替换补丁
├── start.cmd                   # Windows 启动引导脚本
└── README.md                   # 项目说明文档
```

## 致谢
- 大部分翻译来自：https://github.com/kdczyz/antigravity-chinese
