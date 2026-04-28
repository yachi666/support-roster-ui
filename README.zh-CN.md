# Support Roster UI

[English](./README.md) · [总仓库](https://github.com/yachi666/support-platform)

![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-7.x-646cff?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06b6d4?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-5fa04e?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

`support-roster-ui` 是支持排班平台的 Vue 3 前端。它以单个 Vite SPA 承载公开排班看板、认证后的管理工作台、联系信息、产品更新和受保护的运营工具。

本仓库作为 [`support-platform`](https://github.com/yachi666/support-platform) 的子模块运行，后端、自动化测试、本地脚本和精选截图资源都在总仓库中统一协调。

## 效果截图

| 公开看板 | 工作台总览 |
|---|---|
| ![公开排班看板](https://raw.githubusercontent.com/yachi666/support-platform/main/docs/assets/screenshots/public-viewer.png) | ![工作台总览](https://raw.githubusercontent.com/yachi666/support-platform/main/docs/assets/screenshots/workspace-overview.png) |

| 月排班 | 校验中心 |
|---|---|
| ![月排班页面](https://raw.githubusercontent.com/yachi666/support-platform/main/docs/assets/screenshots/workspace-roster.png) | ![校验中心](https://raw.githubusercontent.com/yachi666/support-platform/main/docs/assets/screenshots/workspace-validation.png) |

## 产品页面

| 页面 | 路由 | 说明 |
|------|------|------|
| 公开看板 | `/viewer` | 只读 on-call 时间线，支持日期和时区控制。 |
| 登录 | `/login` | 员工 ID 登录与账号激活。 |
| 管理工作台 | `/workspace/*` | 覆盖总览、月排班、人员、班次、团队、校验、导入导出和账号管理。 |
| 联系信息 | `/contact-information` | 联系信息的公开查看与后台管理流程。 |
| Linux 密码 | `/linux-passwords` | 由工作台访问策略保护的运营工具页。 |
| 产品更新 | `/product-updates` | 面向用户的更新日志，随可见产品变更维护。 |

## 功能亮点

- 基于 Vite 的 Vue 3 SPA。
- 路由层区分公开页面、认证页面和角色受限页面。
- 统一 API 层连接 `/api/**` 与 `/api/workspace/**`。
- 进入受保护页面前检查工作台访问策略。
- 使用 Tailwind CSS 4 和 lucide 图标。
- 提供 Docker + Nginx 静态部署路径。
- 通过 `.specs/` 维护前端正式规范。

## 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | `Vue 3.5` |
| 构建工具 | `Vite 7` |
| 路由 | `Vue Router 5` |
| 状态 | Vue reactivity、composables、`Pinia` |
| 样式 | `Tailwind CSS 4` |
| UI 辅助 | `lucide-vue-next`、`radix-vue`、`class-variance-authority`、`tailwind-merge` |
| 日期工具 | `date-fns`、`date-fns-tz` |
| 运行时 | `Node.js ^20.19.0 || >=22.12.0` |

## 快速开始

### 前置条件

- Node.js `^20.19.0 || >=22.12.0`
- npm
- 可访问的后端 API，通常为 `http://127.0.0.1:8080/api`

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

默认本地 API 配置：

```bash
VITE_API_BASE_URL=http://127.0.0.1:8080/api
```

### 构建与预览

```bash
npm run build
npm run preview
```

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动 Vite 开发服务器。 |
| `npm run build` | 生成生产静态构建。 |
| `npm run preview` | 本地预览生产构建。 |
| `npm run format` | 使用 Prettier 格式化 `src/`。 |

## 环境变量

| 变量 | 用途 | 示例 |
|------|------|------|
| `VITE_API_BASE_URL` | 前端构建使用的后端 API 基础地址。 | `http://127.0.0.1:8080/api` |
| `VITE_XMATTERS_URL` | External Systems 抽屉中的 xMatters 链接。 | `https://www.xmatters.com/` |
| `VITE_SERVICENOW_URL` | External Systems 抽屉中的 ServiceNow 链接。 | `https://www.servicenow.com/` |
| `VITE_MESSAGE_DELIVERY_KB_URL` | External Systems 抽屉中的 Message Delivery Knowledge Base 链接。 | `https://learn.microsoft.com/` |

生产默认值和部署示例见 `.env.production`、`Dockerfile` 与 `build/`。

## 架构概览

```text
Browser
  └── Vue 3 SPA
      ├── /viewer                 # 公开排班看板
      ├── /login                  # 认证与激活
      ├── /workspace/*            # 管理工作台壳层
      ├── /contact-information    # 联系信息流程
      ├── /linux-passwords        # 受保护运营工具
      ├── /product-updates        # 产品更新日志
      └── src/api/                # 后端 API 客户端
              ↓
        support-roster-server
```

## 目录说明

```text
support-roster-ui/
├── .specs/                      # 前端规范和产品说明
├── build/                       # Nginx、ECR、ECS 部署示例
├── public/                      # 静态公共资源
├── src/
│   ├── api/                     # 后端请求封装
│   ├── assets/                  # 全局样式与共享资源
│   ├── components/              # 公开看板组件
│   ├── features/                # 功能域
│   │   ├── contact-information/
│   │   ├── linux-passwords/
│   │   ├── product-updates/
│   │   └── workspace/
│   ├── pages/                   # 顶层路由页面
│   ├── router/                  # 路由定义与守卫
│   ├── stores/                  # Pinia stores
│   ├── App.vue
│   └── main.js
├── Dockerfile
├── nginx.container.conf
├── package.json
└── vite.config.js
```

## 后端依赖

前端依赖 `support-roster-server` 提供以下接口：

| 接口范围 | 基础路径 |
|----------|----------|
| Viewer 与公开数据 | `/api/**` |
| 工作台后台管理 | `/api/workspace/**` |
| 认证 | `/api/auth/**` |

本地开发时请先启动 PostgreSQL 和后端，再启动 Vite 服务。在父级工作区中可使用 `../scripts/dev/restart-all.sh` 同时重启前后端。

## 部署

当前支持两类部署方式：

- Linux + Nginx 静态部署。
- Docker + Nginx 镜像部署，适配 ECR/ECS Fargate 类场景。

相关文件：

- [`Dockerfile`](./Dockerfile)
- [`nginx.container.conf`](./nginx.container.conf)
- [`build/build-frontend.sh`](./build/build-frontend.sh)
- [`build/ecs-task-definition.example.json`](./build/ecs-task-definition.example.json)
- [`build/push-to-ecr.example.sh`](./build/push-to-ecr.example.sh)

## 文档入口

- 前端规范总入口：[`./.specs/spec.md`](./.specs/spec.md)
- 架构说明：[`./.specs/architecture.md`](./.specs/architecture.md)
- 开发流程：[`./.specs/development.md`](./.specs/development.md)
- 工作台规范：[`./.specs/workspace/index.md`](./.specs/workspace/index.md)
- 部署规范：[`./.specs/deployment.md`](./.specs/deployment.md)
- 产品更新日志规则：[`./.specs/product-updates.md`](./.specs/product-updates.md)

## 贡献约定

修改路由、页面、组件行为、状态管理、接口联调、数据模型、视觉规则或开发流程时，需要在同一次变更中同步更新对应 `.specs/` 文档。

如变更对用户可见，还需要同步维护 `src/features/product-updates/data/productUpdates.js` 中的 `zh-CN` 与 `en` 内容；纯内部变更除外。

## 许可证

本项目采用 [MIT License](./LICENSE)。
