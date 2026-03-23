# Workspace Auth 首次验收清单

## 使用方式

- 首次上线后，建议由产品/研发/运维共同走查一次。
- 每一项都应记录结果：通过 / 不通过 / 备注。
- 若环境启用了 `SUPPORT_BOOTSTRAP_ADMIN_STAFF_CODE`，应在“管理员接管完成”后再次回归一次关键路径。

## A. 公共访问与登录入口

- [ ] 直接访问 `/viewer` 无需登录，页面可正常展示。
- [ ] 未登录访问 `/workspace` 时，会跳转到 `/login`。
- [ ] 未登录访问深层路由（如 `/workspace/accounts`）时，也会跳转到 `/login`。
- [ ] 登录页能明确区分“正常登录”和“首登设密”。

## B. 首个管理员激活

- [ ] 使用 `SUPPORT_BOOTSTRAP_ADMIN_STAFF_CODE` 对应的 `staffid` 可以进入首登设密流程。
- [ ] 首登设密成功后，能够进入 workspace 主界面。
- [ ] 已激活账号再次尝试首登设密时，会提示“密码已初始化，请直接登录”。
- [ ] 当前用户信息展示为 `admin`。
- [ ] 可以访问 `/workspace/accounts`。
- [ ] 管理员接管后，移除 `SUPPORT_BOOTSTRAP_ADMIN_STAFF_CODE` 并重启，原管理员仍能正常登录。

## C. 管理员能力

- [ ] 管理员可以创建 `readonly` 账号。
- [ ] 管理员可以创建 `editor` 账号，并要求至少指定一个 team。
- [ ] 管理员可以创建额外 `admin` 账号。
- [ ] 管理员可以禁用账号。
- [ ] 被禁用账号不能再次建立新会话。
- [ ] 管理员可以重置密码，目标账号回到 `PENDING_ACTIVATION`。

## D. Readonly 用户行为

- [ ] `readonly` 能成功登录 `/workspace`。
- [ ] `readonly` 可以查看团队、人员、班次、排班、验证结果。
- [ ] `readonly` 看不到或无法触发账号管理写操作。
- [ ] `readonly` 在月排班页不能保存修改。
- [ ] `readonly` 在导入页不能预览导入、不能应用导入。
- [ ] `readonly` 在验证中心不能执行 `Fix now` 或 `Resolve Selected`。

## E. Editor 用户行为

- [ ] `editor` 只能看到被授权 team 的可编辑数据。
- [ ] `editor` 可以编辑自己被授权 team 的 staff / shift / roster。
- [ ] `editor` 无法管理 team 主数据。
- [ ] `editor` 无法访问账号管理页。
- [ ] `editor` 不能修改未授权 team 的数据，后端返回明确拒绝。

## F. 会话与异常处理

- [ ] 登录成功后，刷新页面仍能恢复会话。
- [ ] token 失效后，请求返回 `401`，前端能清理本地登录态并要求重新登录。
- [ ] 已登录但权限不足时，页面呈现明确提示，而不是静默失败。
- [ ] 点击退出登录后，重新访问 `/workspace` 需要再次登录。

## G. Viewer / Workspace 边界

- [ ] `/viewer` 保持匿名可访问，不受 workspace 登录态影响。
- [ ] workspace 登录后再访问 `/viewer`，公开展示行为不受破坏。
- [ ] workspace 鉴权失败不会影响 viewer 接口访问。

## H. 验收收尾

- [ ] 至少保留两个 `admin` 账号，避免单点人员风险。
- [ ] 已移除 `SUPPORT_BOOTSTRAP_ADMIN_STAFF_CODE`。
- [ ] 已记录首个管理员 `staffid` 与接管人信息。
- [ ] 已确认后续 SSO 接入前，当前密码首登方案仅限内网/测试环境使用。
