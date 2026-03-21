# Workspace 共享组件手册

## 文档定位

本文件登记 Workspace 范围内可跨页面复用的共享组件，帮助维护者快速判断某个 UI 能力是否应放入公共层，而不是在页面内重复实现。

## 组件目录

| 组件 | 源码位置 | 主要职责 | 典型使用场景 |
|------|----------|----------|--------------|
| `WorkspacePageHeader.vue` | `src/features/workspace/components/WorkspacePageHeader.vue` | 统一页面标题、摘要与 actions 区域 | Overview、Staff、Shifts、Validation |
| `WorkspaceSurface.vue` | `src/features/workspace/components/WorkspaceSurface.vue` | 统一卡片/面板表面层级 | 统计卡、列表区、详情区 |
| `WorkspaceDrawer.vue` | `src/features/workspace/components/WorkspaceDrawer.vue` | 统一抽屉容器、标题区与底部动作区 | 人员编辑、班次编辑、排班编辑 |
| `OverviewStatCard.vue` | `src/features/workspace/components/OverviewStatCard.vue` | 统一首页 KPI 卡片表达 | Overview 首页 |
| `RosterGrid.vue` | `src/features/workspace/components/roster/RosterGrid.vue` | 承载月度排班矩阵与单元格交互 | Monthly Roster |
| `AssignmentDrawer.vue` | `src/features/workspace/components/roster/AssignmentDrawer.vue` | 承载单元格编辑与告警信息 | Monthly Roster |

## 共享组件判定规则

一个组件适合进入本目录，通常满足以下条件：

- 跨两个及以上页面复用。
- 承载稳定的结构职责，而不是临时样式片段。
- 需要被文档化为工作台统一交互模式的一部分。

## 设计约束

- 共享组件优先表达稳定结构，不承载过多业务分支判断。
- 页面私有字段映射、API 调用与业务验证逻辑，应保留在页面或 composable 中。
- 组件命名、插槽与动作区层级需要保持一致，避免每页一套交互习惯。

## 维护规则

- 新增共享组件时，必须补充到本文件并说明其职责与使用场景。
- 若组件退化为页面私有实现，应从本文件移除并说明归属变化。

