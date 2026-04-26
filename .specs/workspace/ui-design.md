# Workspace 视觉规范

## 文档定位

本文件维护 Admin Workspace 的专属视觉语言，强调高信息密度、清晰层级和编辑型工作流体验，是工作台分册中的视觉章节。

## 阅读提示

- 根级 `../ui-design.md` 负责共用与 Viewer 视觉；本文件只描述管理端专属风格。
- 若组件外观变化影响交互层级或抽屉结构，也应同步回看 `layout.md` 与 `components/shared.md`。

## Scope

本文件维护 Admin Workspace 的专属视觉规范。根级 `../ui-design.md` 只保留共用与 Public Viewer 说明；凡是管理端特有的视觉语言、表面风格、密度策略与工作流型组件观感，都应记录在本文件。

## Visual Direction

Workspace 有意与 Public Viewer 区分开，避免同一套视觉语气覆盖两种不同工作场景。

- 用途定位：面向管理与编辑，而不是实时大屏展示
- 气质方向：轻中性色表面、清晰边框、偏紧凑的表单与表格密度
- 交互目标：提升可扫描性、批量操作效率与信息编排稳定性

## Typography

- UI 文案主字体：Manrope
- 表格、日期、班次代码等结构化信息：IBM Plex Mono
- 标题应更偏管理后台语气，减少 Viewer 式的展示型强调

## Color And Surface

- 主体背景：浅中性色背景，弱化装饰性渐变
- 操作强调色：teal 系按钮、链接与状态强调
- 卡片表面：白色或 muted surface，边界清晰，阴影克制
- 辅助文本：以灰阶建立信息优先级，不依赖高饱和颜色堆砌层级

## Density Rules

- 控件密度应高于 Public Viewer，优先服务录入、筛选、校验和批量编辑
- 页头、筛选区、表格区、抽屉区之间要有明确分区，但避免过度留白
- 表格和 roster grid 优先保证扫描效率，再考虑展示感

## Shell Expectations

- Sidebar 是稳定导航骨架，负责模块切换与状态提示
- Topbar 是跨页面工具区，承载搜索、跳转和辅助操作
- 主内容区应允许页面独立滚动，不影响外层壳结构稳定性

### WorkspaceTopbar

- Topbar 视觉应更接近 **精致、克制的管理台工具栏**，而不是一排直接拼接的表单控件。
- 搜索、月份上下文、跨域动作应分成三个清晰视觉区块，而不是全部堆在同一层级。
- 月份上下文区是 Topbar 的中心信息块，标题、前后切换、月份/年份选择器应比时区和语言控件更醒目。
- 时区和语言属于辅助上下文，不应与月份信息争抢主视觉；更适合作为轻量 meta control 出现在同一时间模块中。
- 右侧动作组应整体包裹成一个独立 action cluster，通过共享白色表面、柔和阴影与统一圆角形成稳定节奏。
- 工具页入口（如 `Linux Password Vault`、`Contact Information`）保持同级次级气质；跨产品主入口（如 `Open Public Viewer`）保留更高强调度。
- 在较窄宽度下，Topbar 应优先压缩月份/年份选择器、时区与语言控件的占宽，再考虑换行；不允许先把右侧动作按钮挤出可视区域。
- 当动作组文本无法稳定容纳时，可先收缩为 icon-only 按钮，但动作组整体仍需持续可见且保持主次视觉层级。
- 响应式收缩优先级应是：保留搜索可用、保留跨域动作全可见、保留月份摘要始终可读，再逐步压缩月份详细选择和 meta control。

## Shared Component Direction

### WorkspaceSurface

- 作为工作台默认卡片表面
- 需要保证边框与底色层次清晰
- `white` 与 `muted` 两类表面应有稳定用途，不随页面随意漂移

### WorkspaceDrawer

- 应保持强操作导向，而不是展示型弹层
- 标题区、表单区、底部动作区要有稳定结构
- 关闭、取消、保存等动作层级必须清楚

## Accessibility Rules

- Workspace 表单控件必须提供稳定的 `id` 与 `name`，便于自动化、浏览器填充与可访问性工具识别
- 文本输入、选择器、文件上传控件应通过显式 label 或屏幕阅读器专用 label 获得可访问名称
- 仅图标或表格内复选框至少要提供 `aria-label`，避免批量操作场景出现无名控件

### WorkspacePageHeader

- 页面标题与摘要信息需要简洁
- 操作按钮通过 actions 插槽承载，避免把页面说明和操作混杂

## Relationship To Viewer

- Viewer 重展示和实时感知
- Workspace 重维护、编辑和校验
- 两者可以复用基础样式体系，但不应强行统一为同一视觉语气

## Update Rules

- 修改管理端字体、颜色、表面层次、页头结构、抽屉样式或表单密度时，优先更新本文件
- 若改动同时影响 Viewer，再同步更新根级 `../ui-design.md`
