# 📱 Support Roster UI

[English](./README.md) · [父工作区](https://github.com/yachi666/support-platform)

![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?style=flat-square&logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-7.x-646cff?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-06b6d4?style=flat-square&logo=tailwindcss)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-5fa04e?style=flat-square&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

> 基于 Vue 3 的现代化排班平台前端，通过精心打磨的单页应用提供公开排班看板、认证工作台管理和运营工具。

**Support Roster UI** 是排班平台面向用户的 Web 界面，用于管理和查看值班排班。它提供公开排班看板、用于规划和运营的管理工作台、联系信息页面、产品发布说明和受保护的工具——全部基于 Vue 3、Vite 和 Tailwind CSS 构建。

本仓库设计为 [`support-platform`](https://github.com/yachi666/support-platform) 中的 **Git 子模块**，后端服务、自动化测试、开发脚本和精选截图均在总仓库中集中协调。

---

## ✨ 功能亮点

- **🎯 Vue 3 组合式 API** 采用 `<script setup>` 及 TypeScript 友好结构
- **⚡ 极速开发体验** 由 Vite 7 提供支持，热模块替换
- **🎨 现代化样式** 基于 Tailwind CSS 4 与自定义设计令牌
- **🛣️ 智能路由** 通过 Vue Router 5 实现基于角色的访问守卫
- **🔒 访问控制** 在受保护页面强制执行工作台策略
- **📦 模块化架构** 采用基于特性的组织方式
- **🌐 国际化支持** 通过 Vue I18n 实现
- **🐳 生产就绪** 提供 Docker + Nginx 部署路径
- **📚 完整规范** 在 `.specs/` 中维护所有特性规范

---

## 🖼️ 效果截图

| 公开看板 | 工作台总览 |
|---|---|
| ![公开排班看板](https://raw.githubusercontent.com/yachi666/support-platform/main/docs/assets/screenshots/public-viewer.png) | ![工作台总览](https://raw.githubusercontent.com/yachi666/support-platform/main/docs/assets/screenshots/workspace-overview.png) |

| 月排班规划 | 校验中心 |
|---|---|
| ![月排班规划](https://raw.githubusercontent.com/yachi666/support-platform/main/docs/assets/screenshots/workspace-roster.png) | ![工作台校验中心](https://raw.githubusercontent.com/yachi666/support-platform/main/docs/assets/screenshots/workspace-validation.png) |

---

## 🗺️ 产品页面与路由

| 页面 | 路由 | 访问权限 | 功能说明 |
|------|------|----------|----------|
| **公开看板** | `/viewer` | 公开 | 只读值班时间线，支持日期选择、时区切换和响应式布局 |
| **登录** | `/login` | 公开 | 员工 ID 认证和账号激活流程 |
| **管理工作台** | `/workspace/*` | 认证 + 策略 | 完整排班管理：总览、月规划、人员、班次、团队、校验、导入导出、账号 |
| **联系信息** | `/contact-information` | 公开 + 受保护 | 公开查看和管理员管理联系详情 |
| **Linux 密码** | `/linux-passwords` | 受保护 | 由工作台访问策略保护的运营密码库 |
| **产品更新** | `/product-updates` | 公开 | 面向用户的发布说明，追踪可见产品变更 |

> **说明：** 访问 `/workspace` 时，系统会根据当前用户的认证状态、权限和工作台策略自动重定向到合适的工作台入口页。

---

## 🛠️ 技术栈

| 类别 | 技术选型 |
|------|----------|
| **框架** | Vue 3.5（组合式 API） |
| **构建工具** | Vite 7 |
| **路由** | Vue Router 5 |
| **状态管理** | Vue reactivity + Pinia stores |
| **样式** | Tailwind CSS 4 |
| **UI 组件** | Radix Vue（无头组件） |
| **图标** | Lucide Vue Next |
| **工具库** | clsx、tailwind-merge、class-variance-authority |
| **日期处理** | date-fns、date-fns-tz |
| **国际化** | Vue I18n |
| **运行时** | Node.js `^20.19.0 \|\| >=22.12.0` |

---

## 🚀 快速开始

### 前置条件

- **Node.js** `^20.19.0 || >=22.12.0`
- **npm**（随 Node.js 提供）
- **后端 API** 运行在 `http://127.0.0.1:8080/api`（参见[后端依赖](#后端依赖)）

### 安装依赖

```bash
# 克隆仓库（独立方式）或初始化子模块（从父工作区）
git submodule update --init --recursive

# 进入 UI 目录
cd support-roster-ui

# 安装依赖
npm install
```

### 开发

```bash
# 启动 Vite 开发服务器（默认端口：5173）
npm run dev
```

应用将在 `http://localhost:5173` 可用，支持热模块替换。

**默认 API 配置：**
```bash
VITE_API_BASE_URL=http://127.0.0.1:8080/api
```

您可以在 `.env.development.local`（不被 Git 追踪）中覆盖此配置。

### 构建与预览

```bash
# 构建生产版本
npm run build

# 本地预览生产构建
npm run preview
```

构建输出将在 `dist/` 目录中。

---

## 📜 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动 Vite 开发服务器，支持 HMR |
| `npm run build` | 构建生产就绪的静态包到 `dist/` |
| `npm run preview` | 本地预览生产构建 |
| `npm run format` | 使用 Prettier 格式化 `src/` |

---

## 🔧 环境变量

| 变量 | 用途 | 默认值（开发） | 示例（生产） |
|------|------|----------------|--------------|
| `VITE_API_BASE_URL` | 后端 API 基础地址 | `http://127.0.0.1:8080/api` | `https://supportui.servier/api` |
| `VITE_XMATTERS_URL` | External Systems 抽屉中的 xMatters 链接 | `https://www.xmatters.com/` | |
| `VITE_SERVICENOW_URL` | External Systems 抽屉中的 ServiceNow 链接 | `https://www.servicenow.com/` | |
| `VITE_MESSAGE_DELIVERY_KB_URL` | Message Delivery Knowledge Base 链接 | `https://learn.microsoft.com/` | |

**配置文件：**
- `.env.development` – 开发默认值
- `.env.production` – 生产默认值
- `.env.development.local` / `.env.production.local` – 本地覆盖（不提交）

详见 [Vite 环境变量文档](https://cn.vite.dev/guide/env-and-mode.html)。

---

## 🏗️ 架构

```text
┌─────────────────────────────────────────────────┐
│                   浏览器                        │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │           Vue 3 SPA (Vite)                │ │
│  │                                           │ │
│  │  ┌─────────────────────────────────────┐ │ │
│  │  │  /viewer       # 公开排班看板       │ │ │
│  │  │  /login        # 认证与激活         │ │ │
│  │  │  /workspace/*  # 管理工作台         │ │ │
│  │  │  /contact-information/* # 联系信息流程│ │ │
│  │  │  /linux-passwords       # 受保护密码库│ │ │
│  │  │  /product-updates       # 发布说明    │ │ │
│  │  └─────────────────────────────────────┘ │ │
│  │                                           │ │
│  │  ┌─────────────────────────────────────┐ │ │
│  │  │      src/api/ (API 客户端层)        │ │ │
│  │  └─────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────┘ │
│                       │                         │
│                       ▼                         │
│              HTTP 请求                          │
└─────────────────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │   support-roster-server       │
        │   (PostgreSQL 后端)           │
        └───────────────────────────────┘
```

**核心概念：**
- **单页应用** 采用客户端路由
- **API 层**（`src/api/`）抽象后端通信
- **路由守卫** 强制执行认证和工作台策略
- **特性模块** 封装领域逻辑（workspace、contact-info 等）
- **Pinia stores** 在响应式不够用时管理跨组件状态

---

## 📂 项目结构

```text
support-roster-ui/
├── .specs/                          # 📚 前端规范
│   ├── spec.md                      # 主规范导航
│   ├── architecture.md              # 架构决策
│   ├── development.md               # 本地开发工作流
│   ├── deployment.md                # 部署指南
│   ├── ui-design.md                 # 设计系统与模式
│   ├── product-updates.md           # 产品更新日志规则
│   ├── modules/                     # 模块特定规范
│   └── workspace/                   # 工作台特性规范
│       └── index.md
├── build/                           # 🐳 部署配置
│   ├── build-frontend.sh
│   ├── push-to-ecr.example.sh
│   └── ecs-task-definition.example.json
├── public/                          # 静态资源（原样提供）
├── src/
│   ├── api/                         # 🔌 后端 API 封装
│   ├── assets/                      # 🎨 全局样式、图片
│   ├── components/                  # 🧩 共享 UI 组件
│   ├── data/                        # 静态数据（团队等）
│   ├── features/                    # 🎯 特性模块
│   │   ├── contact-information/
│   │   ├── linux-passwords/
│   │   ├── product-updates/
│   │   └── workspace/               # 管理工作台特性
│   ├── i18n/                        # 🌐 国际化
│   │   └── locales/
│   ├── lib/                         # 🛠️ 工具函数
│   ├── pages/                       # 📄 顶层路由页面
│   ├── router/                      # 🛣️ 路由配置与守卫
│   ├── stores/                      # 📦 Pinia 状态存储
│   ├── App.vue                      # 根组件
│   └── main.js                      # 应用入口点
├── Dockerfile                       # 生产容器
├── nginx.container.conf             # SPA 路由的 Nginx 配置
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 🔗 后端依赖

UI 与 **`support-roster-server`** 通信，后端必须提供：

| API 范围 | 基础路径 | 用途 |
|----------|----------|------|
| **公开数据** | `/api/**` | Viewer 排班数据、公开联系人 |
| **工作台管理** | `/api/workspace/**` | 人员、班次、团队、排班、校验的 CRUD |
| **认证** | `/api/auth/**` | 登录、登出、账号激活 |

### 本地开发设置

1. **启动 PostgreSQL**（后端所需）
2. **启动后端服务器**（`support-roster-server` 在端口 `8080`）
3. **启动前端开发服务器**（在此目录执行 `npm run dev`）

**便捷脚本**（从父工作区）：
```bash
../scripts/dev/restart-all.sh
```

此脚本处理同时重启前后端服务。

详细后端设置请参见 [support-roster-server 仓库 README](https://github.com/yachi666/support-roster-server/blob/main/README.md)。

---

## 🐳 部署

### 支持的部署路径

1. **Linux + Nginx**（静态托管）
   - 使用 `npm run build` 构建
   - 用 Nginx 提供 `dist/` 服务
   - 配置反向代理到后端 API

2. **Docker + Nginx**（容器化）
   - 构建 Docker 镜像：`docker build -t support-ui .`
   - 使用环境变量 `VITE_API_BASE_URL` 运行
   - 适用于 AWS ECR/ECS Fargate 或任何容器编排器

### 部署资源

- [`Dockerfile`](./Dockerfile) – 生产多阶段构建
- [`nginx.container.conf`](./nginx.container.conf) – 带 SPA 回退的 Nginx 配置
- [`build/build-frontend.sh`](./build/build-frontend.sh) – 构建脚本
- [`build/ecs-task-definition.example.json`](./build/ecs-task-definition.example.json) – AWS ECS 任务模板
- [`build/push-to-ecr.example.sh`](./build/push-to-ecr.example.sh) – ECR 推送脚本示例

**生产环境变量：**

详见 `.env.production` 获取默认生产配置。在部署环境中根据需要覆盖。

---

## 📚 文档与规范

所有前端技术规范存放在 `.specs/` 目录：

| 文档 | 说明 |
|------|------|
| [`.specs/spec.md`](./.specs/spec.md) | 🗂️ 主规范导航中心 |
| [`.specs/architecture.md`](./.specs/architecture.md) | 🏛️ 架构决策与模式 |
| [`.specs/development.md`](./.specs/development.md) | 💻 本地开发工作流、健康检查、重启 |
| [`.specs/deployment.md`](./.specs/deployment.md) | 🚀 部署指南（Nginx、Docker、AWS） |
| [`.specs/ui-design.md`](./.specs/ui-design.md) | 🎨 设计系统、颜色、排版、组件 |
| [`.specs/product-updates.md`](./.specs/product-updates.md) | 📝 产品更新日志维护规则 |
| [`.specs/workspace/index.md`](./.specs/workspace/index.md) | 🏢 工作台特性导航 |
| [`.specs/modules/`](./.specs/modules/) | 📦 各模块规范 |

**何时更新规范：**
- 添加或更改路由、页面、组件
- 修改状态管理、API 集成或数据模型
- 更改视觉规则、交互模式或开发工作流
- 添加或移除功能

---

## 🤝 贡献指南

我们欢迎贡献！请遵循以下准则：

### 规范维护

**重要：** 规范不是可选的，它们是实现的一部分。

- ✅ **始终更新 `.specs/` 文档** 当更改路由、页面、组件、状态、API 或工作流时
- ✅ **更新导航文件**（`.specs/spec.md` 或相关 `index.md`）当添加新规范文档时
- ✅ **保持规范同步** 在同一提交/PR 中与代码一致
- ❌ **不要在 `.specs/` 外创建分散的规范文件**

### 产品更新日志

- ✅ **维护 `src/features/product-updates/data/productUpdates.js`** 对于用户可见的更改
- ✅ **更新 `zh-CN` 和 `en` 条目**（双语要求）
- ✅ **为用户而写，不是开发者**（关注价值，而非实现）
- ⚠️ **内部重构可跳过**（在 PR 描述中注明"无用户可见更改"）

### 代码质量

- 遵循 Vue 3 组合式 API 最佳实践
- 新组件使用 `<script setup>`
- 保持一致的代码风格（使用 `npm run format`）
- 编写有意义的提交消息

详细的 Agent 指令请参见 [`AGENTS.md`](./AGENTS.md)。

---

## 📄 许可证

本项目采用 **MIT License** 许可。详见 [LICENSE](./LICENSE)。

---

**用 ❤️ 打造，基于 Vue 3、Vite 和 Tailwind CSS**
