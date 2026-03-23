# Workspace 路由规范

## 文档定位

本文件定义 `/workspace` 产品域的路由树、页面入口与导航规则，用于保证侧边导航、默认入口与页面分册说明保持一致。

## 路由树

```mermaid
graph TD
    ROOT[/]
    VIEWER[/viewer]
    WS[/workspace]
    OVERVIEW[/workspace -> overview]
    ROSTER[/workspace/roster]
    STAFF[/workspace/staff]
    SHIFTS[/workspace/shifts]
    TEAMS[/workspace/teams]
    IMPORT[/workspace/import-export]
    VALIDATION[/workspace/validation]

    ROOT --> WS
    ROOT --> VIEWER
    WS --> OVERVIEW
    WS --> ROSTER
    WS --> STAFF
    WS --> SHIFTS
    WS --> TEAMS
    WS --> IMPORT
    WS --> VALIDATION
```

## 路由目录表

| 路由 | 页面组件 | 主要用途 |
|------|----------|----------|
| `/` | redirect | 默认重定向到 `/viewer` |
| `/viewer` | `src/pages/PublicDashboardPage.vue` | 公开只读排班看板 |
| `/login` | `src/pages/LoginPage.vue` | 管理端登录与首登设密入口 |
| `/workspace` | `OverviewDashboardPage.vue` | Workspace 首页 |
| `/workspace/roster` | `MonthlyRosterPlannerPage.vue` | 月度排班编辑 |
| `/workspace/staff` | `StaffDirectoryPage.vue` | 人员目录与详情抽屉 |
| `/workspace/shifts` | `ShiftDefinitionsPage.vue` | 班次定义与共享关系维护 |
| `/workspace/teams` | `TeamMappingPage.vue` | 团队可见性、顺序与映射维护 |
| `/workspace/import-export` | `ImportExportCenterPage.vue` | 导入预览、应用、导出与模板下载 |
| `/workspace/validation` | `ValidationCenterPage.vue` | 问题聚合与处理 |
| `/workspace/accounts` | `AccountManagementPage.vue` | 账号管理、角色分配与 team 授权 |

## 路由规则

- `/workspace/**` 路由在进入页面前必须完成登录态校验；未登录时跳转 `/login`，并保留原目标地址。
- `/workspace/accounts` 仅允许 `admin` 访问；其余角色进入时应跳回允许页面并展示权限提示。
- `/workspace` 作为管理端主入口，应保持稳定，不与 viewer 混用。
- 侧边导航顺序、路由表和 `workspace/index.md` 目录顺序应保持一致。
- 直接访问或刷新任一 workspace 路由时，都必须由前端 history 路由正确回退到 `index.html`。
- Workspace 页面基于“月度工作上下文”运作，因此路由层不额外维护日级日期状态。

## 导航与分册协同

- 新增页面路由时，必须同时更新侧边导航配置与 `workspace/index.md`。
- 若某个页面不再出现在导航中，应保留或迁移其 spec，并在本文件说明去向。
- 仅属于 Viewer 的页面不得登记到本文件。
