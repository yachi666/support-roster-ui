# 账号管理页规范

## 页面定位

账号管理页属于 Admin Workspace 主数据管理能力，建议路由为 `/workspace/accounts`，导航位置放在 `Teams` 之后、`Import / Export` 之前。

## 页面目标

- 查看账号列表与状态
- 为 staff 创建账号
- 分配角色
- 为 `editor` 配置可编辑 team
- 禁用 / 启用账号
- 重置密码

## 列表字段建议

- Staff ID
- Staff Name
- Role
- Account Status
- Auth Source
- Editable Teams
- Last Login At
- Actions

## 表单规则

- 创建账号时建议先选择 `team`，再从该 team 下的 staff 列表中选择目标人员。
- 创建账号时必须选择已存在的 `staff`。
- 一个 `staff` 只能绑定一个账号。
- 创建流程中的 team 选择主要用于缩小 staff 选择范围与提供默认 editor scope，不会单独写入账号表。
- 角色为 `editor` 时必须至少选择一个 team。
- 当创建 `editor` 账号并选定 staff 后，应默认勾选该 staff 所属的 team，管理员仍可继续补充更多 team。
- 角色为 `admin` 或 `readonly` 时，team scope 可清空。
- 重置密码后，账号应回到 `PENDING_ACTIVATION` 或等效待激活状态。

## 交互要求

- 账号列表支持按 `staffid / 姓名 / 状态 / 角色` 搜索或筛选。
- 创建、编辑和查看详情建议沿用现有 workspace drawer 交互。
- 为降低对既有账号的误操作风险，“先选 team 再选 staff”的流程仅要求应用于创建账号；编辑已有账号时保留原始 staff 绑定，不支持切换 staff。
- 禁用与重置密码属于高风险操作，需要二次确认。
- 页面的当前用户摘要与 Sidebar 底部身份信息应来自真实登录态，而不是硬编码文案。
