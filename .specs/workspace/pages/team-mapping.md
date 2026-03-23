# Workspace 团队管理页

## 页面定位

团队管理页负责维护面向下游展示与排班组织的团队定义，包括名称、颜色、顺序、可见性与描述信息。

## 源码与依赖

| 类型 | 位置 |
|------|------|
| 页面组件 | `src/features/workspace/pages/TeamMappingPage.vue` |
| 共享组件 | `WorkspaceDrawer.vue`、`WorkspacePageHeader.vue`、`WorkspaceSurface.vue` |
| 数据接口 | `GET/POST/PUT/DELETE /api/workspace/teams` |

## 核心交互

- 团队卡片展示顺序、可见性与颜色等关键信息。
- 隐藏团队仍可在管理端看见，但会被明确标注为不进入下游展示。
- 右侧预览区提供面向公开看板的紧凑只读视图。
- 新建、编辑、删除通过抽屉表单完成。
- 保存失败时，需要对名称、颜色、顺序与描述字段返回明确错误。

## 数据边界与约束

- 团队是 Viewer 与 Workspace 之间共享的重要分组概念，修改后会影响多个视图。
- 团队业务标识仅为 `Team Name`；UI 不再维护单独的 `Team Code` 字段。
- 团队排序与可见性属于显式管理行为，不能隐式由前端本地规则推导。
- 删除操作必须给出明确确认，而不是弱化为普通按钮点击。

## 维护提示

- 若团队映射逻辑进一步复杂化，应将预览模型或 role group 兼容策略拆出独立子文档。
- 字段结构、可见性语义或 role group 关系变化时，需要同步更新前后端对应 spec。
