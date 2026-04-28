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
- Workspace 登录账户即员工 ID（staff_id），不在前端新增第二套用户名概念。

## 路由与访问策略

### 顶层路由

- 新增独立路由页面：`/linux-passwords`
- 页面不作为 `/workspace/**` 子路由存在。
- 页面使用独立布局，优先还原 Figma 视觉，而不是复用 workspace 壳层。

### 入口位置

- `src/components/Header.vue`：viewer 顶部将 **Linux 密码库** 与 **Contact Information** 作为同级工具入口，`Workspace` 保持主动作层级。
- `src/features/workspace/components/WorkspaceTopbar.vue`：workspace 顶部将 **Linux 密码库** 与 **Contact Information** 作为同级次级入口，`Open Public Viewer` 保持更高层级。
- `src/features/linux-passwords/pages/LinuxPasswordsPage.vue`：当前页面顶部补充 **Contact Information** 与 **Open Public Viewer** 入口，并让 `Workspace` 作为主动作保留。
- 三处跨域跳转按钮都必须复用稳定的胶囊骨架，避免新增按钮后出现尺寸、圆角、横向内边距与字重不一致的割裂感。

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
| `LinuxPasswordAuditPage` | 管理员审计记录路由页，负责组合筛选与列表 |
| `LinuxPasswordAuditFilters` | 审计记录多维搜索条件 |
| `LinuxPasswordAuditTable` | 审计记录表格、空状态与分页 |
| `useLinuxPasswords` | 页面级数据获取、CRUD 提交、权限显隐与状态反馈 |
| `useLinuxPasswordAudits` | 审计记录查询、分页、筛选状态与加载反馈 |

### 当前实现文件

- `src/features/linux-passwords/pages/LinuxPasswordsPage.vue`
- `src/features/linux-passwords/components/LinuxPasswordSidebar.vue`
- `src/features/linux-passwords/components/LinuxPasswordToolbar.vue`
- `src/features/linux-passwords/components/LinuxPasswordTable.vue`
- `src/features/linux-passwords/components/LinuxPasswordForm.vue`
- `src/features/linux-passwords/components/LinuxPasswordAuditFilters.vue`
- `src/features/linux-passwords/components/LinuxPasswordAuditTable.vue`
- `src/features/linux-passwords/lib/useLinuxPasswords.js`
- `src/features/linux-passwords/lib/useLinuxPasswordAudits.js`
- `src/features/linux-passwords/pages/LinuxPasswordAuditPage.vue`
- `src/api/index.js`
- `src/features/workspace/config/accessPolicyPages.js`

## 交互范围

当前实现保留 Figma 页面中的前端交互感，但数据已切换为真实接口：

- 列表态 / 新增态 / 编辑态切换
- 左侧目录筛选（左侧目录来自独立接口，筛选仍通过 `businessUnit` 查询机器列表）
- 搜索主机名 / IP（后端按 `search` 查询）
- 密码显隐切换
- 复制密码反馈
- 同一机器展示多个登录账户
- 点击显隐或复制时调用后端按需解密接口，前端不从列表接口接收明文或密文
- 左侧栏左下角向管理员展示“审计记录”入口，非 admin 不显示
- 审计记录页面仅 admin 可进入，支持按全局关键词、员工 ID、员工姓名、主机名、IP、登录账户、动作、结果、开始日期、结束日期组合搜索
- WinSCP 按钮反馈
- 新增机器表单提交
- 管理员行内编辑 / 删除
- 删除前二次确认
- 编辑态支持修改 `status`

### 数据来源

- 页面初次进入通过 `api.workspace.getLinuxPasswords()` 拉取真实列表。
- 页面初次进入额外通过 `api.workspace.getLinuxPasswordDirectories()` 拉取左侧目录。
- 列表接口当前仍返回 `items + businessUnits`，但 `items[].credentials` 只包含 `id`、`username`、`notes`、`hasPassword` 等元信息。
- 列表接口不返回密码明文，也不返回密码密文。
- 查看/复制密码走 `POST /api/workspace/linux-passwords/credentials/{credentialId}/secret`，请求体 `action` 为 `VIEW` 或 `COPY`。
- 审计记录走 `GET /api/workspace/linux-passwords/access-audits`，返回 `items + page + pageSize + total`；页面只展示审计元信息，不包含密码内容。
- 新增走 `POST /api/workspace/linux-passwords`
- 编辑走 `PUT /api/workspace/linux-passwords/{id}`
- 删除走 `DELETE /api/workspace/linux-passwords/{id}`
- 左侧目录走 `GET /api/workspace/linux-password-directories`
- 详情接口预留为 `GET /api/workspace/linux-passwords/{id}`，当前页面编辑直接复用列表行数据。

## 前后端权限对齐

| 操作 | 前端显隐 | 后端校验 |
|---|---|---|
| 列表 / 详情 | 受页面登录策略控制 | 已登录 |
| 查看密码 | 眼睛按钮 | 已登录，后端解密并写审计 |
| 复制密码 | 复制按钮 | 已登录，后端解密并写审计 |
| 新增 | 登录即可进入页面后可操作 | 已登录 |
| 编辑 | 仅 `authStore.isAdmin` 显示按钮 | workspace `admin` |
| 删除 | 仅 `authStore.isAdmin` 显示按钮 | workspace `admin` |
| 审计入口 / 审计页面 | 仅 `authStore.isAdmin` 显示和放行 | workspace `admin` |

## 表单规则

- 新增：
  - 必填：`hostname`、`ip`
  - 至少维护 1 个登录账户
  - 新增登录账户必填：`username`、`password`
  - 不显示状态字段
  - 后端默认写入 `status=online`
  - 提供“新增目录”输入框，可一次补充 1 个新目录
  - 同时支持勾选已有目录
- 编辑：
  - 复用同一表单
  - 额外显示 `status` 下拉框
  - 可选值：`online` / `maintenance` / `offline`
  - 可新增、删除、修改登录账户
  - 已有登录账户密码输入框留空表示保留原密码
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
- Linux 密码库页面顶部可以进入 Contact Information 与 Viewer / Workspace。
- 直接访问 `/linux-passwords` 时，行为符合访问策略。

### 访问控制

- Access Policy 中能看到 Linux 密码库开关。
- 默认状态为“需要登录”。
- 管理员修改并保存后，游客访问行为随配置变化。
- 后端 `/api/workspace/access-policy` 已接受并返回 `linux-passwords` 配置项，前后端策略定义保持一致。

### 页面交互

- 页面布局与 Figma 版本核心结构一致。
- 列表、新增 / 编辑表单、筛选、搜索、密码显隐、复制等交互可用。
- 一台机器可显示并维护多个登录账户。
- 密码默认遮罩；点击眼睛后才请求后端解密并展示，复制同样触发后端审计。
- 新增目录后左侧目录立即出现；移除最后一个引用该目录的机器后，左侧目录立即消失。
- 管理员可看到编辑 / 删除按钮；非管理员不可见。
- 管理员可在左侧栏左下角进入审计记录页面；非管理员无法看到入口，直接访问 `/linux-passwords/audits` 会被路由守卫拦截。
- 审计页面支持多维搜索和分页，列表展示员工、机器、登录账户、动作、结果、来源 IP、User-Agent 与访问时间。
- 所有列表刷新由真实接口返回驱动，而不是本地 mock 数据更新。

## 验证命令

- `cd support-roster-ui && node --test src/features/workspace/config/accessPolicyPages.test.js src/features/linux-passwords/lib/linuxPasswords.test.js src/features/linux-passwords/lib/useLinuxPasswords.test.js`
- `cd support-roster-ui && node --test src/features/linux-passwords/lib/useLinuxPasswordAudits.test.js`
- `cd support-roster-ui && node --test src/router/index.test.js src/features/workspace/config/navigation.test.js src/features/linux-passwords/pages/LinuxPasswordsPage.test.js`
- `cd support-roster-ui && npm run build`
- `cd automationtest && npm run test:raw -- specs/auth/linux-password-route-guard.spec.mjs`
- `cd automationtest && npm run test:raw -- specs/workspace/linux-passwords-smoke.spec.mjs`

## 实现约束与已修复问题

### 密码缓存生命周期

- `visiblePasswords` 与 `revealedPasswords` 在 `loadServers()` 成功返回后自动清空，防止服务器列表刷新后显示过期的已解密密码。
- 同一 credential 的"显示密码"请求在飞行中时，重复点击不会触发第二次 `VIEW` 审计事件；`revealingCredentials` Set 在请求完成前守护并发调用。

### 凭证列表 key 稳定性

- `LinuxPasswordForm` 中每个凭证条目使用模块内自增的 `_localKey` 作为 Vue `:key`，而不是 `credential.id || index`。这确保在删除中间项或尚无后端 ID 的新增凭证时，Vue 不会复用错误的 DOM 节点。

### 筛选组件 prop 不可变原则

- `LinuxPasswordAuditFilters` 维护内部 `localFilters` 副本，通过 `@input` / `@change` 处理器触发 `update:filters` 事件，不直接修改父组件传入的 `filters` prop。
- `LinuxPasswordAuditPage` 监听 `update:filters` 并以 `Object.assign(model.filters, $event)` 将变更同步回 composable 状态。
- `resetFilters()` 调用后，composable 重置 `filters` reactive 对象，`LinuxPasswordAuditFilters` 通过 `watch(props.filters, ...)` 将本地副本同步回默认值。

## 后续演进预留

若后续需要继续增强，可在保持当前页面结构不变的前提下继续扩展：

- 详情接口独立加载
- 更细的字段脱敏 / 审计
- 审计记录查询页面
- 业务单元独立字典接口
