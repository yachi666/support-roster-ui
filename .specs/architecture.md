# 前端架构设计

## 文档范围

本文件描述 support-roster-ui 的前端运行时结构、模块边界、路由组织、状态策略与后端集成方式，不展开后端内部服务与 Excel 解析细节。

## 应用总览

当前应用是单一 Vue SPA，通过路由承载两套产品体验：

```
┌──────────────────────────────────────────────────────────────┐
│ Vue App                                                     │
├──────────────────────────────────────────────────────────────┤
│ App.vue                                                     │
│  └── RouterView                                             │
│      ├── /viewer      → PublicDashboardPage                 │
│      │                  └── Dashboard                       │
│      │                      ├── Header                      │
│      │                      └── Timeline                    │
│      └── /workspace   → Workspace Domain                    │
│                         └── 详见 workspace/index.md         │
├──────────────────────────────────────────────────────────────┤
│ src/api/index.js                                            │
│  └── fetch-based REST client                                │
├──────────────────────────────────────────────────────────────┤
│ HTTP                                                        │
├──────────────────────────────────────────────────────────────┤
│ support-roster-server                                       │
│  └── REST APIs backed by Excel-derived roster data          │
└──────────────────────────────────────────────────────────────┘
```

## 目录分层

```
src/
├── api/                      # 后端接口封装
├── assets/                   # 全局基础样式入口
├── components/               # Public Viewer 组件
├── data/                     # Viewer 侧历史 mock 数据
├── features/                 # 产品域功能目录（workspace 细节见 workspace/）
├── lib/                      # 共用工具函数
├── pages/                    # 顶层页面包装
├── router/                   # 应用路由
├── stores/                   # 预留 store，当前未承载主流程
├── App.vue                   # 根组件，仅挂载 RouterView
└── main.js                   # 启动入口
```

## 路由架构

根级架构文档只描述顶层入口分流。workspace 内部路由、页面职责与工作台结构统一维护在 `workspace/` 目录。

### 顶层规则

| 路由 | 用途 | 入口组件 |
|------|------|----------|
| `/` | 默认入口，重定向到管理端 | redirect |
| `/viewer` | 公共排班看板 | `src/pages/PublicDashboardPage.vue` |
| `/workspace` | 管理工作台产品域 | 详见 `workspace/routing.md` |

## 运行时职责划分

### Public Viewer

- 目标：展示指定日期、时区下的只读值班排班
- 主要组件：`Dashboard.vue`、`Header.vue`、`Timeline.vue`
- 数据来源：通过 `src/api/index.js` 拉取团队和班次接口
- 状态策略：以页面容器本地状态为主，不依赖全局 store

### Admin Workspace

- 工作台详细实现、路由、页面规格、共享组件与视觉规范统一维护在 `workspace/`
- 根级文档只保留其作为第二产品域存在的事实，以及它与 `/viewer` 的入口分流关系

## 状态管理策略

### Viewer 使用局部页面状态

Viewer 的筛选条件和数据请求生命周期只影响单个页面，当前采用容器组件本地状态即可覆盖需求：

- `selectedDate`
- `selectedTimezone`
- `teams`
- `shifts`
- `loading`
- `error`

这种策略保持了数据流简单，Header 和 Timeline 通过 props 与 emits 协同，不引入额外全局依赖。

- `selectedTimezone` 在 viewer 中只暴露 `UTC/HKT/IST` 三种选择，并在请求/渲染前转换为 IANA 时区。

### Workspace 使用 composable 聚合交互状态

workspace 状态设计与 feature 内 composable 约束，统一维护在 `workspace/architecture.md`，根级不重复描述。

## 数据流

### Viewer 数据流

```
Header 变更日期/时区
  │
  ▼
Dashboard 监听筛选条件
  │
  ▼
src/api/index.js 请求后端接口
  │
  ▼
返回 TeamDto[] / ShiftDto[]
  │
  ▼
Timeline 做布局计算并渲染时间轴
```

### Workspace 数据流

```
见 `workspace/architecture.md`
```

## 后端集成边界

前端当前只与后端 REST 接口集成，不依赖后端内部实现细节。需要在 spec 中长期保持的接口边界如下：

- Viewer 使用真实接口获取团队与班次
- Workspace 的数据源与集成边界统一维护在 `workspace/architecture.md`
- 当前无认证态、无用户会话、无基于角色的前端授权逻辑

## 部署与运行边界

- 本项目产出的是 Vite 构建后的静态资源目录 `dist/`
- 可采用传统 Linux + Nginx 托管方式部署
- 也可采用“Node 构建 + Nginx 托管静态资源”的容器镜像方式运行在 ECS Fargate
- Fargate 方案中，`VITE_API_BASE_URL` 仍是构建时注入，而不是容器启动时动态注入
- 容器运行、健康检查与 ALB 集成细节统一维护在 `deployment.md`

## 技术约束

| 主题 | 约束 |
|------|------|
| 身份权限 | 无登录、无 RBAC、无基于角色的界面裁剪 |
| Viewer 实时性 | 无 websocket 或 SSE，刷新依赖手动触发/重新请求 |
| Store 现状 | `src/stores/counter.js` 仍是模板代码，未进入主流程 |
| 测试覆盖 | 当前未形成系统化前端测试规范 |

## 文档分流规则

- 组件职责、props、布局算法等 viewer 细节写入 `modules/`
- workspace 壳层、路由、共享组件、状态与页面说明写入 `workspace/`
- Public Viewer 与共用视觉语言写入 `ui-design.md`
