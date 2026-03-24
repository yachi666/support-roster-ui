# Support Roster UI

![Vue 3](https://img.shields.io/badge/Vue-3-42b883?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-7.x-646cff?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06b6d4?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-5fa04e?style=flat-square)
![Workspace + Viewer](https://img.shields.io/badge/Product-Workspace%20%2B%20Viewer-0f766e?style=flat-square)

`support-roster-ui` 是一个基于 `Vue 3 + Vite` 的前端项目，用于承载技术支持排班系统的两套体验：

- `Public Viewer`：面向公开查看场景的只读排班看板
- `Admin Workspace`：面向运营与维护场景的后台管理工作台

项目当前使用单一 SPA 承载两套产品域，通过路由分流到 `/viewer` 与 `/workspace`。

## Features

- 公共排班看板，支持日期与时区切换
- 管理工作台，覆盖总览、人员、班次、团队、月排班、校验中心、导入导出
- 基于 `fetch` 的统一 API 请求层，接入 `/api/**` 与 `/api/workspace/**`
- 支持本地 Vite 开发，也支持 `Nginx` 容器化部署到 ECS Fargate

## Tech Stack

| 类别 | 选型 |
|------|------|
| Framework | `Vue 3` |
| Build Tool | `Vite` |
| Router | `Vue Router` |
| Styling | `Tailwind CSS` |
| State Model | Vue Reactivity / composables / `Pinia`（当前主流程较少依赖） |
| Date Utilities | `date-fns`、`date-fns-tz` |
| Runtime | `Node.js ^20.19.0 || >=22.12.0` |

## Quick Start

### Prerequisites

- Node.js `^20.19.0 || >=22.12.0`
- npm
- 可访问的后端 API（本地默认 `http://127.0.0.1:8080/api`）

### Install

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

默认开发环境通过 `.env.development` 使用：

```bash
VITE_API_BASE_URL=http://127.0.0.1:8080/api
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | 启动本地开发服务器 |
| `npm run build` | 生成生产构建产物 |
| `npm run preview` | 本地预览生产构建 |
| `npm run format` | 使用 Prettier 格式化 `src/` |

## Environment Variables

当前主要使用以下环境变量：

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_BASE_URL` | 后端 API 基础地址 | `http://127.0.0.1:8080/api` |

生产环境示例见 `.env.production`。

## Directory Structure

```text
support-roster-ui/
├── .specs/                      # 前端技术规范与手册化文档
├── build/                       # 构建、Nginx、ECR/ECS 示例脚本
├── public/                      # 静态资源
├── src/
│   ├── api/                     # API 请求封装
│   ├── assets/                  # 全局样式与资源入口
│   ├── components/              # Public Viewer 组件
│   ├── data/                    # 历史 mock 数据与示例数据
│   ├── features/
│   │   └── workspace/           # Admin Workspace 产品域
│   │       ├── components/      # 工作台共享组件与 roster 子组件
│   │       ├── composables/     # 页面级状态与交互逻辑
│   │       ├── config/          # 导航、时区等配置
│   │       ├── layout/          # 工作台壳层
│   │       ├── lib/             # 工作台工具函数
│   │       └── pages/           # 工作台页面
│   ├── lib/                     # 通用工具函数
│   ├── pages/                   # 顶层页面包装
│   ├── router/                  # 路由入口与分流
│   ├── stores/                  # 预留 store
│   ├── App.vue                  # 根组件
│   └── main.js                  # 应用启动入口
├── Dockerfile                   # 前端容器镜像定义
├── nginx.container.conf         # 容器内 Nginx 配置
├── package.json                 # 依赖与脚本定义
└── vite.config.js               # Vite 配置
```

### Directory Notes

- `src/components/` 主要服务于 `Public Viewer`
- `src/features/workspace/` 是后台工作台主目录
- `build/` 下保留本地打包、Nginx 配置与 Fargate/ECR 示例文件
- `.specs/` 维护前端架构、页面、视觉与部署规范

## Routing Overview

| Route | Surface | Description |
|-------|---------|-------------|
| `/` | Redirect | 默认重定向到 `/workspace` |
| `/viewer` | Public Viewer | 公开只读排班看板 |
| `/workspace` | Admin Workspace | 管理后台工作台 |

## Architecture Overview

```text
Browser
  └── Vue 3 SPA
      ├── /viewer     -> Public Viewer
      ├── /workspace  -> Admin Workspace
      └── src/api/index.js
               ├── /api/**
               └── /api/workspace/**
                        ↓
              support-roster-server
```

- `Public Viewer` 偏只读展示，聚焦排班浏览与时区切换
- `Admin Workspace` 偏运营与维护，聚焦编辑、校验与导入导出
- 两套体验共享同一前端构建体系与 API 请求层

## Deployment

项目当前支持两类部署方式：

- Linux + Nginx 静态部署
- Docker + Nginx 容器化部署（适配 ECS Fargate / ECR）

相关文件：

- `Dockerfile`
- `nginx.container.conf`
- `build/build-frontend.sh`
- `build/ecs-task-definition.example.json`
- `build/push-to-ecr.example.sh`

## Documentation

- 前端规格总目录：[`./.specs/spec.md`](./.specs/spec.md)
- 前端架构：[`./.specs/architecture.md`](./.specs/architecture.md)
- Workspace 分册：[`./.specs/workspace/index.md`](./.specs/workspace/index.md)
- 部署规范：[`./.specs/deployment.md`](./.specs/deployment.md)

## Backend Dependency

本项目依赖 `support-roster-server` 提供接口能力：

- Viewer：`/api/**`
- Workspace：admin：`/api/workspace/**`

本地联调时，请先启动后端服务，再运行本前端项目。

## Roadmap

- 持续完善 Workspace 管理工作台的页面能力与交互细节
- 继续收敛 Viewer 与 Workspace 的共享请求层和文档体系
- 补充更稳定的测试、校验与发布流程说明
- 持续维护 `.specs/`，保持代码与规格文档同步

## Contributing

当前仓库以项目内部演进为主，但如果你准备继续扩展本项目，建议遵循以下约定：

1. 修改功能前先阅读对应的 `.specs/` 文档。
2. 新增页面、接口或目录时，同步更新 README 与 `.specs/` 导航。
3. 尽量保持 Viewer 与 Workspace 的边界清晰，不混用职责。
4. 提交前至少验证本地开发、构建或受影响的命令可以正常执行。

## License

本仓库采用 [Apache License 2.0](./LICENSE) 发布。

如无额外说明，仓库内源码与文档均按该许可证条款提供。
