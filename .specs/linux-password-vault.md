# Linux 密码库设计规格

## 文档定位

本文件定义独立页面 **Linux 密码库** 的产品边界、路由接入、访问控制、组件拆分与验收范围。该页面视觉和交互来源于 `figma-linuxpwd/src/app/components/Professional.tsx`，但最终以 `support-roster-ui` 的 Vue 结构落地。

## 目标

- 将 Figma Maker 生成的 Linux 密码库页面转换为 Vue 页面并接入当前前端项目。
- 保持新页面为独立界面，不并入现有 workspace 内容区或侧边导航。
- 在现有 `viewer` 与 `workspace` 顶部新增进入 Linux 密码库的跳转入口。
- 让新页面复用现有 `workspace access policy`，并新增“是否需要登录才能访问”的配置项。

## 非目标

- 本期不接入真实后端接口。
- 本期不改造现有 workspace 左侧导航结构。
- 本期不新增独立账号、角色或细粒度操作权限模型。

## 路由与访问策略

### 顶层路由

- 新增独立路由页面：`/linux-passwords`
- 页面不作为 `/workspace/**` 子路由存在。
- 页面使用独立布局，优先还原 Figma 视觉，而不是复用 workspace 壳层。

### 入口位置

- `src/components/Header.vue`：在 viewer 顶部已有 “Enter Workspace” 按钮旁新增 **Linux 密码库** 按钮。
- `src/features/workspace/components/WorkspaceTopbar.vue`：在 workspace 顶部已有 “Open Viewer” 按钮旁新增 **Linux 密码库** 按钮。

### 访问控制

- `workspace access policy` 新增页面项：`linux-passwords`
- 默认策略：

| pageCode | 默认是否需要登录 | 可配置 |
|---|---|---|
| `linux-passwords` | `true` | `true` |

- 若策略要求登录且用户未登录，访问 `/linux-passwords` 时跳转到 `/login?redirect=/linux-passwords`，登录成功后需返回原目标页，而不是退回 workspace 默认页。
- 若策略关闭登录要求，匿名用户也可访问该页面。
- 新页面虽然复用 `workspace access policy`，但不加入 workspace 侧边导航默认入口计算。

## 页面结构与组件边界

为了避免把整套 Figma 页面直接塞进一个超大单文件组件，新页面采用“路由页 + 结构组件 + 交互组件”的拆分方式。

| 组件 / 模块 | 单一职责 |
|---|---|
| `LinuxPasswordsPage` | 路由页，负责组合页面与挂接页面级状态 |
| `LinuxPasswordsShell` | 页面整体布局，串联侧栏、工具栏与主内容区 |
| `LinuxPasswordSidebar` | 左侧目录树、业务分类筛选、展开/折叠 |
| `LinuxPasswordToolbar` | 标题、搜索、Add、Back to List 等顶部操作 |
| `LinuxPasswordTable` | 列表态表格展示与行内交互 |
| `LinuxPasswordForm` | 新增机器表单态与本地提交 |
| `linuxPasswordMockData` | 页面示例数据与初始目录数据 |

### 当前实现文件

- `src/features/linux-passwords/pages/LinuxPasswordsPage.vue`
- `src/features/linux-passwords/components/LinuxPasswordSidebar.vue`
- `src/features/linux-passwords/components/LinuxPasswordToolbar.vue`
- `src/features/linux-passwords/components/LinuxPasswordTable.vue`
- `src/features/linux-passwords/components/LinuxPasswordForm.vue`
- `src/features/linux-passwords/data/mockServers.js`
- `src/features/linux-passwords/lib/linuxPasswords.js`
- `src/features/workspace/config/accessPolicyPages.js`

## 交互范围

本期保留 Figma 页面中的前端交互感，但全部基于本地状态运行：

- 列表态 / 新增态切换
- 左侧目录筛选
- 搜索主机名 / IP
- 密码显隐切换
- 复制密码反馈
- WinSCP 按钮反馈
- 新增机器表单提交并更新本地数据

### 数据来源

- 示例数据来源于 Figma 工程里的 `mockServers`
- 数据迁移到 `support-roster-ui` 内部的 Vue 数据模块
- 不发起真实 API 请求

## 文案与国际化

新增页面需补齐中英文文案，至少包括：

- 顶部按钮文案：Linux 密码库
- 页面标题与子标题
- 空状态、表格列名、搜索占位、按钮文案
- Access Policy 中的页面名称

所有正式文案统一进入当前项目的 i18n 语言包，不在组件内硬编码跨页面共用名称。

## 访问策略管理落点

- 沿用 `AccountManagementPage.vue` 中现有的 Access Policy 弹窗。
- Linux 密码库作为新的策略卡片出现在该弹窗中。
- 保存时沿用现有 `updateWorkspaceAccessPolicy` 提交结构，不引入第二套配置接口形态。
- 页面显示名来自 i18n，而不是写死 `pageCode`。

## 验收范围

### 路由与入口

- `viewer` 顶部可以进入 Linux 密码库。
- `workspace` 顶部可以进入 Linux 密码库。
- 直接访问 `/linux-passwords` 时，行为符合访问策略。

### 访问控制

- Access Policy 中能看到 Linux 密码库开关。
- 默认状态为“需要登录”。
- 管理员修改并保存后，游客访问行为随配置变化。
- 后端 `/api/workspace/access-policy` 已接受并返回 `linux-passwords` 配置项，前后端策略定义保持一致。

### 页面交互

- 页面布局与 Figma 版本核心结构一致。
- 列表、新增表单、筛选、搜索、密码显隐、复制等交互可用。
- 本地状态更新后，页面行为连贯，无需刷新即可反映结果。

## 验证命令

- `cd support-roster-ui && node --test src/features/workspace/config/accessPolicyPages.test.js src/features/linux-passwords/lib/linuxPasswords.test.js`
- `cd support-roster-ui && npm run build`
- `cd automationtest && npm run test:raw -- specs/auth/linux-password-route-guard.spec.mjs`
- `cd automationtest && npm run test:raw -- specs/workspace/linux-passwords-smoke.spec.mjs`

## 后续演进预留

若后续需要接入真实后端，可在保持路由与组件边界不变的前提下，将本地示例数据替换为 API / composable 驱动的数据源，而不需要重做页面信息架构。
