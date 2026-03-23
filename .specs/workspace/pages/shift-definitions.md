# Workspace 班次定义页

## 页面定位

班次定义页用于维护班次编码、含义、开始时间、时长、时区、颜色与共享团队关系，是排班矩阵与导入导出流程的上游主数据页面。

## 源码与依赖

| 类型 | 位置 |
|------|------|
| 页面组件 | `src/features/workspace/pages/ShiftDefinitionsPage.vue` |
| 共享组件 | `WorkspaceDrawer.vue`、`WorkspacePageHeader.vue`、`WorkspaceSurface.vue` |
| 数据接口 | `GET/POST/PUT/DELETE /api/workspace/shift-definitions` |
| 关联接口 | `GET /api/workspace/teams` |

## 核心交互

- 搜索匹配班次编码、含义与共享团队名称。
- 单个班次可关联多个团队，列表以紧凑标签展示共享关系。
- 时间预览条基于 `startTime`、`durationMinutes` 与 `colorHex` 渲染；24 小时班次显示为整日覆盖。
- 新建与编辑使用抽屉表单完成，支持 30 分钟粒度开始时间选择、分钟级时长输入与快捷预设。
- 删除通过抽屉内的显式确认区触发。

## 数据边界与约束

- 班次不仅影响月排班可选项，也影响导入校验和 tooltip 展示。
- 团队关联使用多选结构，而不是单团队字段。
- 表单需要承接来自后端的字段级校验错误，包括团队、编码、开始时间、时长、时区与颜色。
- 历史排班格子的显示依赖 `shiftDefinitionId` 对应的最新定义，因此修改 `Shift Code` 后，旧排班格也会显示新编码。

## 维护提示

- 若后续引入更复杂的班次共享或模板继承能力，应拆出独立子文档。
- 任何班次字段、共享策略或校验方式变动，都需要同步回写本页和服务端 `shift-definitions` spec。
