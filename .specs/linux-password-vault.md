# Linux 密码库设计规格

## 文档定位

本文件定义独立页面 **Linux 密码库** 的产品边界、路由接入、访问控制、组件拆分与验收范围。该页面视觉和交互来源于 `figma-linuxpwd/src/app/components/Professional.tsx`，但最终以 `support-roster-ui` 的 Vue 结构落地。

## 目标

- 将 Figma Maker 生成的 Linux 密码库页面转换为 Vue 页面并接入当前前端项目。
- 保持新页面为独立界面，不并入现有 workspace 内容区或侧边导航。
- 在现有 `viewer` 与 `workspace` 顶部新增进入 Linux 密码库的跳转入口。
- 让新页面复用现有 `workspace access policy`，并新增“是否需要登录才能访问”的配置项。

## 非目标

- 本期不改造现有 workspace 左侧导航结构。
- 本期不新增独立账号体系。
- 本期不引入独立业务单元字典接口。

## 路由与访问策略

### 顶层路由

- 新增独立路由页面：`/linux-passwords`
- 页面不作为 `/workspace/**` 子路由存在。
- 页面使用独立布局，优先还原 Figma 视觉，而不是复用 workspace 壳层。

### 入口位置

- `src/components/Header.vue`：在 viewer 顶部已有 “Enter Workspace” 按钮旁新增 **Linux 密码库** 按钮。
- `src/features/workspace/components/WorkspaceTopbar.vue`：在 workspace 顶部已有 “Open Viewer” 按钮旁新增 **Linux 密码库** 按钮。
- workspace Topbar 中的 **Linux 密码库** 与 **Open Viewer** 入口允许保留主次层级，但需复用同一套胶囊按钮骨架，避免出现高度、圆角、内边距与字重不一致的割裂感。

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
| `LinuxPasswordSidebar` | 左侧目录树、业务分类筛选、展开/折叠 |
| `LinuxPasswordToolbar` | 标题、搜索、Add、Back to List 等顶部操作 |
| `LinuxPasswordTable` | 列表态表格展示与行内交互 |
| `LinuxPasswordForm` | 新增 / 编辑共用表单 |
| `useLinuxPasswords` | 页面级数据获取、CRUD 提交、权限显隐与状态反馈 |

### 当前实现文件

- `src/features/linux-passwords/pages/LinuxPasswordsPage.vue`
- `src/features/linux-passwords/components/LinuxPasswordSidebar.vue`
- `src/features/linux-passwords/components/LinuxPasswordToolbar.vue`
- `src/features/linux-passwords/components/LinuxPasswordTable.vue`
- `src/features/linux-passwords/components/LinuxPasswordForm.vue`
- `src/features/linux-passwords/lib/useLinuxPasswords.js`
- `src/api/index.js`
- `src/features/workspace/config/accessPolicyPages.js`

## 交互范围

当前实现保留 Figma 页面中的前端交互感，但数据已切换为真实接口：

- 列表态 / 新增态 / 编辑态切换
- 左侧目录筛选（左侧目录来自独立接口，筛选仍通过 `businessUnit` 查询机器列表）
- 搜索主机名 / IP（后端按 `search` 查询）
- 密码显隐切换
- 复制密码反馈
- WinSCP 按钮反馈
- 新增机器表单提交
- 管理员行内编辑 / 删除
- 删除前二次确认
- 编辑态支持修改 `status`

### 数据来源

- 页面初次进入通过 `api.workspace.getLinuxPasswords()` 拉取真实列表。
- 页面初次进入额外通过 `api.workspace.getLinuxPasswordDirectories()` 拉取左侧目录。
- 列表接口当前仍返回 `items + businessUnits`，但前端目录树只使用独立目录接口结果。
- 新增走 `POST /api/workspace/linux-passwords`
- 编辑走 `PUT /api/workspace/linux-passwords/{id}`
- 删除走 `DELETE /api/workspace/linux-passwords/{id}`
- 左侧目录走 `GET /api/workspace/linux-password-directories`
- 详情接口预留为 `GET /api/workspace/linux-passwords/{id}`，当前页面编辑直接复用列表行数据。

## 前后端权限对齐

| 操作 | 前端显隐 | 后端校验 |
|---|---|---|
| 列表 / 详情 | 受页面登录策略控制 | 已登录 |
| 新增 | 登录即可进入页面后可操作 | 已登录 |
| 编辑 | 仅 `authStore.isAdmin` 显示按钮 | workspace `admin` |
| 删除 | 仅 `authStore.isAdmin` 显示按钮 | workspace `admin` |

## 表单规则

- 新增：
  - 必填：`hostname`、`ip`、`username`、`password`
  - 不显示状态字段
  - 后端默认写入 `status=online`
  - 提供“新增目录”输入框，可一次补充 1 个新目录
  - 同时支持勾选已有目录
- 编辑：
  - 复用同一表单
  - 额外显示 `status` 下拉框
  - 可选值：`online` / `maintenance` / `offline`
  - 同样支持“输入 1 个新目录 + 勾选已有目录”
- 业务单元为空时，由后端归一化为 `Uncategorized`
- 目录表由机器 CRUD 自动维护；不再存在前端预制目录常量。

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
- 列表、新增 / 编辑表单、筛选、搜索、密码显隐、复制等交互可用。
- 新增目录后左侧目录立即出现；移除最后一个引用该目录的机器后，左侧目录立即消失。
- 管理员可看到编辑 / 删除按钮；非管理员不可见。
- 所有列表刷新由真实接口返回驱动，而不是本地 mock 数据更新。

## 验证命令

- `cd support-roster-ui && node --test src/features/workspace/config/accessPolicyPages.test.js src/features/linux-passwords/lib/linuxPasswords.test.js src/features/linux-passwords/lib/useLinuxPasswords.test.js`
- `cd support-roster-ui && npm run build`
- `cd automationtest && npm run test:raw -- specs/auth/linux-password-route-guard.spec.mjs`
- `cd automationtest && npm run test:raw -- specs/workspace/linux-passwords-smoke.spec.mjs`

## 后续演进预留

若后续需要继续增强，可在保持当前页面结构不变的前提下继续扩展：

- 详情接口独立加载
- 更细的字段脱敏 / 审计
- 业务单元独立字典接口
