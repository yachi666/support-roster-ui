# 路由与交互权限控制

## 路由规则

| 路由 | 访问条件 |
|---|---|
| `/viewer` | 匿名可访问 |
| `/login` | 匿名可访问；已登录访问时可跳回 `/workspace` |
| `/workspace` | 已登录 |
| `/workspace/accounts` | `admin` |
| 其余 `/workspace/*` | 已登录，具体写操作再按角色和 team 范围判断 |
| `/linux-passwords` | 由 `workspace access policy` 的 `linux-passwords` 配置决定；默认需要登录 |

## 角色交互约束

### `admin`

- 可访问全部 workspace 页面。
- 可创建账号、分配角色、编辑 team 授权、禁用账号、重置密码。
- 可编辑所有 staff、team、shift、roster、validation、import/export 数据。

### `editor`

- 可访问 Overview、Staff、Shift Definitions、Monthly Roster、Validation、Import / Export。
- 不可访问 Accounts。
- Team 列表如保留可见，也只能作为只读参考。
- 对 staff / shift / roster / validation / import-export 的可写行为，仅在目标 team 处于 `editableTeamIds` 内时启用。

### `readonly`

- 可进入 workspace 查看数据。
- 所有创建、保存、删除、导入应用、问题处理按钮默认禁用。
- 允许使用查看型筛选、搜索和导出能力。

## 前端行为原则

- 路由守卫只解决“能否进入页面”。
- 独立路由也可复用 `workspace access policy`。当前 `linux-passwords` 不属于 `/workspace/*`，但仍通过同一策略开关控制匿名访问。
- 页面内部按钮、表单和筛选需继续根据 `role` 与 `editableTeamIds` 控制。
- 前端隐藏/禁用并不替代后端校验；任何失败都要展示后端返回的明确错误。
