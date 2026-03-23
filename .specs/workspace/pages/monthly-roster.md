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
- 页面需要直接在网格中标识未保存改动，避免用户只能依赖底部保存条判断是否有待提交修改。
- 抽屉应清楚展示“当前班次 / 待应用班次 / 日期”，避免把单日编辑误读为区间编辑。
- 网格应支持方向键移动当前选中单元格，并允许使用 `Enter` 或 `Space` 打开当前格子的编辑抽屉。
- 抽屉应支持连续编辑，例如“应用并跳到下一天”，减少同一员工跨多天排班时的重复点击。
- 抽屉可提供低风险的快捷复用入口，例如沿用前一天或上周同日的班次，减少重复选择编码的次数。
- 抽屉可提供“复制当前周到下一周”的快捷动作，复制后应跳转到目标周起始日，便于管理员立即复核结果。
- 抽屉可提供“从当前日批量填充到指定结束日”的区间动作，用于同一员工的连续多日排班编辑。
- 网格可支持同一员工行内拖拽连续日期形成区间选择；松手后应打开抽屉，并让区间填充默认采用该拖拽范围。
- 当存在拖拽区间选择时，页面或抽屉应提供显式的区间提示与清除入口，避免用户误把区间操作带到下一次编辑。
- 切换月份时，页面按共享 workspace 月份上下文重新拉取整月视图。
- 若存在未保存修改，切换月份或离开页面前应进行明确确认，降低误丢数据风险。
- 保存成功后用服务端最新响应回填网格，而不是乐观地只改当前单元格。
- 放弃修改会恢复最近一次服务端快照。

## 数据边界与约束

- `staffId` 按字符串传输，避免浏览器处理大整数时丢精度。
- `shiftDetailsByTeam` 用于单元格 hover 展示班次说明、时间窗口、时区与跨天信息。
- 单元格展示的班次编码以服务端按 `shiftDefinitionId` 解析后的最新值为准，因此 Shift Code 改名会同步体现在历史排班中。
- `validationWarning` 用于提示当前月视图对应的服务端告警。
- 当前 workspace 的 `year`、`month`、`timezone` 应同步到 URL query，提升刷新恢复、回退和分享链接的一致性。
- 页面只负责排班编辑体验，不负责定义班次或维护人员主数据。

## 维护提示

- 若排班网格继续复杂化，应把网格算法、抽屉协议或保存冲突策略拆成独立子章节。
- 月份上下文、保存载荷或 tooltip 信息结构变化时，必须同步更新本页与服务端对应 spec。
