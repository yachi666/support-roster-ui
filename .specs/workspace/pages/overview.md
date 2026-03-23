# Workspace 首页概览页

## 页面定位

总览页负责给管理员提供当前月份排班健康度、覆盖情况、近期活动与快捷操作入口，是进入 Workspace 后的默认着陆页。它应更像“月度排班驾驶舱”，而不是把 Validation、活动流、操作入口并排竞争注意力。

## 源码与依赖

| 类型 | 位置 |
|------|------|
| 页面组件 | `src/features/workspace/pages/OverviewDashboardPage.vue` |
| 共享组件 | `OverviewStatCard.vue`、`WorkspacePageHeader.vue`、`WorkspaceSurface.vue` |
| 数据接口 | `api.workspace.getOverview()` |
| 跳转辅助 | `getWorkspaceQuickActionTarget()` |

## 核心内容

- Month Hero：明确展示当前共享 workspace 月份、时区与当月排班总述。
- KPI 指标卡：优先呈现当月排班完成度、已排班量等月度摘要。
- Monthly Signals：把最值得先看的 1~3 个排班信号集中展示，帮助管理员先判断“这个月整体是否健康”。
- Validation Watch：只保留一块紧凑提醒区，用于提示是否需要进入 Validation Center 深入处理。
- Recent Activity：展示最近发生的关键后台操作或状态变化。
- Quick Actions：提供进入月排班、导入导出、导出结果与 Validation Center 的后续动作入口。

## 数据边界

- KPI、活动流与快捷操作都来自 `/api/workspace/overview?year=&month=`，并应与共享 workspace 月份保持一致。
- 前端可基于 `stats.status`、`stats.progress` 与 `quickActions.actionKey` 做二次编排与优先级排序，但不应自行虚构新的业务数据。
- 总览页更关注“聚合概览”，不直接承载细粒度编辑流程。
- 页面内跳转应复用现有 workspace 路由，而不是旁路新入口。

## 交互与呈现建议

- 页面首屏应先回答“这个月的排班现在怎么样”，再展示细项指标。
- 当存在 `warning` / `error` 指标时，应优先将其提升到月度摘要区，而不是让 Validation 模块抢占整页。
- Validation 相关内容应压缩为一块次级提醒卡，默认承担“是否需要深入处理”的提示职责，而不是替代 Validation Center 本身。
- Quick Actions 不应只是文本链接，更适合作为带目的说明的动作卡片。
- Recent Activity 应以时间流形式展示，并突出操作者、动作和相对时间。
- 若概览数据为空，页面仍应保留明确的空态与刷新入口，而不是展示结构缺失的半成品页面。

## 维护提示

- 若新增首页卡片或快捷入口，需要同时更新本页 spec 与 `workspace/index.md` 的目录说明。
- 若首页开始承载复杂子流程，应拆出独立子文档，而不是持续堆积在本页。
