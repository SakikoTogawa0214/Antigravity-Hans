(() => {
  if (typeof window === 'undefined') return;
  if (window.__antigravityZhPatchInstalled === 7 && window.__observedDocument === document) return;
  window.__antigravityZhPatchInstalled = 7;
  window.__observedDocument = document;

  const phrases = new Map([
    ['Go', '转到'],
    ['On', '开启'],
    ['Add', '添加'],
    ['App', '应用'],
    ['Low', '低'],
    ['now', '刚刚'],
    ['Off', '关闭'],
    ['Ran', '已运行'],
    ['Run', '运行'],
    ['Use', '使用'],
    ['Copy', '复制'],
    ['Edit', '编辑'],
    ['Fast', '快'],
    ['File', '文件'],
    ['Help', '帮助'],
    ['High', '高'],
    ['None', '无'],
    ['Open', '打开'],
    ['Quit', '退出'],
    ['Read', '读取'],
    ['Skip', '跳过'],
    ['Slow', '慢'],
    ['View', '视图'],
    ['Close', '关闭'],
    ['Email', '邮箱'],
    ['Local', '本地'],
    ['Rules', '规则'],
    ['Strict', '严格'],
    ['Accent', '强调色'],
    ['Cancel', '取消'],
    ['Custom', '自定义'],
    ['Delete', '删除'],
    ['Edited', '已编辑'],
    ['Editor', '编辑器'],
    ['Export', '导出'],
    ['Global', '全局'],
    ['Log in', '登录'],
    ['Medium', '中'],
    ['Models', '模型'],
    ['Picker', '选择器'],
    ['Pinned', '已固定'],
    ['Preset', '预设'],
    ['Recent', '最近使用'],
    ['Rename', '重命名'],
    ['Review', '审核'],
    ['Search', '搜索'],
    ['Skills', '技能'],
    ['Snooze', '稍后提醒'],
    ['Status', '状态'],
    ['Submit', '提交'],
    ['System', '系统'],
    ['Value:', '当前值：'],
    ['Window', '窗口'],
    ['Account', '账户'],
    ['Actions', '操作'],
    ['Add MCP', '添加 MCP'],
    ['Browser', '浏览器'],
    ['Context', '上下文'],
    ['Default', '默认'],
    ['Deleted', '已删除'],
    ['Dismiss', '忽略'],
    ['Enabled', '已启用'],
    ['General', '常规'],
    ['Go Back', '后退'],
    ['History', '历史'],
    ['Proceed', '继续'],
    ['Project', '项目'],
    ['Refresh', '刷新'],
    ['Science', '科学'],
    ['Sidebar', '侧边栏'],
    ['Upgrade', '升级'],
    ['Working', '正在工作'],
    ['Zoom In', '放大'],
    ['[MODIFY]', '[修改]'],
    ['Advanced', '高级'],
    ['Archived', '已归档'],
    ['Disabled', '已禁用'],
    ['Download', '下载'],
    ['Explored', '已探索'],
    ['Feedback', '反馈'],
    ['Group By', '分组方式'],
    ['Maximize', '最大化'],
    ['Minimize', '最小化'],
    ['Open App', '打开应用'],
    ['Open URL', '打开 URL'],
    ['Planning', '规划'],
    ['Projects', '项目'],
    ['Searched', '已搜索'],
    ['See less', '收起'],
    ['Settings', '设置'],
    ['Show all', '显示全部'],
    ['Sign Out', '退出登录'],
    ['Terminal', '终端'],
    ['Worktree', '工作树'],
    ['Zoom Out', '缩小'],
    ['Add Model', '添加模型'],
    ['Copy Path', '复制路径'],
    ['Copy path', '复制路径'],
    ['Customize', '自定义'],
    ['Knowledge', '知识库'],
    ['Launchpad', '启动台'],
    ['MCP Tools', 'MCP 工具'],
    ['Read URLs', '读取 URL'],
    ['Sandboxed', '沙盒化'],
    ['Searching', '正在搜索'],
    ['Selection', '选择'],
    ['Shortcuts', '快捷键'],
    ['Subtitles', '副标题'],
    ['Tab Speed', 'Tab 补全速度'],
    ['Add Folder', '添加文件夹'],
    ['Allow Once', '允许一次'],
    ['Allow once', '允许一次'],
    ['Always Ask', '始终询问'],
    ['Appearance', '外观'],
    ['Automation', '自动化'],
    ['Background', '背景色'],
    ['Bug Report', '错误报告'],
    ['Dark Theme', '深色主题'],
    ['Date Added', '添加日期'],
    ['Edit Model', '编辑模型'],
    ['File Reads', '文件读取'],
    ['Foreground', '前景色'],
    ['Go Forward', '前进'],
    ['Learn more', '了解更多'],
    ['Navigation', '导航'],
    ['No Project', '无项目'],
    ['Read Files', '读取文件'],
    ['Reset Zoom', '重置缩放'],
    ['Turbo mode', '极速模式'],
    ['View Debug', '查看调试信息'],
    ['Working...', '正在工作...'],
    ['Workspaces', '工作区'],
    ['Your Plan:', '您的套餐：'],
    ['Add context', '添加上下文'],
    ['Auto Execution', '自动执行'],
    ['Application', '应用'],
    ['Cancel Task', '取消任务'],
    ['Copy prompt', '复制提示词'],
    ['Delete Task', '删除任务'],
    ['Description', '描述'],
    ['Enable Task', '启用任务'],
    ['File Access', '文件访问'],
    ['File Writes', '文件写入'],
    ['Focus Input', '聚焦输入框'],
    ['Full access', '完全访问'],
    ['Light Theme', '浅色主题'],
    ['Marketplace', '插件市场'],
    ['Model Quota', '模型额度'],
    ['New Project', '新建项目'],
    ['No Subtitle', '无副标题'],
    ['Open Folder', '打开文件夹'],
    ['Permissions', '权限'],
    ['Quick Start', '快速开始'],
    ['Recommended', '推荐'],
    ['Suggestions', '建议'],
    ['Tab to Jump', '按下 Tab 跳转'],
    ['Token Usage', 'Token 使用量'],
    ['Write Files', '写入文件'],
    ['打开 in Cider', '在 Cider 中打开'],
    ['Always Allow', '始终允许'],
    ['App Settings', '应用设置'],
    ['Bad response', '差评'],
    ['Browser Task', '浏览器任务'],
    ['Close Folder', '关闭文件夹'],
    ['Confirm Quit', '确认退出'],
    ['Conversation', '对话'],
    ['Copy Command', '复制命令'],
    ['Copy Content', '复制内容'],
    ['Default Dark', '默认深色'],
    ['Disable Task', '禁用任务'],
    ['Execute URLs', '执行 URL'],
    ['Find in Pane', '在面板中查找'],
    ['Full machine', '整机访问'],
    ['Last Updated', '最近更新'],
    ['Mark As Read', '标记为已读'],
    ['Mark as Read', '标记为已读'],
    ['New Worktree', '新建工作树'],
    ['Record Audio', '录制音频'],
    ['Restart Task', '重启任务'],
    ['Select Model', '选择模型'],
    ['User message', '用户消息'],
    ['打开 window...', '打开窗口...'],
    ['Agent Decides', '由智能体决定'],
    ['Allow options', '允许选项'],
    ['Chat Settings', '聊天设置'],
    ['Conversations', '对话'],
    ['Default Light', '默认浅色'],
    ['Feedback Type', '反馈类型'],
    ['Good response', '好评'],
    ['Inherits from', '继承自'],
    ['Message input', '消息输入框'],
    ['Model Credits', '模型积分'],
    ['New Workspace', '新建工作区'],
    ['Notifications', '通知'],
    ['Open Settings', '打开设置'],
    ['Prevent Sleep', '防止睡眠'],
    ['Project Agent', '项目智能体'],
    ['Review Policy', '审核策略'],
    ['Send Feedback', '发送反馈'],
    ['Tab to Import', '按下 Tab 导入'],
    ['Toggle Editor', '切换编辑器'],
    ['Agent Behavior', '智能体行为'],
    ['Agent response', '智能体回复'],
    ['Always Proceed', '始终继续'],
    ['Copy File Name', '复制文件名'],
    ['Copy File Path', '复制文件路径'],
    ['Create Project', '创建项目'],
    ['Customizations', '自定义'],
    ['Delete Project', '删除项目'],
    ['Go to Projects', '前往项目'],
    ['Import failed:', '导入失败：'],
    ['Mark As Unread', '标记为未读'],
    ['Mark as Unread', '标记为未读'],
    ['Missing Folder', '缺失文件夹'],
    ['No MCP Servers', '没有 MCP 服务器'],
    ['Not in Project', '未在项目中'],
    ['Open Workspace', '打开工作区'],
    ['Opened browser', '已打开浏览器'],
    ['Proceeded with', '已执行'],
    ['Project picker', '项目选择器'],
    ['Request Review', '请求审核'],
    ['Require Review', '需要审核'],
    ['Review Changes', '审核更改'],
    ['Select Project', '选择项目'],
    ['Toggle Sidebar', '切换侧边栏'],
    ['Typeahead menu', '自动补全菜单'],
    ['Actual behavior', '实际行为'],
    ['Background Task', '后台任务'],
    ['Command Palette', '命令面板'],
    ['Copy debug info', '复制调试信息'],
    ['Display Options', '显示选项'],
    ['Editor Settings', '编辑器设置'],
    ['Feature Request', '功能请求'],
    ['global settings', '全局设置'],
    ['Import success:', '导入成功：'],
    ['Layout Controls', '布局控制'],
    ['Message history', '消息历史'],
    ['Missing Folders', '缺失文件夹'],
    ['Project Folders', '项目文件夹'],
    ['Project General', '项目常规'],
    ['Scheduled Tasks', '定时任务'],
    ['Search files...', '搜索文件...'],
    ['Search tasks...', '搜索任务...'],
    ['Security Preset', '安全预设'],
    ['Add Custom Model', '添加自定义模型'],
    ['Auth and Billing', '身份验证与账单'],
    ['Background Tasks', '后台任务'],
    ['Best of N Models', 'Best of N 模型'],
    ['Browser CDP Port', '浏览器 CDP 端口'],
    ['Cancel All Tasks', '取消全部任务'],
    ['Create a Project', '创建项目'],
    ['Enable Telemetry', '启用遥测'],
    ['File Permissions', '文件权限'],
    ['General Feedback', '一般反馈'],
    ['Keep In Menu Bar', '保留在菜单栏'],
    ['Marketing Emails', '营销邮件'],
    ['New Conversation', '新建对话'],
    ['New conversation', '新建对话'],
    ['No conversations', '暂无对话'],
    ['Open Preferences', '打开偏好设置'],
    ['Pin Conversation', '固定对话'],
    ['Project Detected', '检测到项目'],
    ['Project Settings', '项目设置'],
    ['Provide Feedback', '提供反馈'],
    ['Terms of Service', '服务条款'],
    ['打开 in workspace:', '在工作区打开：'],
    ['打开 浏览器 (Preview)', '打开浏览器 (预览)'],
    ['Advanced Settings', '高级设置'],
    ['Analyzed Task Log', '已分析任务日志'],
    ['Archive / Restore', '归档 / 恢复'],
    ['Check for Updates', '检查更新'],
    ['Copy sign-in link', '复制登录链接'],
    ['Copy to clipboard', '复制到剪贴板'],
    ['Edit Custom Model', '编辑自定义模型'],
    ['Expected behavior', '预期行为'],
    ['File Access Rules', '文件访问规则'],
    ['No agents running', '没有正在运行的代理'],
    ['No Model Selected', '未选择模型'],
    ['No projects found', '未找到项目'],
    ['Open Conversation', '打开对话'],
    ['Record voice memo', '录制语音备忘'],
    ['Sort Conversation', '排序对话'],
    ['Terminal Commands', '终端命令'],
    ['Add Scheduled Task', '添加定时任务'],
    ['Alphabetical (A-Z)', '按字母顺序 (A-Z)'],
    ['Analyzing Task Log', '正在分析任务日志'],
    ['Any error messages', '任何错误信息'],
    ['Best of N Settings', 'Best of N 设置'],
    ['Chrome Binary Path', 'Chrome 可执行文件路径'],
    ['Copy trajectory ID', '复制轨迹 ID'],
    ['Create New Project', '创建新项目'],
    ['Creating a Project', '正在创建项目'],
    ['Delete Permanently', '永久删除'],
    ['New Scheduled Task', '新建定时任务'],
    ['Outside of Project', '项目外'],
    ['Previous Worktrees', '以前的工作树'],
    ['Proceed in Sandbox', '在沙盒中继续'],
    ['Search projects...', '搜索项目...'],
    ['Sort Conversations', '排序对话'],
    ['Steps to Reproduce', '重现步骤'],
    ['Unpin Conversation', '取消固定对话'],
    ['Verbose agent chat', '详细的智能体对话'],
    ['Advanced Web Access', '高级网页访问'],
    ['Agent security mode', '智能体安全模式'],
    ['Conversation picker', '对话选择器'],
    ['Delete Conversation', '删除对话'],
    ['Loading Antigravity', '正在加载 Antigravity'],
    ['Model quota reached', '模型额度已达上限'],
    ['Modern Web Guidance', '现代 Web 开发指南'],
    ['Network Permissions', '网络权限'],
    ['Open Project Picker', '打开项目选择器'],
    ['Open System Browser', '在系统浏览器中打开'],
    ['Other Conversations', '其他对话'],
    ['Parent Conversation', '父对话'],
    ['Pinned Conversation', '已固定对话'],
    ['[Dev] GCP Project ID', '[开发] GCP 项目 ID'],
    ['Advanced File Access', '高级文件访问'],
    ['Agent Auto-Fix Lints', '智能体自动修复 Lint 错误'],
    ['Archive Conversation', '归档对话'],
    ['Build With Google 插件', '使用 Google 插件构建'],
    ['Conversation History', '对话历史'],
    ['Enable Browser Tools', '启用浏览器工具'],
    ['Enter URL pattern...', '输入 URL 匹配模式...'],
    ['Marketplace Item URL', '插件市场单项 URL'],
    ['Network Access Rules', '网络访问规则'],
    ['No conversations yet', '暂无对话'],
    ['Open Agent on Reload', '重新加载时打开智能体'],
    ['Open Command Palette', '打开命令面板'],
    ['Pinned Conversations', '已固定对话'],
    ['Restore Conversation', '恢复对话'],
    ['Search all convos...', '搜索全部对话...'],
    ['Tab Gitignore Access', 'Tab 键访问 .gitignore 排除文件'],
    ['Yes, allow this time', '是，仅允许本次'],
    ['打开 in current window', '在当前窗口打开'],
    ['Allow in Conversation', '在本次对话中允许'],
    ['Auto-Execution Policy', '自动执行策略'],
    ['Installed MCP Servers', '已安装的 MCP 服务器'],
    ['Model quota exhausted', '模型额度已耗尽'],
    ['Open project settings', '打开项目设置'],
    ['Opened URL in Browser', '已在浏览器中打开 URL'],
    ['Suggestions in Editor', '编辑器内联建议'],
    ['Toggle Auxiliary Pane', '切换辅助面板'],
    ['Toggle Model Selector', '切换模型选择器'],
    ['Workspace File Access', '工作区文件访问'],
    ['Artifact Review Policy', '产物审核策略'],
    ['Auto-Open Edited Files', '自动打开已编辑文件'],
    ['Background Task Output', '后台任务输出'],
    ['Copy the trajectory ID', '复制轨迹 ID'],
    ['Edit permission target', '编辑权限目标'],
    ['Highlight After Accept', '接受后高亮'],
    ['My Custom Gemini Model', '我的自定义 Gemini 模型'],
    ['Opening URL in Browser', '正在浏览器中打开 URL'],
    ['quota and credits data', '额度和积分数据'],
    ['Search across files...', '跨文件搜索...'],
    ['Show Selection Actions', '显示选择操作'],
    ['Toggle Developer Tools', '切换开发者工具'],
    ['Toggle Voice Recording', '切换语音录制'],
    ['Advanced Command Access', '高级命令访问'],
    ['Back to Scheduled Tasks', '返回定时任务'],
    ['Browser Actuation Rules', '浏览器操作规则'],
    ['Deny setting up browser', '拒绝设置浏览器'],
    ['Edit Conversation Title', '编辑对话标题'],
    ['Enable Sounds for Agent', '启用智能体提示音'],
    ['Marketplace Gallery URL', '插件市场列表 URL'],
    ['Open Keyboard Shortcuts', '打开键盘快捷键'],
    ['Open System Preferences', '打开系统设置'],
    ['Open Workspace Selector', '打开工作区选择器'],
    ['Search conversations...', '搜索对话...'],
    ['Standalone Conversation', '独立对话'],
    ['Any relevant information', '任何相关信息'],
    ['Commands Outside Sandbox', '沙盒外命令'],
    ['Enable Shell Integration', '启用 Shell 集成'],
    ['Import AI Studio Project', '导入 AI Studio 项目'],
    ['Launching the browser...', '正在启动浏览器...'],
    ['Open Conversation Picker', '打开对话选择器'],
    ['Project name. E.g. Tasks', '项目名称，例如 Tasks'],
    ['Workspace Command Access', '工作区命令访问'],
    ['Your Plan: Google AI Pro', '你的套餐：Google AI Pro'],
    ['Archive this conversation', '归档此对话'],
    ['Browser User Profile Path', '浏览器用户资料路径'],
    ['Build With Google Plugins', '使用 Google 插件构建'],
    ['Enable AI Credit Overages', '启用 AI 积分超额使用'],
    ['Open Conversation History', '打开对话历史'],
    ['Paths the agent can read.', '智能体可读取的路径。'],
    ['Project validation failed', '项目验证失败'],
    ['Project-Specific Settings', '项目专属设置'],
    ['Select Python Interpreter', '选择 Python 解释器'],
    ['Toggle Agent (Ctrl+Alt+B)', '切换智能体 (Ctrl+Alt+B)'],
    ['刷新 quota and credits data', '刷新额度和积分数据'],
    ['Click to copy full command', '点击复制完整命令'],
    ['Copy conversation markdown', '复制对话 Markdown'],
    ['Copy full URL to clipboard', '复制完整 URL 到剪贴板'],
    ['Search MCP servers by name', '按名称搜索 MCP 服务器'],
    ['Allow running this command?', '允许运行此命令？'],
    ['Confirm Browser Interaction', '确认浏览器交互'],
    ['Deny List Terminal Commands', '终端命令拒绝列表'],
    ['Explore the new Antigravity', '探索新版 Antigravity'],
    ['New Conversation in Project', '在项目中新建对话'],
    ['Paths the agent can modify.', '智能体可修改的路径。'],
    ['Allow List Terminal Commands', '终端命令允许列表'],
    ['Auto-Expand Changes Overview', '自动展开更改概览'],
    ['Download the Antigravity IDE', '下载 Antigravity IDE'],
    ['Enter tool name or server...', '输入工具名称或服务器...'],
    ['Manage application settings.', '管理应用设置。'],
    ['Select Model to Send Message', '选择用于发送消息的模型'],
    ['Steps to reproduce the issue', '重现此问题的步骤'],
    ['Enable Sandbox Mode (Preview)', '启用沙盒模式（预览）'],
    ['New Conversation in Workspace', '在工作区中新建对话'],
    ['Attach a screenshot (optional)', '附上截图（可选）'],
    ['Attach Antigravity server logs', '附上 Antigravity 服务器日志'],
    ['Getting started with a Project', '开始使用项目'],
    ['Refresh quota and credits data', '刷新额度和积分数据'],
    ['Terminal & Tooling Permissions', '终端与工具权限'],
    ['Agent Non-Workspace File Access', '智能体非工作区文件访问'],
    ['Enter file or directory path...', '输入文件或目录路径...'],
    ['Search by name or Cascade ID...', '按名称或 Cascade ID 搜索...'],
    ['Terminal Command Auto Execution', '终端命令自动执行'],
    ['Welcome to the new Antigravity!', '欢迎使用新版 Antigravity！'],
    ['Select one of the three options.', '选择以下三个选项之一。'],
    ['Set the speed of tab suggestions', '设置 Tab 建议的显示速度'],
    ['Initializing virtual environments', '正在初始化虚拟环境'],
    ['Open Agent panel on window reload', '窗口重新加载时打开智能体面板'],
    ['Build with Antigravity IDE Plugins', '使用 Antigravity IDE 插件构建'],
    ['Search for files in the project...', '在项目中搜索文件...'],
    ['Browser Javascript Execution Policy', '浏览器 JavaScript 执行策略'],
    ['By using this app, you agree to its', '使用本应用即表示你同意其'],
    ['Describe the bug you encountered...', '请描述您遇到的错误...'],
    ['Enter command (e.g., git, blaze)...', '输入命令（例如 git、blaze）...'],
    ['Configure allowed terminal commands.', '配置允许的终端命令。'],
    ['Manage your notification preferences.', '管理您的通知偏好设置。'],
    ['Outside of folders file access policy', '文件夹外访问策略'],
    ['Select where to open the conversation', '选择在哪里打开对话'],
    ['Allow/deny specific terminal commands.', '允许或拒绝指定终端命令。'],
    ['Google Drive integration not available', 'Google 云端硬盘集成不可用'],
    ['No (tell the agent what to do instead)', '否（告诉智能体改做什么）'],
    ['Block all browser JavaScript execution.', '阻止所有浏览器 JavaScript 执行。'],
    ['Explain and Fix in Current Conversation', '在当前对话中解释并修复'],
    ['GCP Project ID for enterprise features.', '适用于企业级功能的 GCP 项目 ID。'],
    ['Local permissions have higher priority.', '本地权限优先级更高。'],
    ['Manually customize individual settings.', '手动自定义各项设置。'],
    ['Configure AI models and view your quota.', '配置 AI 模型并查看额度。'],
    ['Terminal commands the agent can execute.', '智能体可执行的终端命令。'],
    ['Ask anything, @ to mention, / for actions', '想问什么都可以，@ 引用，/ 执行动作'],
    ['Antigravity would like to use the browser.', 'Antigravity 想要使用浏览器。'],
    ['Confirmation required to execute this step', '执行此步骤需要确认'],
    ['Folder no longer exists or is unavailable.', '文件夹不再存在或不可用。'],
    ['Show suggestions when typing in the editor', '在编辑器中输入时显示建议'],
    ['% of the customization budget is available.', '% 的自定义预算可用。'],
    ['Configure the browser subagent. It requires', '配置浏览器子智能体。它需要'],
    ['No customizations found for this workspace.', '此工作区没有找到自定义内容。'],
    ['Conversation copied as Markdown to clipboard', '对话已作为 Markdown 复制到剪贴板'],
    ['Please list the steps to reproduce the issue', '请列出重现此问题的步骤'],
    ['Search conversations (by name or Cascade ID)', '搜索对话（按名称或 Cascade ID）'],
    ['Configure allowed and denied URLs for reading.', '配置允许和拒绝读取的 URL。'],
    ['Continue conversation in the current workspace', '在当前工作区继续对话'],
    ['Commands the agent can run outside the sandbox.', '智能体可在沙盒外运行的命令。'],
    ['Configure allowed commands outside the sandbox.', '配置允许在沙盒外运行的命令。'],
    ['Curated collection of agent skills for science.', '为科学领域精心挑选的智能体技能集合。'],
    ['Select light, dark, or inherit system settings.', '选择浅色、深色或继承系统设置。'],
    ['URLs the agent can read or open in the browser.', '智能体可读取或在浏览器中打开 of URL。'],
    ['Display and preserve intermediate thinking steps', '显示并保留中间思考步骤'],
    ['Import feature is not available in this context.', '当前上下文中无法使用导入功能。'],
    ['URLs the agent can actuate on using the browser.', '智能体可通过浏览器执行操作的 URL。'],
    ['New standalone conversation, outside of projects.', '新建独立对话，不属于任何项目。'],
    ['Configure editor-specific behaviors and shortcuts.', '配置编辑器特有的行为和快捷键。'],
    ['Prompt for approval before running browser scripts.', '运行浏览器脚本前请求批准。'],
    ['Quickly add and update imports with a tab keypress.', '按下 Tab 键快速添加和更新导入。'],
    ['Search for MCP servers to add to your configuration', '搜索要添加到配置中的 MCP 服务器'],
    ['Using the Antigravity Python SDK to build AI agents', '使用 Antigravity Python SDK 构建 AI 智能体'],
    ['You currently don\'t have any MCP Servers installed.', '您当前还没有安装任何 MCP 服务器。'],
    ['Configure external tools via Model Context Protocol.', '配置通过 Model Context Protocol 使用的外部工具。'],
    ['Keyboard shortcuts for quick navigation and control.', '用于快速导航和控制的键盘快捷键。'],
    ['Configure default behaviors, skills, and MCP servers.', '配置默认行为、技能和 MCP 服务器。'],
    ['Allow full browser script execution without prompting.', '允许完整执行浏览器脚本且不再提示。'],
    ['Allow/deny agent command execution outside the sandbox.', '允许或拒绝智能体在沙盒外执行命令。'],
    ['Manage your plan, credentials, and general preferences.', '管理你的套餐、凭据和通用偏好设置。'],
    ['Configure allowed and denied URLs for browser actuation.', '配置允许和拒绝浏览器执行操作的 URL。'],
    ['Core tools and knowledge required to develop for Android', '开发 Android 应用所需的核心工具与知识'],
    ['Allow/deny agent read access to specific URLs or domains.', '允许或拒绝智能体读取指定 URL 或域名。'],
    ['Configure global allowed and denied resource permissions.', '配置全局允许和拒绝的资源权限。'],
    ['Restricts agent tools to a secure, isolated local sandbox.', '将智能体工具限制在安全隔离的本地沙盒中。'],
    ['Allow/deny agent browser actuation access to specific URLs.', '允许或拒绝智能体对指定 URL 执行浏览器操作。'],
    ['Configure the agent\'s visual theme and display preferences.', '配置智能体的视觉主题与显示偏好。'],
    ['Open files in the background if Agent creates or edits them', '当智能体创建或编辑文件时，在后台打开这些文件'],
    ['Disables all safety barriers for maximal iteration velocity.', '禁用所有安全屏障，以获得最大的迭代速度。'],
    ['Prevent the computer from sleeping while the app is running.', '应用运行时防止电脑进入睡眠。'],
    ['Configure allowed and denied paths for file reads and writes.', '配置允许和拒绝读写的文件路径。'],
    ['External tools the agent can call via Model Context Protocol.', '智能体可通过 Model Context Protocol 调用的外部工具。'],
    ['The agent will wait for you to install the browser extension.', '智能体会等待你安装浏览器扩展。'],
    ['Allow/deny agent read access to specific files or directories.', '允许或拒绝智能体读取指定文件或目录。'],
    ['Agents have full access to your machine and external resources.', '智能体可完整访问你的电脑和外部资源。'],
    ['Allow/deny agent write access to specific files or directories.', '允许或拒绝智能体写入指定文件或目录。'],
    ['Highlight newly inserted text after accepting a Tab completion.', '在接受 Tab 补全后高亮显示新插入的文本。'],
    ['To modify editor settings, open Settings within the editor window.', '要修改编辑器设置，请在编辑器窗口中打开设置。'],
    ['Allows the agent to access files outside of your current workspace.', '允许智能体访问当前工作区之外的文件。'],
    ['打开 in current window, Continue conversation in the current workspace', '在当前窗口打开，并在当前工作区继续对话'],
    ['Agent settings and permissions for conversations outside of projects.', '为项目外对话配置智能体设置和权限。'],
    ['Keep your coding agent up to date with the latest web best practices.', '让您的编码智能体始终与最新的 Web 最佳实践保持同步。'],
    ['Inherits from global settings. Local permissions have higher priority.', '继承全局设置。本地权限优先级更高。'],
    ['Path to the Chrome/Chromium executable. Leave empty for auto-detection.', 'Chrome/Chromium 可执行文件路径。留空则自动检测。'],
    ['Controls whether terminal commands require your approval before running.', '控制终端命令运行前是否需要你的批准。'],
    ['Model must be available on the Gemini API and use the gemini-api scheme.', '模型必须可在 Gemini API 中使用，并使用 gemini-api 模式。'],
    ["You currently don't have any MCP Servers installed. Add an MCP server above", '你当前还没有安装任何 MCP 服务器。请在上方添加 MCP 服务器。'],
    ['You can upgrade to a Google AI Ultra plan to receive the highest rate limits.', '你可以升级到 Google AI Ultra 套餐以获得最高速率限制。'],
    ['Configures how the agent tries to access files outside of its working folders.', '配置智能体如何访问工作文件夹之外的文件。'],
    ['Receive product updates, tips, and promotions from Google Antigravity via email.', '通过电子邮件接收 Google Antigravity 的产品更新、技巧和促销信息。'],
    ["To modify notification settings, open your operating system's system preferences.", '要修改通知设置，请打开操作系统的系统设置。'],
    ['Predict the location of your next edit and navigates you there with a tab keypress.', '预测您下一次编辑的位置，并在按下 Tab 键时导航至该处。'],
    ['Receive product updates, tips, and promotions from Google Antigravity IDE via email.', '通过电子邮件接收来自 Google Antigravity IDE 的产品更新、技巧和促销活动。'],
    ['When enabled, Antigravity will play a sound when Agent finishes generating a response.', '启用后，Antigravity 会在智能体完成回复生成时播放提示音。'],
    ['Controls whether the agent can run custom JavaScript to automate complex browser actions.', '控制智能体是否可以运行自定义 JavaScript 来自动化复杂浏览器操作。'],
    ['Port number for Chrome DevTools Protocol remote debugging. Leave empty for default (9222).', 'Chrome DevTools Protocol 远程调试端口号。留空则使用默认值（9222）。'],
    ['When enabled, the agent will be able to access past conversations to inform its responses.', '启用后，智能体将能够访问历史对话以辅助其生成回复。'],
    ['Confirm the command is safe to run outside of the sandbox with full network and disk access.', '确认该命令可在沙盒外 safe 运行，并拥有完整网络和磁盘访问权限。'],
    ['All terminal commands require review. The agent can read or write to any file in the machine.', '所有终端命令均需要审核。智能体可以读取或写入电脑上的任何文件。'],
    ['When toggled on, Antigravity collects usage data to help Google enhance performance and features.', '开启后，Antigravity 会收集使用数据，帮助 Google 改进性能和功能。'],
    ['Requires manual review for all terminal commands and file accesses outside of the working folders.', '对于所有工作文件夹之外的终端命令和文件访问，都需要手动审核。'],
    ['Modify scoped permissions, folders, and agent settings like Sandbox and Terminal Command Execution.', '修改作用域权限、文件夹，以及沙盒和终端命令执行等智能体设置。'],
    ['When enabled, Agent will use IDE\'s shell integration to detect and report terminal command execution.', '启用后，智能体将使用 IDE 的 Shell 集成来检测并报告终端命令的执行。'],
    ['When toggled on, Antigravity IDE collects usage data to help Google enhance performance and features.', '开启后，Antigravity IDE 将收集使用数据，以帮助 Google 提升性能和功能。'],
    ['to be installed. The browser subagent can be invoked by typing /browser in the conversation input box.', '安装 Google Chrome。您可以在对话输入框中输入 /browser 来调用浏览器子智能体。'],
    ['Prototype, build & run modern apps users love with Firebase\'s backend, AI, and operational infrastructure.', '利用 Firebase 的后端、AI 和运营基础设施，原型设计、构建和运行深受用户喜爱的现代应用。'],
    ['Terminal commands always require review and the agent cannot access files outside of its given workspaces.', '终端命令始终需要审核，且智能体无法访问其给定工作区之外的文件。'],
    ['Agents run in a secure sandbox that restricts access to external resources outside of your trusted folders.', '智能体会在安全沙盒中运行，限制其访问受信任文件夹之外的外部资源。'],
    ['Projects serve as your workspace where your agents work. Each project has its own file scope and permissions. ', '项目是智能体工作的工作区。每个项目都有自己的文件范围和权限。'],
    ['Reliable automation, in-depth debugging, and performance analysis in Chrome using Chrome DevTools and Puppeteer', '使用 Chrome DevTools 和 Puppeteer 在 Chrome 中进行可靠的自动化、深度调试和性能分析'],
    ['We recommend attaching logs. Attaching logs will help the Antigravity team act on and prioritize your feedback.', '我们建议附上日志。附上日志将有助于 Antigravity 团队处理并优先解决您的反馈。'],
    ['When enabled, the Changes Overview toolbar will automatically expand when Agent finishes generating a response.', '启用后，Changes Overview 工具栏将在智能体完成回复生成时自动展开。'],
    ['When enabled, \'Explain and Fix\' actions will continue in the current conversation instead of starting a new one.', '启用后，“解释并修复”操作将在当前对话中继续，而不是开始新对话。'],
    ['The app will be accessible from the menu bar and will keep running in the background when all windows are closed.', '应用可从菜单栏访问，并会在所有窗口关闭后继续在后台运行。'],
    ['Custom path for the browser user profile directory. Leave empty for default (~/.gemini/antigravity-browser-profile).', '浏览器用户资料目录的自定义路径。留空则使用默认路径（~/.gemini/antigravity-browser-profile）。'],
    ['Choose a predefined security preset for the agent. This controls terminal auto-execution policy, and file access policy.', '为智能体选择预设安全策略。它会控制终端自动执行策略和文件访问策略。'],
    ['When enabled, Agent is given awareness of lint errors created by its edits and may fix them without explicit user prompting.', '启用后，智能体将感知到其编辑所导致的 Lint 错误，并可在不明确提示用户的情况下进行修复。'],
    ['Changes the base URL on each extension page. You must restart Antigravity to use the new marketplace after changing this value.', '更改每个插件页面的基准 URL。更改此值后，您必须重启 Antigravity 才能使用新的插件市场。'],
    ['Changes the base URL for marketplace search results. You must restart Antigravity to use the new marketplace after changing this value.', '更改插件市场搜索结果的基准 URL。更改此值后，您必须重启 Antigravity 才能使用新的插件市场。'],
    ['Note: A change to this setting will only apply to new messages sent to Agent. In-progress responses will use the previous setting value.', '注意：对此设置的更改将仅适用于发送给智能体的新消息。正在进行的回复将使用之前的设置值。'],
    ['When enabled, the agent will be able to access its knowledge base to inform its responses and automatically generate knowledge items in the background.', '启用后，智能体将能够访问其知识库以辅助生成回复，并在后台自动生成知识项。'],
    ['Please describe the issue in detail. The more actionable your feedback, the quicker our team can address your request. Some helpful information includes:', '请详细描述问题。您的反馈越具体，我们的团队就能越快处理您的请求。一些有用的信息包括：'],
    ['Configure the browser subagent. It requires Google Chrome to be installed. The browser subagent can be invoked by typing /browser in the conversation input box.', '配置浏览器子智能体。它需要安装 Google Chrome。你可以在对话输入框中输入 /browser 来调用浏览器子智能体。'],
    ['Orchestrates Android development tasks including project creation, deployment, SDK management, and environment diagnostics using the `android` command-line tool.', '使用 android 命令行工具协调 Android 开发任务，包括项目创建、部署、SDK 管理和环境诊断。'],
    ['The breakdown below shows token usage from customizations like skills, rules, and MCP. If the budget is exceeded, large customizations will be truncated automatically.', '下面的明细展示技能、规则和 MCP 等自定义内容的 Token 使用量。如果超出预算，较大的自定义内容会被自动截断。'],
    ['View your available model quota and AI credits. Model quota refreshes periodically based on your plan. Enable AI Credit Overages to continue using models when your quota is exhausted.', '查看可用的模型额度和 AI 积分。模型额度会根据你的计划定期刷新。启用 AI 积分超额使用后，可在额度耗尽时继续使用模型。'],
    ['Agent asks for permission before executing commands matched by a deny list entry. The deny list follows the same matching rules as the allow list and takes precedence over the allow list.', '在执行与拒绝列表条目匹配的命令前，智能体会先请求权限。拒绝列表遵循与允许列表相同的匹配规则，且优先级高于允许列表。'],
    ["When toggled on, Antigravity will use your AI credits to fulfill model requests once you're out of model quota. Antigravity will always use your model quota first before using AI credits.", '开启后，当模型额度用完时，Antigravity 会使用 AI 积分完成模型请求。Antigravity 会始终先使用模型额度，再使用 AI 积分。'],
    ['When toggled on, Antigravity IDE will use your AI credits to fulfill model requests once you\'re out of model quota. Antigravity IDE will always use your model quota first before using AI credits.', '开启后，当模型额度用完时，Antigravity IDE 将使用 AI 积分完成模型请求。Antigravity IDE 始终会先使用模型额度，再使用 AI 积分。'],
    ['Agent auto-executes commands matched by an allow list entry. For Unix shells, an allow list entry matches a command if its space-separated tokens form a prefix of the command\'s tokens. For PowerShell, the entry tokens may match any contiguous subsequence of the command tokens.', '智能体将自动执行与允许列表条目匹配的命令。对于 Unix Shell，如果允许列表条目的空格分隔令牌是该命令令牌的前缀，则匹配。对于 PowerShell，条目令牌可匹配命令令牌的任意连续子序列。'],
    ['When enabled, Agent can use browser tools to open URLs, read web pages, and interact with browser content. This allows the Agent access to important (and often critical) knowledge and methods of validation, but any browser integration does increase exposure to external malicious parties for security exploits.', '启用后，智能体可以使用浏览器工具打开 URL、读取网页并与浏览器内容交互。这能让智能体获取重要知识和验证方式，但任何浏览器集成都可能增加遭受外部恶意利用的风险。'],
    ['Weekly Limit', '周额度'],
    ['Five Hour Limit', '5小时限额'],
    ['Claude and GPT models', 'Claude 和 GPT 模型'],
    ['You can upgrade to a Google AI Ultra plan to receive higher rate limits.', '您可以升级到 Google AI Ultra 套餐以获得更高的速率限制。'],
    ['Within each group, models share a weekly limit and a 5-hour limit. Quota is consumed proportionally to the cost of the tokens. Thus, limits will last longer with shorter tasks or using more cost-effective models. The 5-hour limit smooths out aggregate demand to fairly distribute global capacity across all users, while your weekly limit is tied directly to your individual tier.', '在每个分组中，模型共享每周限额和 5 小时限额。额度的消耗与 Token 的成本成比例。因此，使用较短的任务或更具性价比的模型可以让限额维持更久。5 小时限额平滑了总体需求，以便在所有用户之间公平地分配全局容量，而您的每周限额则直接与您的个人套餐等级挂钩。'],
  ]);

  const patterns = [
    [/(Learn more|了解更多) about/g, '了解更多关于'],
    [/(Add|添加) an MCP server above/g, '在上方添加 MCP 服务器'],
    [/Specifies Agent\'?s behavior when asking for review on artifacts, which are documents it creates to enable (a )?richer conversation experience\./g, '指定智能体在请求您审核产物时的行为；产物是它创建的文档，用来支持更丰富的对话体验。'],
    [/Agent (Settings|设置)/g, '智能体设置'],
    [/Local (Permissions|权限)/g, '本地权限'],
    [/Actuation (Permissions|权限)/g, '操作权限'],
    [/Notification (Settings|设置)/g, '通知设置'],
    [/^Tab$/g, 'Tab 键'],
    [/Plugins are packaged collections of skills and MCPs to help the Agent in Antigravity (IDE )?work with Google developer products\. You can always change your choices in (Settings|设置)\./g, '插件是技能和 MCP 的封装集合，用于帮助 Antigravity IDE 中的智能体使用 Google 开发者产品。您可以随时在“设置”中更改您的选择。'],
    [/See all \((\d+)\)/g, '查看全部 ($1)'],
    [/(\d+) agents running/g, '$1 个代理正在运行'],
    [/1 agent running/g, '1 个代理正在运行'],
    [/^(\d+)d$/g, '$1天'],
    [/^(\d+)m$/g, '$1分钟'],
    [/^(\d+)s$/g, '$1秒'],
    [/Worked for (\d+)s/g, '已工作 $1 秒'],
    [/浏览器 设置/g, '浏览器设置'],
    [/浏览器 操作权限/g, '浏览器操作权限'],
    [/应用 设置/g, '应用设置'],
    [/打开 System Preferences/g, '打开系统设置'],
    [/Pinned 对话/g, '已固定对话'],
    [/Toggle 侧边栏/g, '切换侧边栏'],
    [/Select model, current: (.+)/g, '选择模型，当前：$1'],
    [/Outside of 项目/g, '项目外'],
    [/应用lication/g, '应用'],
    [/自定义ize/g, '自定义'],
    [/100\.0% of the customization budget is available\./g, '自定义预算还剩 100.0%。'],
    [/(\d+(?:\.\d+)?)% of the customization budget is available\./g, '自定义预算还剩 $1%。'],
    [/Your Plan: (.+)/g, '你的套餐：$1'],
    [/You currently don't have any MCP Servers installed\. 添加 an MCP server above/g, '你当前还没有安装任何 MCP 服务器。请在上方添加 MCP 服务器。'],
    [/了解更多\./g, '了解更多。'],
    [/Project-Specific 设置/g, '项目专属设置'],
    [/Go to 项目/g, '前往项目'],
    [/File 权限/g, '文件权限'],
    [/Network 权限/g, '网络权限'],
    [/Terminal & Tooling 权限/g, '终端与工具权限'],
    [/Sort 对话/g, '排序对话'],
    [/^No$/g, '否'],
    [/^Allow$/g, '允许'],
    [/^Deny$/g, '拒绝'],
    [/^\(tell the agent what to do instead\)$/g, '（告诉智能体改做什么）'],
    [/Requesting permission to (read access to this path|write access to this path|reading this URL|executing actions on this URL|running this command|running this command outside the sandbox|using this MCP tool) (.+)/g, (_match, action, target) => {
      const actions = {
        'read access to this path': '读取此路径',
        'write access to this path': '写入此路径',
        'reading this URL': '读取此 URL',
        'executing actions on this URL': '在此 URL 上执行操作',
        'running this command': '运行此命令',
        'running this command outside the sandbox': '在沙盒外运行此命令',
        'using this MCP tool': '使用此 MCP 工具',
      };
      return '正在请求权限：' + (actions[action] ?? action) + ' ' + target;
    }],
    [/Agent needs permission to act on (.+)/g, '智能体需要权限才能操作 $1'],
    [/Agent needs permission to execute JavaScript on (.+)/g, '智能体需要权限才能在 $1 上执行 JavaScript'],
    [/Agent needs permission to execute JavaScript/g, '智能体需要权限才能执行 JavaScript'],
    [/Yes, save rule for '([^']+)' when not in a project/g, "是，并在未处于项目时保存 '$1' 的规则"],
    [/Yes, save rule for '([^']+)' in this project/g, "是，并在此项目中保存 '$1' 的规则"],
    [/Yes, save rule for '([^']+)' in this workspace/g, "是，并在此工作区保存 '$1' 的规则"],
    [/Yes, save rule for '([^']+)' globally/g, "是，并全局保存 '$1' 的规则"],
    [/Yes, save rule when not in a project/g, '是，并在未处于项目时保存规则'],
    [/Yes, save rule in this project/g, '是，并在此项目中保存规则'],
    [/Yes, save rule in this workspace/g, '是，并在此工作区保存规则'],
    [/Yes, save rule globally/g, '是，并全局保存规则'],
    [/Yes, and always allow '([^']+)' when not in a project/g, "是，并在未处于项目时始终允许 '$1'"],
    [/Yes, and always allow '([^']+)' in this project/g, "是，并在此项目中始终允许 '$1'"],
    [/Yes, and always allow '([^']+)' in this workspace/g, "是，并在此工作区始终允许 '$1'"],
    [/Yes, and always allow '([^']+)'/g, "是，并始终允许 '$1'"],
    [/Yes, and always allow when not in a project/g, '是，并在未处于项目时始终允许'],
    [/Yes, and always allow in this project/g, '是，并在此项目中始终允许'],
    [/Yes, and always allow in this workspace/g, '是，并在此工作区始终允许'],
    [/Yes, and always allow/g, '是，并始终允许'],
    [/Allow (.+)/g, '允许 $1'],
    [/Refreshes in (\d+) hours?, (\d+) minutes?/g, '$1 小时 $2 分钟后刷新'],
    [/\((Thinking)\)/g, '(思考)'],
    [/Gemini ([^(]+) \((High|Medium|Low)\)/g, (_match, model, effort) => 'Gemini ' + model.trim() + ' (' + (phrases.get(effort) ?? effort) + ')'],
    [/Antigravity has been redesigned to put agents first with new capabilities\. If you'd still like a code editor, you can download it as a separate app named Antigravity IDE\./g, 'Antigravity 已重新设计为智能体优先，并加入了新能力。如果你仍然需要代码编辑器，可以下载名为 Antigravity IDE 的独立应用。'],
    [/Select Next (Conversation|对话)/g, '选择下一个对话'],
    [/Select Previous (Conversation|对话)/g, '选择上一个对话'],
    [/Show "(Edit|编辑)" and "(Chat|对话|Chat)" buttons when selecting text in the editor\./g, '在编辑器中选择文本时，显示“编辑”和“对话”按钮。'],
    [/(Allow|允许) Tab to view and edit the files in \.gitignore\. (Use|使用) with caution if your \.gitignore lists files containing credentials, secrets, or other sensitive information\./g, '允许使用 Tab 键查看和编辑 .gitignore 中的文件。如果您的 .gitignore 中列出了包含凭据、密码或其他敏感信息的文件，请谨慎使用。'],
    [/Changes the base URL for marketplace search results\. You must restart Antigravity( IDE)? to use the new marketplace after changing this value\./g, '更改插件市场搜索结果的基准 URL。更改此值后，您必须重启 Antigravity IDE 才能使用新的插件市场。'],
    [/Changes the base URL on each extension page\. You must restart Antigravity( IDE)? to use the new marketplace after changing this value\./g, '更改每个插件页面的基准 URL。更改此值后，您必须重启 Antigravity IDE 才能使用新的插件市场。'],
    [/It requires Google Chrome to be installed\./g, '它需要安装 Google Chrome。'],
    [/to be installed\./g, '已安装。'],
    [/Send feedback as (.+)/g, '以 $1 发送反馈'],
    [/Show (\d+) breakdown/g, '显示 $1 个明细'],
    [/1 file changed/g, '1 个文件已更改'],
    [/1 file/g, '1 个文件'],
    [/to navigate/g, '用于导航'],
    [/to select/g, '用于选择'],
    [/broadcast 转到 Live, Click to run live server/g, '广播 Go Live，点击运行实时服务器'],
    [/Worked for (\d+)m/g, '已工作 $1 分钟'],
    [/(\d+) minutes? ago/g, '$1 分钟前'],
    [/(\d+) hours? ago/g, '$1 小时前'],
    [/(\d+) days? ago/g, '$1 天前'],
    [/You have used some of your weekly limit, it will fully refresh in (.+)\./gi, '您已使用部分周额度，将在 $1 后完全刷新。'],
    [/You have used some of your 5-hour limit, it will fully refresh in (.+)\./gi, '您已使用部分 5 小时额度，将在 $1 后完全刷新。'],
    [/(\d+) days?/gi, '$1 天'],
    [/(\d+) hours?/gi, '$1 小时'],
    [/(\d+) minutes?/gi, '$1 分钟']
  ];

  function translate(value) {
    if (!value || !/[A-Za-z]/.test(value)) return value;
    let next = value;
    for (const [source, target] of [...phrases].reverse()) {
      next = replacePhrase(next, source, target);
    }
    for (const [pattern, target] of patterns) next = next.replace(pattern, target);
    return next;
  }

  function escapeRegExp(value) {
    return value.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
  }

  function replacePhrase(value, source, target) {
    const escaped = escapeRegExp(source);
    const startsWord = /^[A-Za-z0-9]/.test(source);
    const endsWord = /[A-Za-z0-9]$/.test(source);
    const pattern = new RegExp((startsWord ? '(?<![A-Za-z0-9])' : '') + escaped + (endsWord ? '(?![A-Za-z0-9])' : ''), 'g');
    return value.replace(pattern, target);
  }

  function shouldSkip(node) {
    const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    if (!element) return false;

    // 过滤代码与编辑器
    if (element.closest('script, style, textarea, code, pre, .xterm, .monaco-editor')) {
      return true;
    }

    // 过滤输入框文本
    if (node.nodeType === Node.TEXT_NODE) {
      if (element.closest('[contenteditable="true"], [contenteditable=""], input')) {
        return true;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // 过滤嵌套编辑框子元素
      const parent = node.parentElement;
      if (parent && parent.closest('[contenteditable="true"], [contenteditable=""], input')) {
        return true;
      }
    }

    // 过滤对话历史标题
    const historyItem = element.closest('.past-conversations, .conversation-list, .history-list, .conversations-list, [data-testid="history-list"], [data-testid="past-conversations"], .conversation-item, .convo-item, .history-item, [class*="history-item"], [class*="convo-item"]');
    if (historyItem) {
      const isActionBtn = element.closest('button[aria-label], button[title], [class*="delete"], [class*="pin"], [class*="archive"]');
      if (!isActionBtn) return true;
    }

    // 过滤用户消息
    if (element.closest('[data-testid="user-input-step"], [aria-label="User message"], [aria-label="用户消息"]')) {
      return true;
    }

    // 过滤模型回复（仅汉化交互控件）
    const agentResponse = element.closest('[aria-label="Agent response"], [aria-label="智能体回复"]');
    if (agentResponse) {
      const isInteractive = element.closest('button, [role="button"], [class*="action"], [class*="button-container"]');
      if (!isInteractive) return true;
    }

    return false;
  }

  function isInAntigravityContainer(node) {
    const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    if (!element) return false;

    // 仅主窗口启用白名单保护原生 UI
    const isMainWindow = window.location.pathname.endsWith('workbench.html') ||
      window.location.href.indexOf('/workbench.html') >= 0 ||
      window.location.href.indexOf('\\workbench.html') >= 0;
    if (!isMainWindow) return true;

    // 仅汉化专属组件与浮层
    const containerSelector = [
      '[class*="antigravity"]',
      '[id*="antigravity"]',
      '.client-experience-pill',
      '.diff-hunk-widget',
      '.keep-changes',
      '.discard-changes',
      '.monaco-dialog-box',
      '.dialog-box',
      '[role="dialog"]',
      '.inline-chat-widget',
      '.inline-chat-overflow',
      '.monaco-hover',
      '.monaco-hover-content',
      '.context-view',
      '.monaco-select-box'
    ].join(', ');

    return !!element.closest(containerSelector);
  }

  function translateElement(element) {
    if (!isInAntigravityContainer(element)) return;
    for (const attr of ['aria-label', 'title', 'placeholder', 'alt']) {
      const value = element.getAttribute?.(attr);
      if (!value) continue;
      const translated = translate(value);
      if (translated !== value) element.setAttribute(attr, translated);
    }
  }

  function translateNode(root) {
    if (!root) return;
    if (shouldSkip(root)) return;
    if (root.nodeType === Node.TEXT_NODE) {
      if (!isInAntigravityContainer(root)) return;
      if (root.__zh_patched) return;
      const val = root.nodeValue || '';
      const translated = translate(val);
      if (translated !== val) root.nodeValue = translated;
      root.__zh_patched = true;
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    if (root.nodeType === Node.ELEMENT_NODE) {
      if (!root.__zh_patched) {
        translateElement(root);
        root.__zh_patched = true;
      }
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (shouldSkip(node)) continue;
      if (node.nodeType === Node.TEXT_NODE) {
        if (!isInAntigravityContainer(node)) continue;
        if (node.__zh_patched) continue;
        const val = node.nodeValue || '';
        const translated = translate(val);
        if (translated !== val) node.nodeValue = translated;
        node.__zh_patched = true;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.__zh_patched) continue;
        translateElement(node);
        node.__zh_patched = true;
      }
    }
  }

  function run() {
    document.documentElement.lang = 'zh-CN';
    translateNode(document);

    new MutationObserver((mutations) => {
      const nodesToTranslate = [];
      const elementsToTranslate = [];

      for (const mutation of mutations) {
        if (mutation.type === 'characterData') {
          const target = mutation.target;
          target.__zh_patched = false;
          nodesToTranslate.push(target);
        } else if (mutation.type === 'attributes') {
          const target = mutation.target;
          target.__zh_patched = false;
          elementsToTranslate.push(target);
        } else {
          for (const node of mutation.addedNodes) {
            nodesToTranslate.push(node);
          }
        }
      }

      if (nodesToTranslate.length > 0 || elementsToTranslate.length > 0) {
        // 延时执行以确保节点已完全挂载
        setTimeout(() => {
          for (const node of nodesToTranslate) {
            translateNode(node);
          }
          for (const el of elementsToTranslate) {
            translateElement(el);
          }
        }, 0);
      }
    }).observe(document, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['aria-label', 'title', 'placeholder', 'alt'],
    });
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
})();

