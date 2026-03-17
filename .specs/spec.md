# Support Roster UI Spec Index

## 文档定位

本目录是 support-roster-ui 的正式前端规格入口，负责描述当前 Vue 应用的页面边界、架构分层、模块职责、交互约束与视觉规范。

当前前端包含两套体验：

- Public Viewer：只读排班看板，路由位于 `/viewer`
- Admin Workspace：管理工作台，详细规格统一收敛到 `workspace/`
- Root Entry：入口分流关系见 `workspace/routing.md`

## 目录结构

```
.specs/
├── spec.md
├── architecture.md
├── deployment.md
├── ui-design.md
├── modules/
│   ├── index.md
│   ├── dashboard.md
│   ├── header.md
│   └── timeline.md
├── workspace/
│   ├── index.md
│   ├── architecture.md
│   ├── layout.md
│   ├── routing.md
│   ├── ui-design.md
│   ├── components/
│   └── pages/
└── CHANGELOG.md
```

## 阅读顺序

1. 先读 `spec.md` 了解产品边界与文档导航
2. 再读 `architecture.md` 了解应用入口、路由和数据流
3. 需要了解容器化与部署边界时，读 `deployment.md`
4. Public Viewer 相关改动进入 `modules/index.md`
5. Admin Workspace 相关改动进入 `workspace/index.md`
6. 视觉、排版、颜色与组件风格统一参考 `ui-design.md`

## 主题边界

### 根级文档

- `spec.md`：总入口、范围说明、导航索引、跨主题约束
- `architecture.md`：前端整体架构与顶层分流关系，不展开 workspace 子域实现
- `deployment.md`：前端构建产物、容器化运行方式与部署约束
- `ui-design.md`：共用视觉规范与 Public Viewer 设计说明，workspace 视觉文档在 `workspace/ui-design.md`

### Public Viewer

- `modules/`：传统只读排班看板模块说明
- 适用对象：`src/components/`、`src/pages/PublicDashboardPage.vue`、`src/api/index.js`

### Admin Workspace

- `workspace/`：工作台信息架构、页面规格、共享组件、路由、布局与视觉规范
- 适用对象：`src/features/workspace/`、`src/router/index.js`

## 当前实现摘要

### 技术栈

| 层级 | 选型 | 当前用途 |
|------|------|----------|
| 框架 | Vue 3 | 单页应用、Composition API |
| 构建 | Vite | 本地开发与打包 |
| 路由 | Vue Router | 根级入口分流与页面导航 |
| 样式 | Tailwind CSS | 前端样式系统基础设施 |
| 状态 | Vue Reactivity | 各产品域状态细节见对应子目录 |
| 数据请求 | fetch API 封装 | Viewer 与 Workspace 共用请求层；workspace 调用 `/api/workspace/**` |

### 业务事实

| 主题 | 当前事实 |
|------|----------|
| 主班次代码 | `OC`、`DS`、`NS`、`A`、`B`、`D` |
| 非主班次 | `C`、`BH`、`HoL` 等不会进入 `/api/shifts` 主班次输出 |
| 权限模型 | 当前无登录、无 RBAC、无前端角色态 |
| Timeline 能力 | 固定宽度时间轴、横向滚动、重叠泳道布局、Tooltip |

## 变更准则

- 修改 viewer 页面结构、组件职责或数据流时，更新 `modules/` 与 `architecture.md`
- 修改构建、容器化或部署方式时，更新 `deployment.md`
- 修改 workspace 页面、共享组件、布局或路由时，更新 `workspace/`
- 修改 Public Viewer 或全局共用视觉语言时，更新 `ui-design.md`
- 修改 workspace 视觉语言、界面密度或管理端样式约束时，更新 `workspace/ui-design.md`
- 新增一级主题文档或目录时，必须同步回写本文件导航

## 文档导航

- [整体架构](./architecture.md)
- [部署规范](./deployment.md)
- [UI 设计规范](./ui-design.md)
- [Public Viewer 模块索引](./modules/index.md)
- [Admin Workspace 索引](./workspace/index.md)
- [Spec 变更记录](./CHANGELOG.md)
