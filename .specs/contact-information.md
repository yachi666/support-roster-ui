# 支持团队联系信息页设计规格

## 文档定位

本文件定义独立页面 **支持团队联系信息页** 的路由边界、视觉结构、组件拆分、mock 数据策略与当前验收范围。该页面视觉和交互来源于 `figma-contactInformation/src/app/*`，但最终以 `support-roster-ui` 的 Vue 结构落地。

## 目标

- 将 Figma Maker 生成的支持团队联系信息列表页与新增页转换为 Vue 页面并接入当前前端项目。
- 保持新页面为项目内独立全屏模块，不并入现有 `/workspace/**` 壳层。
- 当前阶段优先完成桌面端视觉还原、明显的基础交互与本地 mock 数据演示。

## 非目标

- 本期不接入真实接口、不新增 Pinia 状态、不做持久化写入。
- 本期不把页面挂入现有导航菜单。
- 本期不改造 workspace 权限策略或侧边导航结构。

## 路由与访问边界

### 顶层路由

- ` /contact-information `：支持团队联系信息列表页
- ` /contact-information/add `：新增支持团队联系信息页
- 页面通过独立 `ContactInformationLayout` 承载顶部导航和全屏容器，不复用 `WorkspaceLayout`。

### 访问策略

- 当前路由为 **公开访问**，不要求登录。
- 页面不参与 workspace 页面权限配置，也不加入 workspace 默认入口计算。
- 顶部 “Add Team” 入口仅在列表页显示；新增页使用返回按钮回到列表页。

### 跨页入口位置

- `src/components/Header.vue`：viewer 顶部新增 **Contact Information** 按钮，并与 **Linux Password Vault** 作为同级工具入口出现。
- `src/features/workspace/components/WorkspaceTopbar.vue`：workspace 顶部新增 **Contact Information** 按钮，并与 **Linux Password Vault** 共用同一套 secondary action 骨架。
- `src/features/linux-passwords/pages/LinuxPasswordsPage.vue`：Linux Password Vault 顶部新增 **Contact Information** 按钮，形成跨独立页与主产品域之间的稳定跳转入口。

## 页面结构与组件边界

为避免把整套 Figma 页面压成一个大组件，当前实现采用“独立布局 + 路由页 + 交互组件 + mock 数据”的拆分。

| 组件 / 模块 | 单一职责 |
|---|---|
| `ContactInformationLayout` | 提供页面独立顶栏、共享搜索输入与公共容器 |
| `SupportTeamContactsPage` | 组装列表页、处理搜索结果、复制反馈与提交成功提示 |
| `ContactInformationTable` | 渲染 Figma 风格表格、粘性首列、复制按钮和空状态 |
| `StaffIdHoverCard` | 展示 Staff ID 的 hover 信息卡 |
| `SupportTeamContactCreatePage` | 组装新增页、处理返回与 mock 成功跳转 |
| `SupportTeamContactForm` | 承载表单区块、token 输入、自定义链接与前端校验 |
| `contactInformationMock.js` | 存放团队、成员、角色与 Staff ID 的 mock 数据 |

### 当前实现文件

- `src/features/contact-information/layout/ContactInformationLayout.vue`
- `src/features/contact-information/pages/SupportTeamContactsPage.vue`
- `src/features/contact-information/pages/SupportTeamContactCreatePage.vue`
- `src/features/contact-information/components/ContactInformationTable.vue`
- `src/features/contact-information/components/StaffIdHoverCard.vue`
- `src/features/contact-information/components/SupportTeamContactForm.vue`
- `src/features/contact-information/data/contactInformationMock.js`
- `src/router/index.js`

## 视觉与布局约束

- 页面采用 **独立全屏浅色工作台** 风格，顶部固定导航、内容区居中最大宽度 `1600px`。
- 视觉目标优先贴近 Figma：白色表面、浅灰背景、细边框、轻阴影、较高信息密度表格。
- 跨页入口遵循两层层级：`Contact Information` 与 `Linux Password Vault` 为同级次级工具入口，`Enter Workspace` / `Open Viewer` 维持更高主动作辨识度。
- 列表页保留表头、首列粘性、角色彩色标签、Staff ID hover 卡片、底部分页占位。
- 新增页保留分段表单、token 风格角色与 Staff ID 输入、自定义链接动态增删、底部吸附操作区。
- 当前以桌面端优先；移动端只要求布局不炸裂和可浏览，不要求逐像素还原。

## 交互范围

### 列表页

- 顶部搜索框按团队名、角色、Staff ID、团队邮箱、xMatter、GSD、EIM 与附加链接做本地过滤。
- Staff ID 以 hover 卡片展示头像、姓名、员工号和邮箱。
- `xMatter Group` 与 `GSD Group` 支持点击复制；复制失败时显示明确提示。
- Team Email 保留 `mailto:` 跳转。
- 右上角和页面内容区都可进入新增页。
- 分页区域当前仅保留静态占位，不接真实分页逻辑。

### 新增页

- 角色输入支持回车添加、退格删除与预设角色快捷补充。
- Staff ID 输入支持回车添加、退格删除与快速补充候选值。
- 自定义链接支持新增行与删除行。
- 表单提交前执行基础校验：团队名、团队邮箱、至少一个角色、至少一个 Staff ID。
- 提交成功后返回列表页，并通过 query 触发一次性成功提示；不写入持久数据。

## 数据策略

- 页面数据统一来自 `contactInformationMock.js`。
- 列表页展示的团队数据为静态 mock。
- 新增页提交结果只用于演示成功流，不会合并回列表数据源；刷新后仍恢复初始 mock 数据。
- 这样做的目的是在不引入接口与状态管理复杂度的前提下，先稳定视觉结构与交互壳。

## 验收范围

### 路由接入

- 直接访问 `/contact-information` 可以打开独立列表页。
- 直接访问 `/contact-information/add` 可以打开独立新增页。
- 两个页面都不依赖 `/workspace` 壳层。

### 视觉与交互

- 列表页整体布局、表格密度和新增页分区结构与 Figma 主体一致。
- 搜索、hover 卡片、复制、返回、表单 token 输入和自定义链接增删可用。
- mock 提交流程能够回到列表页并看到成功提示。

## 验证命令

- `cd support-roster-ui && node --test src/router/index.test.js`
- `cd support-roster-ui && node --test`
- `cd support-roster-ui && npm run build`
