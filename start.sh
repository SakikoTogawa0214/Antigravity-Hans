#!/bin/bash

# Antigravity-Hans Launcher for macOS/Linux

# Resolve script directory to allow running from anywhere
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check Python
if command -v python3 >/dev/null 2>&1; then
    PYTHON_BIN="python3"
elif command -v python >/dev/null 2>&1; then
    PYTHON_BIN="python"
else
    echo "[ERROR] 未找到 Python。请确保 Python 已安装并添加到系统 PATH。"
    read -p "按回车键退出..." dummy
    exit 1
fi

# Setup Virtual Environment
VENV_DIR="$SCRIPT_DIR/.venv"
if [ ! -d "$VENV_DIR" ]; then
    echo "[提示] 未检测到 Python 虚拟环境，正在创建 .venv..."
    $PYTHON_BIN -m venv "$VENV_DIR"
    if [ $? -ne 0 ]; then
        echo "[ERROR] 创建虚拟环境失败。"
        read -p "按回车键退出..." dummy
        exit 1
    fi
    echo "[提示] 虚拟环境创建成功。"
fi

# Activate Virtual Environment
source "$VENV_DIR/bin/activate"
if [ $? -ne 0 ]; then
    echo "[ERROR] 激活虚拟环境失败。"
    read -p "按回车键退出..." dummy
    exit 1
fi

# Install Dependencies
python -c "import psutil, websocket" >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "[提示] 正在虚拟环境中安装运行依赖 (psutil, websocket-client)..."
    pip install -i https://pypi.tuna.tsinghua.edu.cn/simple psutil websocket-client
    if [ $? -ne 0 ]; then
        echo "[ERROR] 安装依赖失败。请检查网络连接。"
        read -p "按回车键退出..." dummy
        exit 1
    fi
    echo "[提示] 依赖安装完成。"
fi

# Menu loop
while true; do
    clear
    echo "Antigravity-Hans 启动器"
    echo "----------------------------------------"
    echo "1. 动态汉化 (Antigravity)"
    echo "2. 动态汉化 (Antigravity IDE)"
    echo "3. 静态汉化 (Antigravity IDE)"
    echo "4. 退出"
    echo "----------------------------------------"
    echo ""
    
    read -p "选择 (1-4): " choice
    
    case "$choice" in
        1)
            echo ""
            echo "正在启动 Antigravity 动态汉化..."
            python "$SCRIPT_DIR/antigravity-all-hans.py"
            if [ $? -ne 0 ]; then
                echo "[ERROR] 执行过程中发生错误。"
            else
                echo "任务执行完毕。"
            fi
            echo ""
            read -p "按回车键返回主菜单..." dummy
            ;;
        2)
            echo ""
            echo "正在启动 Antigravity IDE 动态汉化..."
            python "$SCRIPT_DIR/antigravity-all-hans.py" --ide
            if [ $? -ne 0 ]; then
                echo "[ERROR] 执行过程中发生错误。"
            else
                echo "任务执行完毕。"
            fi
            echo ""
            read -p "按回车键返回主菜单..." dummy
            ;;
        3)
            echo ""
            echo "正在运行静态汉化工具（实验性）..."
            python "$SCRIPT_DIR/antigravity-ide-patch.py"
            if [ $? -ne 0 ]; then
                echo "[ERROR] 执行过程中发生错误。"
            else
                echo "任务执行完毕。"
            fi
            echo ""
            read -p "按回车键返回主菜单..." dummy
            ;;
        4)
            exit 0
            ;;
        *)
            echo "无效的选择，请重新输入。"
            sleep 2
            ;;
    esac
done
