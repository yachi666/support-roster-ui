# Workspace 首页概览页

## 页面定位

总览页负责给管理员提供当前排班健康度、近期活动与快捷操作入口，是进入 Workspace 后的默认着陆页。

## 源码与依赖

| 类型 | 位置 |
|------|------|
| 页面组件 | `src/features/workspace/pages/OverviewDashboardPage.vue` |
| 共享组件 | `OverviewStatCard.vue`、`WorkspacePageHeader.vue`、`WorkspaceSurface.vue` |
| 数据接口 | `api.workspace.getOverview()` |
| 跳转辅助 | `getWorkspaceQuickActionTarget()` |

## 核心内容

- KPI 指标卡：提供排班状态、覆盖情况与问题摘要。
- Recent Activity：展示最近发生的关键后台操作或状态变化。
- Quick Actions：把高频任务跳转到对应管理页面。

## 数据边界

- KPI、活动流与快捷操作都来自 `/api/workspace/overview`。
- 总览页更关注“聚合概览”，不直接承载细粒度编辑流程。
- 页面内跳转应复用现有 workspace 路由，而不是旁路新入口。

## 维护提示

- 若新增首页卡片或快捷入口，需要同时更新本页 spec 与 `workspace/index.md` 的目录说明。
- 若首页开始承载复杂子流程，应拆出独立子文档，而不是持续堆积在本页。

