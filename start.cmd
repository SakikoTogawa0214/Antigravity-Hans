@echo off
title Antigravity-Hans Launcher
chcp 65001 >nul

:: Check Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] 未找到 Python。请确保 Python 已安装并添加到系统 PATH。
    pause
    exit /b 1
)

:: Setup Virtual Environment
set VENV_DIR=%~dp0.venv
if exist "%VENV_DIR%" goto activate_venv

echo [提示] 未检测到 Python 虚拟环境，正在创建 .venv...
python -m venv "%VENV_DIR%"
if %errorlevel% neq 0 (
    echo [ERROR] 创建虚拟环境失败。
    pause
    exit /b 1
)
echo [提示] 虚拟环境创建成功。

:activate_venv
:: Activate Virtual Environment
call "%VENV_DIR%\Scripts\activate.bat"
if %errorlevel% neq 0 (
    echo [ERROR] 激活虚拟环境失败。
    pause
    exit /b 1
)

:: Install Dependencies
python -c "import psutil, websocket" >nul 2>nul
if %errorlevel%==0 goto menu

echo [提示] 正在虚拟环境中安装运行依赖 (psutil, websocket-client)...
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple psutil websocket-client
if %errorlevel% neq 0 (
    echo [ERROR] 安装依赖失败。请检查网络连接。
    pause
    exit /b 1
)
echo [提示] 依赖安装完成。


:menu
cls
echo Antigravity-Hans 启动器
echo ----------------------------------------
echo 1. 动态汉化 (Antigravity)
echo 2. 动态汉化 (Antigravity IDE)
echo 3. 静态汉化 (Antigravity IDE)
echo 4. 退出
echo ----------------------------------------
echo.

set /p choice=选择 (1-4): 

if "%choice%"=="1" (
    echo.
    echo 正在启动 Antigravity 动态汉化...
    python "%~dp0antigravity-all-hans.py"
    goto task_end
)
if "%choice%"=="2" (
    echo.
    echo 正在启动 Antigravity IDE 动态汉化...
    python "%~dp0antigravity-all-hans.py" --ide
    goto task_end
)
if "%choice%"=="3" (
    echo.
    echo 正在运行静态汉化工具（实验性）...
    python "%~dp0antigravity-ide-patch.py"
    goto task_end
)
if "%choice%"=="4" (
    exit /b 0
)

echo 无效的选择，请重新输入。
timeout /t 2 >nul
goto menu

:task_end
echo.
if %errorlevel% neq 0 (
    echo [ERROR] 执行过程中发生错误。
) else (
    echo 任务执行完毕。
)
echo.
echo 按任意键返回主菜单...
pause >nul
goto menu
