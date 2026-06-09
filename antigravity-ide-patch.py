#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import base64
import hashlib
import json
import os
import shutil
try:
    import winreg
except ImportError:
    winreg = None

import psutil

# 目标程序配置
APPS = [
    {
        'name': 'Antigravity IDE',
        'exe': 'Antigravity IDE.exe',
        'possible_paths': [
            os.path.join(os.environ.get('LOCALAPPDATA', ''), 'Programs/Antigravity IDE/Antigravity IDE.exe'),
            os.path.join(os.environ.get('ProgramFiles', ''), 'Antigravity IDE/Antigravity IDE.exe')
        ]
    }
]

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
OVERLAY_JS_SRC = os.path.join(CURRENT_DIR, 'antigravity-hans-overlay.js')

def check_process_running(exe_name):
    """检测指定可执行文件是否有进程在运行"""
    exe_lower = exe_name.lower()
    running_pids = []
    for proc in psutil.process_iter(['pid', 'name', 'exe']):
        try:
            p_name = (proc.info['name'] or '').lower()
            p_exe = (proc.info['exe'] or '').lower()
            if p_name == exe_lower or os.path.basename(p_exe) == exe_lower:
                running_pids.append(proc.info['pid'])
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    return running_pids

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

def get_installed_apps():
    """获取本机已安装且能匹配到的 App 信息和路径"""
    installed = []
    for app in APPS:
        paths = []
        
        # 1. 优先从默认路径收集
        for p in app['possible_paths']:
            if os.path.exists(p):
                paths.append(p)
                
        # 2. 若默认路径未检索到，则使用注册表深度检索兜底
        if not paths:
            reg_paths = get_paths_from_registry(app['name'], app['exe'])
            for p in reg_paths:
                if p not in paths:
                    paths.append(p)
                
        # 3. 将所有检测到的路径转为独立的实例项
        for p in paths:
            installed.append({
                'name': f"{app['name']} ({p})",
                'exe': app['exe'],
                'exe_path': p,
                'dir': os.path.dirname(p)
            })
    return installed

def install_patch(app):
    """执行汉化注入"""
    print(f"\n>>> 正在为 {app['name']} 注入汉化补丁...")
    
    # 检测运行状态
    pids = check_process_running(app['exe'])
    if pids:
        print(f"[警告] 检测到 {app['name']} 正在运行 (PID: {pids})。")
        print("为了避免文件被系统占用，请先手动关闭该应用，然后重新运行本脚本。")
        return False
        
    resources_dir = os.path.join(app['dir'], "resources")
    app_dir = os.path.join(resources_dir, "app")
    
    try:
        # 检测核心资源目录是否存在
        if not os.path.exists(os.path.join(app_dir, "package.json")):
            print(f"[错误] 未找到核心资源目录 app 目录或 package.json 缺失")
            return False
            
        # 此时资源都在 app_dir 目录下
        workbench_dir = os.path.join(app_dir, "out", "vs", "code", "electron-browser", "workbench")
        
        # 前置检测是否已经注入过
        already_injected = False
        html_files_check = ["workbench.html", "workbench-jetski-agent.html"]
        if os.path.exists(workbench_dir):
            for html_name in html_files_check:
                html_path = os.path.join(workbench_dir, html_name)
                if os.path.exists(html_path):
                    try:
                        with open(html_path, 'r', encoding='utf-8') as f:
                            if '<script src="./antigravity-hans-overlay.js"></script>' in f.read():
                                already_injected = True
                                break
                    except Exception:
                        pass
        
        if already_injected:
            print(f"\n[提示] 检测到 {app['name']} 已经注入过汉化补丁，无需重复注入。")
            return False
            
        # 判断是否是 VS Code 架构 (有 workbench 文件夹)
        if os.path.exists(workbench_dir):
            print(f"[提示] 识别为 VS Code 架构，将通过修改 HTML 注入补丁...")
            
            # 拷贝 antigravity-hans-overlay.js
            overlay_dest = os.path.join(workbench_dir, "antigravity-hans-overlay.js")
            try:
                shutil.copy2(OVERLAY_JS_SRC, overlay_dest)
                print(f"[成功] 拷贝补丁源文件至: {overlay_dest}")
            except Exception as e:
                print(f"[错误] 拷贝补丁文件失败: {e}")
                return False
                
            # 修改 HTML 注入标签
            html_files = ["workbench.html", "workbench-jetski-agent.html"]
            for html_name in html_files:
                html_path = os.path.join(workbench_dir, html_name)
                if not os.path.exists(html_path):
                    continue
                    
                bak_path = html_path + ".bak"
                
                try:
                    if not os.path.exists(bak_path):
                        shutil.copy2(html_path, bak_path)
                        print(f"[成功] 已创建备份: {bak_path}")
                        
                    with open(html_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    script_tag = '<script src="./antigravity-hans-overlay.js"></script>'
                    if script_tag in content:
                        print(f"[提示] {html_name} 已经包含汉化注入标签，跳过。")
                        continue
                        
                    if '<!-- Startup' in content:
                        content = content.replace('<!-- Startup', f'{script_tag}\n<!-- Startup')
                    else:
                        content = content.replace('</body>', f'{script_tag}\n</body>')
                        
                    with open(html_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"[成功] 已更新 HTML 文件: {html_name}")
                    
                except Exception as e:
                    print(f"[错误] 修改 {html_name} 失败: {e}")
                    return False
                    
            # 更新 product.json 的校验和
            product_json_path = os.path.join(app_dir, "product.json")
            if os.path.exists(product_json_path):
                product_json_bak = product_json_path + ".bak"
                try:
                    if not os.path.exists(product_json_bak):
                        shutil.copy2(product_json_path, product_json_bak)
                        print(f"[成功] 已创建备份: {product_json_bak}")
                    
                    with open(product_json_path, 'r', encoding='utf-8') as f:
                        product_data = json.load(f)
                        
                    if "checksums" in product_data:
                        for html_name in html_files:
                            html_path = os.path.join(workbench_dir, html_name)
                            if not os.path.exists(html_path):
                                continue
                                
                            with open(html_path, 'rb') as hf:
                                html_content = hf.read()
                                
                            sha256_hash = hashlib.sha256(html_content).digest()
                            b64_hash = base64.b64encode(sha256_hash).decode('utf-8').rstrip('=')
                            
                            key = f"vs/code/electron-browser/workbench/{html_name}"
                            product_data["checksums"][key] = b64_hash
                            
                        with open(product_json_path, 'w', encoding='utf-8') as f:
                            json.dump(product_data, f, indent='\t', ensure_ascii=False)
                        print(f"[成功] 已更新 product.json 校验和")
                except Exception as e:
                    print(f"[错误] 更新 product.json 校验和失败: {e}")
        else:
            print(f"[错误] 无法识别应用架构（未找到 workbench 目录）")
            return False
            
        print(f"[完成] {app['name']} 静态注入完成！请启动应用查看效果。")
        return True
        
    except KeyboardInterrupt:
        print("\n[警告] 检测到键盘中断 (Ctrl+C)！正在还原修改...")
        try:
            uninstall_patch(app)
        except Exception:
            pass
        print("[完成] 已安全退出。")
        return False

def uninstall_patch(app):
    """执行还原卸载"""
    print(f"\n>>> 正在还原 {app['name']} 至原始状态...")
    
    # 检测运行状态
    pids = check_process_running(app['exe'])
    if pids:
        print(f"[警告] 检测到 {app['name']} 正在运行 (PID: {pids})。")
        print("为了避免还原失败，请先手动关闭该应用。")
        return False
        
    resources_dir = os.path.join(app['dir'], "resources")
    app_dir = os.path.join(resources_dir, "app")
    
    try:
        workbench_dir = os.path.join(app_dir, "out", "vs", "code", "electron-browser", "workbench")
        restored = False
        
        # 还原 workbench 架构
        if os.path.exists(workbench_dir):
            html_files = ["workbench.html", "workbench-jetski-agent.html"]
            for html_name in html_files:
                html_path = os.path.join(workbench_dir, html_name)
                bak_path = html_path + ".bak"
                
                try:
                    if os.path.exists(bak_path):
                        shutil.move(bak_path, html_path)
                        print(f"[成功] 已根据备份文件还原: {html_name}")
                        restored = True
                    else:
                        if os.path.exists(html_path):
                            with open(html_path, 'r', encoding='utf-8') as f:
                                content = f.read()
                            script_tag = '<script src="./antigravity-hans-overlay.js"></script>'
                            if script_tag in content:
                                content = content.replace(script_tag + '\n', '').replace(script_tag, '')
                                with open(html_path, 'w', encoding='utf-8') as f:
                                    f.write(content)
                                print(f"[成功] 清除了 {html_name} 中的注入标签")
                                restored = True
                except Exception as e:
                    print(f"[错误] 还原 {html_name} 失败: {e}")
                    
            overlay_dest = os.path.join(workbench_dir, "antigravity-hans-overlay.js")
            if os.path.exists(overlay_dest):
                try:
                    os.remove(overlay_dest)
                    print(f"[成功] 已删除补丁文件: {overlay_dest}")
                    restored = True
                except Exception as e:
                    print(f"[错误] 删除补丁文件失败: {e}")
                    
            product_json_path = os.path.join(app_dir, "product.json")
            product_json_bak = product_json_path + ".bak"
            if os.path.exists(product_json_bak):
                try:
                    shutil.move(product_json_bak, product_json_path)
                    print(f"[成功] 已根据备份文件还原: product.json")
                    restored = True
                except Exception as e:
                    print(f"[错误] 还原 product.json 失败: {e}")
                    
        if restored:
            print(f"[完成] {app['name']} 还原操作完毕。")
        else:
            print(f"[提示] 未检测到有效的汉化备份或文件，无需还原。")
        return True
    except KeyboardInterrupt:
        print("\n[警告] 检测到键盘中断 (Ctrl+C)！还原操作未完成。")
        return False

def main():
    try:
        print("Antigravity-Hans 静态注入工具")
        print("----------------------------------------")
        
        if not os.path.exists(OVERLAY_JS_SRC):
            print(f"[ERROR] 当前目录下未找到 antigravity-hans-overlay.js，脚本退出。")
            return
            
        apps = get_installed_apps()
        if not apps:
            print("[ERROR] 本机未检测到任何 Antigravity IDE 安装实例。")
            return
            
        for app in apps:
            print(f"检测到实例: {app['name']}")
            
        print("\n请选择您要执行的操作：")
        print(" 1. 注入静态汉化")
        print(" 2. 还原")
        print(" 3. 退出")
        print("----------------------------------------")
        
        choice = input("选择 (1-3): ").strip()
        if choice not in ('1', '2'):
            print("已退出。")
            return

        if len(apps) == 1:
            target_apps = apps
        else:
            print(f"\n请选择要操作的应用实例：")
            for i, app in enumerate(apps, 1):
                print(f" [{i}] {app['name']}")
            print(f" [{len(apps) + 1}] 全部应用")
            print(f" [{len(apps) + 2}] 取消")
            
            app_choice_str = input(f"\n选择 (1-{len(apps) + 2}): ").strip()
            try:
                app_choice = int(app_choice_str)
            except ValueError:
                print("无效的选择，操作取消。")
                return
                
            if app_choice == len(apps) + 2:
                print("操作已取消。")
                return
            elif app_choice == len(apps) + 1:
                target_apps = apps
            elif 1 <= app_choice <= len(apps):
                target_apps = [apps[app_choice - 1]]
            else:
                print("无效的选择，操作取消。")
                return
                
        # 执行对应的操作
        if choice == '1':
            for app in target_apps:
                install_patch(app)
        elif choice == '2':
            for app in target_apps:
                uninstall_patch(app)
    except KeyboardInterrupt:
        print("\n[提示] 操作已由用户取消，退出。")

if __name__ == '__main__':
    main()
