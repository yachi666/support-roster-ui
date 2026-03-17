# 前端部署规范

## 文档范围

本文件描述 support-roster-ui 的构建产物、容器化运行方式、ECR 镜像发布路径，以及 ECS Fargate 部署时需要长期保持一致的约束。

## 当前支持的部署模式

### 方案 A：Linux + Nginx 静态部署

- 本地执行 `npm run build` 或 `build/build-frontend.sh`
- 产出 `dist/` 静态目录
- 上传到 Linux 服务器
- 使用宿主机 Nginx 托管静态文件

### 方案 B：ECR + ECS Fargate 容器部署

- 使用 Node 镜像执行 Vite 构建
- 将 `dist/` 复制到 Nginx 运行时镜像
- 推送镜像到 ECR
- 由 ECS Fargate 运行镜像
- 通过 ALB 对外提供 HTTP/HTTPS 服务

## 构建与配置边界

### API 地址注入方式

- 前端通过 `VITE_API_BASE_URL` 读取后端 API 根路径
- 该变量属于构建期变量
- 镜像完成构建后，静态资源中的接口地址不会随容器环境变量自动变更
- 如果生产 API 域名变更，需要重新构建并发布镜像

### 当前容器文件

| 文件 | 职责 |
|------|------|
| `Dockerfile` | 多阶段构建前端镜像，先构建再封装运行时 |
| `nginx.container.conf` | 容器内 Nginx 配置，负责静态托管、SPA 回退与健康检查 |
| `.dockerignore` | 收敛 Docker 构建上下文，减少无关文件进入镜像 |
| `build/ecs-task-definition.example.json` | ECS Fargate Task Definition 模板 |
| `build/push-to-ecr.example.sh` | 本地构建、验证并推送 ECR 的脚本模板 |

## Fargate 运行约束

### 容器职责

- 容器只负责托管前端静态页面
- 容器不负责 `/api` 反向代理
- 浏览器直接请求后端 API 域名
- 后端必须为前端站点配置正确的 CORS

### 端口与健康检查

- 容器监听端口：`80`
- 健康检查路径：`/health`
- `/health` 由容器内 Nginx 直接返回 `200 ok`

### SPA 路由要求

- Vue Router 采用 history 路由模式时，必须将未知路径回退到 `index.html`
- `/viewer`、`/workspace` 等直接访问与刷新不能返回 404

## AWS 侧推荐拓扑

```
Internet
  │
  ▼
Route 53
  │
  ▼
ALB (80/443)
  │
  ▼
Target Group (/health)
  │
  ▼
ECS Service
  │
  ▼
Fargate Task
  │
  ▼
Container: nginx serving /usr/share/nginx/html
```

### 关联组件

- ECR：镜像仓库
- ECS Cluster：服务运行环境
- ECS Service：服务副本维持与滚动发布
- Fargate Task Definition：容器参数、镜像地址、端口
- ALB：对外入口与健康检查
- ACM：HTTPS 证书

## 发布规则

### 镜像标签

- 推荐同时保留可追踪版本号，例如 `20260317-1`
- 可以追加 Git 提交哈希标签
- 不应只依赖 `latest` 作为唯一发布标识

### 示例文件使用规则

- Task Definition 示例中的 `${AWS_ACCOUNT_ID}`、`${AWS_REGION}`、`${IMAGE_TAG}` 需要在提交到 AWS 前替换成实际值
- 推送脚本顶部变量需要按真实 AWS 账号、Region、域名和 API 地址修改
- 如果前端 API 域名发生变化，应先改脚本中的 `API_BASE_URL` 再重新构建镜像

### 最低验证项

- 镜像内首页可正常打开
- `/health` 返回 `200`
- 静态资源缓存头正确返回
- `/viewer` 与 `/workspace` 路由刷新正常
- 实际接口请求地址符合构建时的 `VITE_API_BASE_URL`

## 维护规则

- 修改 `VITE_API_BASE_URL` 注入方式时，必须同步更新本文件
- 修改 Dockerfile、运行时镜像或 Nginx 路由策略时，必须同步更新本文件
- 修改健康检查路径、容器端口或 ALB 接入方式时，必须同步更新本文件