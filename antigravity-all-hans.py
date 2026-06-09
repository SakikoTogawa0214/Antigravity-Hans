#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
import subprocess
import sys
import time
import urllib.request
try:
    import winreg
except ImportError:
    winreg = None

import psutil
import websocket

# 获取当前路径及补丁源码
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
OVERLAY_PATH = os.path.join(CURRENT_DIR, 'antigravity-hans-overlay.js')
with open(OVERLAY_PATH, 'r', encoding='utf-8') as f:
    OVERLAY_SOURCE = f.read()

# 应用程序配置
APP_NORMAL = {
    'name': 'Antigravity',
    'exe': 'Antigravity.exe',
    'port': 9223,
    'possible_paths': [
        os.path.join(os.environ.get('LOCALAPPDATA', ''), 'Programs/Antigravity/Antigravity.exe'),
        os.path.join(os.environ.get('ProgramFiles', ''), 'Antigravity/Antigravity.exe')
    ]
}

APP_IDE = {
    'name': 'Antigravity IDE',
    'exe': 'Antigravity IDE.exe',
    'port': 9222,
    'possible_paths': [
        os.path.join(os.environ.get('LOCALAPPDATA', ''), 'Programs/Antigravity IDE/Antigravity IDE.exe'),
        os.path.join(os.environ.get('ProgramFiles', ''), 'Antigravity IDE/Antigravity IDE.exe')
    ]
}

# 根据参数切换配置
APP = APP_IDE if '--ide' in sys.argv else APP_NORMAL

def get_paths_from_registry(app_name, exe_name):
    """尝试从 Windows 注册表获取可执行文件的所有可能路径"""
    paths = set()
    if not winreg:
        return []
    
    # 1. 优先尝试从 App Paths 检索（效率高）
    sub_key = f"Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\{exe_name}"
    for root in (winreg.HKEY_CURRENT_USER, winreg.HKEY_LOCAL_MACHINE):
        try:
            with winreg.OpenKey(root, sub_key) as key:
                path, _ = winreg.QueryValueEx(key, "")
                if path:
                    path = path.strip('\'"')
                    if os.path.exists(path):
                        paths.add(path)
        except OSError:
            continue
            
    # 2. 兜底扫描 Uninstall 列表（兼容性好）
    sub_key_uninstall = r"Software\Microsoft\Windows\CurrentVersion\Uninstall"
    for root in (winreg.HKEY_CURRENT_USER, winreg.HKEY_LOCAL_MACHINE):
        try:
            with winreg.OpenKey(root, sub_key_uninstall) as key:
                info = winreg.QueryInfoKey(key)
                count = info[0]
                for i in range(count):
                    try:
                        subkey_name = winreg.EnumKey(key, i)
                        with winreg.OpenKey(key, subkey_name) as subkey:
                            try:
                                display_name, _ = winreg.QueryValueEx(subkey, "DisplayName")
                            except OSError:
                                display_name = subkey_name
                                
                            if app_name.lower() in display_name.lower() or app_name.lower() in subkey_name.lower():
                                # 优先尝试 InstallLocation
                                try:
                                    loc, _ = winreg.QueryValueEx(subkey, "InstallLocation")
                                    if loc:
                                        loc = loc.strip('\'"')
                                        full_path = os.path.join(loc, exe_name)
                                        if os.path.exists(full_path):
                                            paths.add(full_path)
                                except OSError:
                                    pass
                                    
                                # 备选尝试 DisplayIcon
                                try:
                                    icon, _ = winreg.QueryValueEx(subkey, "DisplayIcon")
                                    if icon:
                                        icon_path = icon.split(',')[0].strip('\'"')
                                        if os.path.exists(icon_path) and icon_path.lower().endswith('.exe'):
                                            paths.add(icon_path)
                                except OSError:
                                    pass
                    except OSError:
                        continue
        except OSError:
            continue
    return list(paths)

# 检测运行状态与安装路径
def detect_app():
    detected = {
        'name': APP['name'],
        'exe': APP['exe'],
        'port': APP['port'],
        'possible_paths': APP['possible_paths'],
        'running': False,
        'path': None,
        'pids': [],
        'all_paths': []
    }

    # 使用 psutil 获取运行中进程的路径和 PID
    try:
        exe_lower = APP['exe'].lower()
        for proc in psutil.process_iter(['pid', 'name', 'exe']):
            try:
                p_name = (proc.info['name'] or '').lower()
                p_exe = (proc.info['exe'] or '').lower()
                if p_name == exe_lower or os.path.basename(p_exe) == exe_lower:
                    detected['running'] = True
                    detected['pids'].append(proc.info['pid'])
                    if p_exe and os.path.exists(p_exe):
                        detected['path'] = p_exe
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                pass
    except Exception:
        pass

    # 寻找安装路径
    all_found_paths = []
    
    # 1. 优先从默认路径探测
    for p in APP['possible_paths']:
        if os.path.exists(p):
            all_found_paths.append(p)
            
    # 2. 若默认路径未检索到，则使用注册表深度检索兜底
    if not all_found_paths:
        reg_paths = get_paths_from_registry(APP['name'], APP['exe'])
        for p in reg_paths:
            if p not in all_found_paths:
                all_found_paths.append(p)
            
    detected['all_paths'] = all_found_paths

    if not detected['path']:
        if len(detected['all_paths']) == 1:
            detected['path'] = detected['all_paths'][0]

    return detected

# 强制结束冲突实例
def kill_process():
    try:
        print(f"正在强制结束已运行的 {APP['name']} 实例...")
        exe_lower = APP['exe'].lower()
        for proc in psutil.process_iter(['pid', 'name', 'exe']):
            try:
                p_name = (proc.info['name'] or '').lower()
                p_exe = (proc.info['exe'] or '').lower()
                if p_name == exe_lower or os.path.basename(p_exe) == exe_lower:
                    proc.kill()
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
    except Exception:
        pass

# 后台启动带调试端口的实例
def launch(app_path, port):
    subprocess.Popen(
        [app_path, f"--remote-debugging-port={port}", "--remote-allow-origins=*"],
        cwd=os.path.dirname(app_path),
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.DETACHED_PROCESS,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )

# 检测调试端口状态
def check_port(port):
    try:
        url = f"http://127.0.0.1:{port}/json/list"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=1.5) as response:
            if response.status == 200:
                targets = json.loads(response.read().decode('utf-8'))
                ignored_types = {'worker', 'service_worker', 'shared_worker', 'background_page'}
                return [t for t in targets if t.get('type') not in ignored_types and t.get('webSocketDebuggerUrl')]
    except Exception:
        pass
    return None

# 调用 CDP 命令
def cdp_call(ws, method, params=None):
    if params is None:
        params = {}
    cdp_call.next_id = getattr(cdp_call, 'next_id', 0) + 1
    call_id = cdp_call.next_id
    payload = json.dumps({
        'id': call_id,
        'method': method,
        'params': params
    })
    ws.send(payload)
    
    start_time = time.time()
    while time.time() - start_time < 5.0:
        try:
            message_raw = ws.recv()
            message = json.loads(message_raw)
            if message.get('id') == call_id:
                return message
        except Exception as e:
            raise RuntimeError(f"接收 CDP 响应失败: {str(e)}")
    raise TimeoutError(f"等待 {method} 响应超时")

injected_targets = set()

# 检测补丁是否已在目标页面激活
def is_target_injected(target):
    ws = None
    try:
        ws = websocket.create_connection(target['webSocketDebuggerUrl'], timeout=2.0)
        res = cdp_call(ws, 'Runtime.evaluate', {'expression': 'window.__antigravityZhPatchInstalled', 'awaitPromise': False})
        val = res.get('result', {}).get('result', {}).get('value')
        return val == 7
    except Exception:
        pass
    finally:
        if ws:
            try:
                ws.close()
            except Exception:
                pass
    return False

# 执行汉化注入
def inject_target(target):
    target_id = target.get('id')
    ws = None
    try:
        ws = websocket.create_connection(target['webSocketDebuggerUrl'], timeout=5.0)
        cdp_call(ws, 'Page.addScriptToEvaluateOnNewDocument', {'source': OVERLAY_SOURCE})
        cdp_call(ws, 'Runtime.evaluate', {'expression': OVERLAY_SOURCE, 'awaitPromise': False})
        if target_id:
            injected_targets.add(target_id)
    finally:
        if ws:
            try:
                ws.close()
            except Exception:
                pass

# 循环等待调试端口就绪并注入
def wait_and_inject(port, max_wait_ms=20000):
    start = time.time()
    while (time.time() - start) * 1000 < max_wait_ms:
        targets = check_port(port)
        if targets:
            count = 0
            for target in targets:
                target_id = target.get('id')
                if target_id in injected_targets and is_target_injected(target):
                    continue
                try:
                    inject_target(target)
                    count += 1
                except Exception as e:
                    print(f"向页面注入失败: {e}")
            if count > 0:
                return count
        time.sleep(0.8)
    return 0

# 监视模式
def watch():
    print(f'启动 {APP["name"]} 汉化监视模式 (每3秒检测一次)...')
    app = detect_app()
    if app['running'] and not check_port(app['port']):
        print(f"检测到 {app['name']} 正在运行但未开启调试，正在重启...")
        kill_process()
        time.sleep(1.0)
        
    app = detect_app()
    if not check_port(app['port']) and not app['running'] and app['path']:
        print(f"正在自动拉起 {app['name']}...")
        launch(app['path'], app['port'])
        
    ever_running = False
    empty_checks = 0
    
    while True:
        app = detect_app()
        if app['running']:
            ever_running = True
            empty_checks = 0
        else:
            if ever_running:
                print(f'检测到 {APP["name"]} 已退出，自动结束汉化监视。')
                break
            else:
                empty_checks += 1
                if empty_checks >= 15:
                    print('超时未检测到运行中的实例，自动结束汉化监视。')
                    break
                    
        active_target_ids = set()
        try:
            targets = check_port(app['port'])
            if targets:
                for target in targets:
                    target_id = target.get('id')
                    if target_id:
                        active_target_ids.add(target_id)
                        if target_id not in injected_targets or not is_target_injected(target):
                            try:
                                inject_target(target)
                                print(f"检测到新页面或页面已重载: {target.get('title', '未命名')} (ID: {target_id})，注入成功。")
                            except Exception as e:
                                print(f"检测到页面但注入失败: {target.get('title', '未命名')} (ID: {target_id}): {e}")
        except Exception:
            pass
            
        injected_to_remove = injected_targets - active_target_ids
        for tid in injected_to_remove:
            injected_targets.discard(tid)
            
        time.sleep(3.0)

# 普通运行模式
def run():
    app = detect_app()
    
    # 1. 尝试对已开启调试端口的实例直接注入
    targets = check_port(app['port'])
    if targets:
        count = 0
        for target in targets:
            target_id = target.get('id')
            if target_id in injected_targets and is_target_injected(target):
                continue
            try:
                inject_target(target)
                count += 1
            except Exception:
                pass
        if count > 0:
            print(f"已成功向已开启调试的 {app['name']} 注入中文汉化。")
            watch()
            return
            
    # 2. 如果没开启调试端口但进程在运行，先强制结束它
    if app['running']:
        print(f"检测到 {app['name']} 正在运行，但未开启调试端口。准备重新拉起...")
        kill_process()
        time.sleep(1.5)
        
    # 3. 确定要启动的应用路径
    target_path = app['path']
    if not target_path:
        if not app['all_paths']:
            print(f"[ERROR] 未能在本机找到 {app['name']} 的安装路径。")
            sys.exit(1)
        elif len(app['all_paths']) == 1:
            target_path = app['all_paths'][0]
        else:
            print(f"\n检测到本机存在多个 {app['name']} 安装实例，请选择启动哪一个：")
            for i, p in enumerate(app['all_paths'], 1):
                print(f" [{i}] {p}")
            try:
                choice_str = input(f"请选择 (1-{len(app['all_paths'])}, 默认 1): ").strip()
                if not choice_str:
                    target_path = app['all_paths'][0]
                else:
                    idx = int(choice_str) - 1
                    if 0 <= idx < len(app['all_paths']):
                        target_path = app['all_paths'][idx]
                    else:
                        print("无效的选择，默认启动第一个实例。")
                        target_path = app['all_paths'][0]
            except ValueError:
                print("\n输入错误，默认启动第一个实例。")
                target_path = app['all_paths'][0]

    # 4. 拉起带调试端口的实例并注入
    if target_path:
        print(f"正在以调试模式启动 {app['name']}: {target_path} ...")
        launch(target_path, app['port'])
        print(f"正在等待 {app['name']} 调试端口就绪并注入...")
        count = wait_and_inject(app['port'], 20000)
        if count > 0:
            print(f"[成功] 已向 {app['name']} 页面应用中文汉化。")
        else:
            print(f"[ERROR] 向 {app['name']} 注入超时，可能是启动过慢或被拦截。")
    else:
        print(f"[ERROR] 未能在本机找到 {app['name']} 的安装路径。")
        sys.exit(1)
        
    watch()

if __name__ == '__main__':
    try:
        if '--watch' in sys.argv:
            watch()
        else:
            run()
    except KeyboardInterrupt:
        print("\n[提示] 汉化监视已由用户终止退出。")
