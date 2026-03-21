# Spec Change Log

## 2026-03-21

### 摘要

将 `support-roster-ui/.specs` 重排为更接近技术手册的目录体系：强化根入口与 Workspace 分册的“目录感”，统一页面说明的章节模板，并补充 Mermaid 关系图与流程图。

### 主要变更

| 文件 | 变更说明 |
|------|----------|
| `spec.md` | 重写为总目录页，补充章节目录、推荐阅读顺序与文档架构图 |
| `architecture.md` | 改写为前端架构总览，补充系统分流图与数据流图 |
| `modules/index.md` | 改成 Viewer 分册目录页，强化模块关系与阅读顺序 |
| `workspace/index.md` | 改成 Workspace 分册总目录，补充章节表与信息架构图 |
| `workspace/architecture.md` | 重写为工作台架构页，明确分层职责与集成边界 |
| `workspace/routing.md` | 重写为路由规范页，补充路由树图 |
| `workspace/layout.md` | 重写为壳层布局页，明确 Sidebar / Topbar / RouterView 职责 |
| `workspace/components/shared.md` | 重写为共享组件手册，统一组件登记方式 |
| `workspace/pages/*.md` | 统一为“页面定位 / 源码依赖 / 核心交互 / 数据边界 / 维护提示”结构 |
| `deployment.md`、`ui-design.md`、`workspace/ui-design.md`、`modules/*.md` | 补充统一前言与阅读提示，提升整套 spec 的一致性 |

## 2026-03-17

### Summary

本次变更为前端新增 ECS Fargate + ECR 容器化部署方案，并补充对应的部署规范文档与导航入口。

### Files Changed

- `.specs/spec.md`
- `.specs/architecture.md`
- `.specs/deployment.md`
- `.specs/CHANGELOG.md`
- `build/ecs-task-definition.example.json`
- `build/push-to-ecr.example.sh`

### Detailed Changes

| File | Section | Change Type | Before | After | Why |
|---|---|---|---|---|---|
| `.specs/spec.md` | 目录结构 / 阅读顺序 / 文档导航 | Update | 无部署主题入口 | 新增 `deployment.md` 导航与变更准则 | 让容器化部署有稳定承载位置，避免只写在 README |
| `.specs/architecture.md` | 部署与运行边界 | Add | 未说明产物与容器化运行方式 | 明确 `dist/`、Linux + Nginx、Fargate + Nginx 镜像三者关系 | 保持架构文档与实际运行方式一致 |
| `.specs/deployment.md` | 新文件 | Add | 无前端部署规范文档 | 新增构建、ECR、Fargate、ALB、健康检查与配置约束说明 | 为后续部署与运维变更提供规范入口 |
| `build/ecs-task-definition.example.json` | 新文件 | Add | 无 ECS 任务定义示例 | 新增 Fargate Task Definition 模板 | 让镜像部署到 ECS 时有可直接改值的起点 |
| `build/push-to-ecr.example.sh` | 新文件 | Add | 无本地推送脚本模板 | 新增 Docker build、ECR 登录、push、健康检查脚本 | 缩短从本地发布到 ECR 的操作路径 |

### Impact Assessment

- **Deployment Clarity**: 前端现在同时具备传统静态部署与 Fargate 容器部署说明。
- **Spec Maintainability**: 构建和容器化变更不再需要混写到架构或 UI 文档中。
- **Operational Consistency**: 明确了 `VITE_API_BASE_URL` 属于构建期变量，避免误以为可在 Fargate 运行期直接切换。

### Verification Notes

本次 spec 更新已对照以下实现事实进行同步：

- 项目打包脚本位于 `build/build-frontend.sh`
- 新增 `Dockerfile` 采用 Node 构建 + Nginx 运行静态资源
- 新增 `nginx.container.conf` 提供 SPA 路由回退与 `/health` 健康检查

## 2026-03-12

### Summary

本次变更为 Import/Export 页面新增导入模版示例模块，展示 Excel 导入格式并提供模版下载功能。

### Files Changed

- `.specs/workspace/pages/import-export.md`
- `.specs/CHANGELOG.md`

### Detailed Changes

| File | Section | Change Type | Before | After | Why |
|---|---|---|---|---|---|
| `.specs/workspace/pages/import-export.md` | Import Template Example | Add | 无模版示例说明 | 新增模版结构说明、3 个 sheet 格式、下载接口 | 为新增的模版示例功能提供规范文档 |

### Impact Assessment

- **Feature Documentation**: 导入模版功能已有完整规范描述。
- **API Contract**: 新增 `GET /api/workspace/import-export/template` 接口已记录。

### Verification Notes

本次 spec 更新已对照以下实现事实进行同步：

- `src/features/workspace/pages/ImportExportCenterPage.vue` 已新增模版示例展示区域
- `src/api/index.js` 已新增 `downloadTemplate()` API 调用

## 2026-03-11

### Summary

本次变更将 workspace 管理端从本地 mock 数据切换为真实后端接口驱动，并同步更新前端 spec，移除失效的“mock 数据中心”“纯前端导入流程”等描述。

### Files Changed

- `.specs/spec.md`
- `.specs/workspace/index.md`
- `.specs/workspace/architecture.md`
- `.specs/workspace/pages/overview.md`
- `.specs/workspace/pages/monthly-roster.md`
- `.specs/workspace/pages/staff-directory.md`
- `.specs/workspace/pages/shift-definitions.md`
- `.specs/workspace/pages/team-mapping.md`
- `.specs/workspace/pages/validation-center.md`
- `.specs/workspace/pages/import-export.md`
- `.specs/CHANGELOG.md`

### Detailed Changes

| File | Section | Change Type | Before | After | Why |
|---|---|---|---|---|---|
| `.specs/spec.md` | 技术栈摘要 | Update | 仅说明 viewer 通过 fetch 调后端 | 明确 viewer 与 workspace 共用请求层，workspace 调 `/api/workspace/**` | 保持根级 spec 与当前前端数据流一致 |
| `.specs/workspace/architecture.md` | 目录与设计决策 | Refactor | 仍描述 `workspaceData.js` mock 中心 | 改为 `api.workspace` + `navigation.js` + `period.js` + server-backed roster composable | 反映真实实现分层 |
| `.specs/workspace/pages/*.md` | 页面数据源与行为 | Update | 多处写为 mock 数据或前端模拟流程 | 全部改为真实 workspace API 路径与当前交互行为 | 避免后续开发继续依赖失效假设 |

### Impact Assessment

- **Spec Accuracy**: workspace 文档现在与真实 API 驱动实现对齐。
- **Maintainability**: 后续页面扩展将围绕 `api.workspace` 而不是重新引入 mock 数据。
- **Integration Clarity**: 导入导出、校验和月排班的后端边界在 spec 中已明确。

### Verification Notes

本次 spec 更新已对照以下实现事实进行同步：

- `src/api/index.js` 已新增 `api.workspace` 请求方法
- `src/features/workspace/composables/useRosterPlanner.js` 已改为后端加载与保存月排班
- `src/features/workspace/pages/*` 已去除对 `workspaceData.js` 的引用

### Backward Compatibility

本次变更不影响 viewer 路由与样式系统，但 workspace 页面已不再依赖本地 mock 数据。

## 2026-03-11

### Summary

本次变更针对前端 spec 目录做结构化整理，目的是把根入口、架构说明、viewer 模块索引与 workspace 子域边界拆清楚，减少总文档过载和主题混写问题。

后续补充整理要求：workspace 的内容描述统一收敛到 `.specs/workspace/`，根级文档仅保留引用、边界和导航。

### Files Changed

- `.specs/spec.md`
- `.specs/architecture.md`
- `.specs/ui-design.md`
- `.specs/modules/index.md` (new)
- `.specs/workspace/index.md`
- `.specs/workspace/ui-design.md` (new)
- `.specs/CHANGELOG.md`

### Detailed Changes

| File | Section | Change Type | Before | After | Why |
|---|---|---|---|---|---|
| `.specs/spec.md` | 全文结构 | Refactor | 根入口同时承担概述、业务事实、数据流、技术债、文档地图 | 重写为总入口索引，聚焦范围、主题边界、阅读顺序、文档导航 | 让 `spec.md` 回到“入口导航”职责，避免继续堆积细节 |
| `.specs/spec.md` | 文档导航 | Add | `modules/` 无局部入口 | 增加 `modules/index.md` 导航并在根入口标注 viewer/workspace 分工 | 提升目录可读性与可维护性 |
| `.specs/architecture.md` | 文档范围 | Refactor | 混入较多后端内部服务与数据层细节 | 聚焦前端 SPA、路由、分层、状态管理和集成边界 | 保持前端 spec 与当前仓库职责一致 |
| `.specs/modules/index.md` | 新文件 | Add | viewer 模块缺少目录索引 | 新增 viewer 模块索引、模块关系图、维护规则 | 与 `workspace/index.md` 形成对称结构 |
| `.specs/spec.md` / `.specs/architecture.md` / `.specs/ui-design.md` | workspace 描述 | Refactor | 根级文档保留了部分 workspace 细节说明 | 根级仅保留引用与边界，workspace 细节统一回收到 `.specs/workspace/` | 保持主题收口，避免跨目录重复维护 |
| `.specs/workspace/ui-design.md` | 新文件 | Add | workspace 缺少独立视觉文档承载点 | 新增管理端专属视觉规范 | 让 workspace 的视觉规则不再散落在根级文档或 layout 文档中 |

### Impact Assessment

- **Navigation**: 根入口更轻，阅读路径更明确。
- **Maintainability**: viewer 与 workspace 都有局部入口，后续扩展不必持续向 `spec.md` 堆内容。
- **Spec Accuracy**: 前端架构说明已与当前 Vue 路由和 feature 划分对齐。

### Verification Notes

本次整理已对照以下实现事实进行校验：

- `src/App.vue` 当前仅挂载 `RouterView`
- `src/router/index.js` 当前将 `/` 重定向到 `/workspace`，并保留 `/viewer`
- `src/features/workspace/layout/WorkspaceLayout.vue` 当前负责工作台壳层
- `src/features/workspace/composables/useRosterPlanner.js` 当前承载 workspace 典型交互状态

### Backward Compatibility

本次仅修改前端 spec 文档，不涉及运行时代码与接口行为变更。

## 2026-03-05

### Summary

本次变更针对 QA 审计发现的关键不一致问题，修复了 `.specs` 文档中的技术事实偏差与可迭代性风险，确保 Spec 与当前代码实现一致。

### Files Changed

- `.specs/spec.md`
- `.specs/modules/timeline.md`
- `.specs/CHANGELOG.md` (new)

### Detailed Changes

| File | Section | Change Type | Before | After | Why |
|---|---|---|---|---|---|
| `.specs/spec.md` | `班次代码 (Shift Codes)` | Fix | `C` 被标记为主班次 (`✓`) | `C` 更正为非主班次 (`✗`) | 与后端 `PRIMARY_CODES = {OC, DS, NS, A, B, D}` 对齐，避免错误实现筛选规则 |
| `.specs/spec.md` | `权限层级 (L1/L2/L3)` | Refine | 仅有角色职责说明，易被误解为已有权限控制 | 重命名为 `角色职责 (非鉴权权限模型)`，新增当前约束：无登录/RBAC、无前端角色态、后端仅按日期/teamId/主班次筛选 | 补齐“职责语义 != 访问控制”边界，提升文档可执行性 |
| `.specs/spec.md` | `相关文档` | Add | 无变更历史入口 | 新增 `变更记录` 链接指向 `./CHANGELOG.md` | 提升文档维护与审计追踪能力 |
| `.specs/modules/timeline.md` | `模块概述` | Fix | 声称已支持“时间轴缩放、班次冲突检测” | 修正为“当前实现支持并行显示、当前时间指示、重叠泳道布局” | 去除超出代码现状的表述 |
| `.specs/modules/timeline.md` | `实现状态` | Add | 未区分已实现与规划能力 | 新增 `Implemented vs Planned`：明确未实现缩放/拖拽/冲突告警 | 降低后续 Agent 对现有能力的误判 |
| `.specs/modules/timeline.md` | `班次布局算法` | Clarify | “冲突检测”措辞可能被理解为业务告警 | 明确算法仅用于布局避让，不产生业务冲突告警 | 与代码语义一致，避免需求误读 |

### Impact Assessment

- **Correctness**: 修复了主班次定义错误，防止后续功能按错误规则开发。
- **Maintainability**: 增加变更入口和状态分层，后续维护更可追踪。
- **Agent Usability**: 明确实现边界，其他 Agent 可基于 Spec 更可靠地做增量开发。

### Verification Notes

已对照以下实现事实进行修正:

- 后端主班次集合: `support-roster-server/src/main/java/com/support/server/supportrosterserver/service/RosterService.java`
- Timeline 固定宽度与布局算法: `support-roster-ui/src/components/Timeline.vue`
- 当前无 RBAC/登录流程: `support-roster-ui/src/api/index.js`, `support-roster-ui/src/components/Dashboard.vue`, `support-roster-server/src/main/java/com/support/server/supportrosterserver/controller/ShiftController.java`

### Backward Compatibility

本次仅修改文档，不涉及运行时代码与接口行为变更。
