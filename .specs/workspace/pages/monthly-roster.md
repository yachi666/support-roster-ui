# Workspace 月度排班页

## 页面定位

月度排班页负责以高密度矩阵形式展示整月排班，并通过右侧抽屉完成单元格级别的编辑、保存与回滚，是 Workspace 中交互最复杂的页面之一。

## 源码与依赖

| 类型 | 位置 |
|------|------|
| 页面组件 | `src/features/workspace/pages/MonthlyRosterPlannerPage.vue` |
| 共享组件 | `RosterGrid.vue`、`AssignmentDrawer.vue`、`WorkspacePageHeader.vue` |
| 状态抽象 | `src/features/workspace/composables/useRosterPlanner.js` |
| 读取接口 | `GET /api/workspace/roster?year=&month=` |
| 保存接口 | `POST /api/workspace/roster/save` |

## 页面流程图

```mermaid
flowchart LR
    LOAD[按当前 year/month 加载月视图] --> GRID[渲染团队/人员/日期矩阵]
    GRID --> SELECT[选择单元格]
    SELECT --> DRAWER[打开 AssignmentDrawer]
    DRAWER --> APPLY[修改 shiftCode 到工作副本]
    APPLY --> SAVE[提交增量 updates]
    SAVE --> REFRESH[使用服务端最新月视图回填页面]
    APPLY --> DISCARD[放弃修改并恢复最近快照]
```

## 核心交互

- 选择单元格后打开抽屉，编辑当前员工在指定日期上的班次编码。
- 编辑先作用于本地工作副本，再统一通过保存接口提交 `updates`。
- 切换月份时，页面按共享 workspace 月份上下文重新拉取整月视图。
- 保存成功后用服务端最新响应回填网格，而不是乐观地只改当前单元格。
- 放弃修改会恢复最近一次服务端快照。

## 数据边界与约束

- `staffId` 按字符串传输，避免浏览器处理大整数时丢精度。
- `shiftDetailsByTeam` 用于单元格 hover 展示班次说明、时间窗口、时区与跨天信息。
- `validationWarning` 用于提示当前月视图对应的服务端告警。
- 页面只负责排班编辑体验，不负责定义班次或维护人员主数据。

## 维护提示

- 若排班网格继续复杂化，应把网格算法、抽屉协议或保存冲突策略拆成独立子章节。
- 月份上下文、保存载荷或 tooltip 信息结构变化时，必须同步更新本页与服务端对应 spec。

