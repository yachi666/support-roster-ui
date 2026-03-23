# Workspace Auth 专题目录

## 文档定位

本专题描述 Admin Workspace 的登录页、会话恢复、路由守卫、账号管理页与基于角色/团队范围的交互约束。

## 阅读路径

| 目标 | 建议顺序 |
|---|---|
| 先理解登录与路由边界 | [login-and-session.md](./login-and-session.md) |
| 评审页面与按钮级权限行为 | [access-control.md](./access-control.md) |
| 评审账号管理 UI | [accounts-page.md](./accounts-page.md) |

## 文档目录

| 文档 | 主题 | 说明 |
|---|---|---|
| [login-and-session.md](./login-and-session.md) | 登录与会话 | `/login`、token 持久化、`/api/auth/me` 恢复流程 |
| [access-control.md](./access-control.md) | 路由与操作控制 | workspace 受保护路由、角色与 team 范围驱动的 UI 行为 |
| [accounts-page.md](./accounts-page.md) | 账号管理页 | 创建账号、角色分配、team 授权、禁用与重置密码 |
| [acceptance-checklist.md](./acceptance-checklist.md) | 首次验收清单 | 上线后验证 viewer、login、admin、editor、readonly 与会话行为 |
