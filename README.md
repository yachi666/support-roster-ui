# support-roster-ui

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## ECS Fargate + ECR 部署（方案 B：容器化静态前端）

如果你准备把当前前端镜像部署到 AWS ECS Fargate，那么仍然需要一个容器内的 HTTP 服务器来托管 `dist/` 静态文件。

在这个项目里，推荐方案是：

- 用 Node 镜像完成 Vite 构建
- 用 Nginx 镜像提供静态文件服务
- 将镜像推送到 ECR
- 由 ECS Fargate 拉取镜像并通过 ALB 对外暴露

### 是否还需要 Nginx

需要，但原因不是 “因为用了 Fargate”，而是 “容器里需要有一个 Web 服务器来响应 HTTP 请求并支持 SPA 路由回退”。

对这个 Vue + Vite 项目来说，Nginx 有几个直接价值：

- 托管 `dist/` 静态文件
- 为 Vue Router history 模式提供 `index.html` 回退
- 对静态资源设置缓存头
- 暴露 `/health` 供 ECS / ALB 健康检查使用

当前仓库已补充以下容器文件：

- `Dockerfile`：多阶段构建前端镜像
- `nginx.container.conf`：容器内 Nginx 配置
- `.dockerignore`：减少构建上下文
- `build/ecs-task-definition.example.json`：ECS Fargate Task Definition 示例
- `build/push-to-ecr.example.sh`：本地构建并推送到 ECR 的命令脚本模板

### 1. 构建并验证镜像

在 `support-roster-ui/` 目录执行：

```sh
docker build \
  --platform linux/amd64 \
  --build-arg VITE_API_BASE_URL=https://supportui.servier/api \
  -t support-roster-ui:20260317-1 .
```

本地运行验证：

```sh
docker run --rm -p 8081:80 support-roster-ui:20260317-1
```

检查：

- 打开 `http://127.0.0.1:8081`
- `http://127.0.0.1:8081/health` 应返回 `ok`
- 直接访问 `/workspace` 等前端路由不应返回 404

### 2. 创建 ECR 仓库

示例区域使用 `ap-southeast-1`，请替换为你的实际 Region：

```sh
aws ecr create-repository \
  --repository-name support-roster-ui \
  --region ap-southeast-1
```

### 3. 登录 ECR 并推送镜像

先获取 AWS 账号 ID：

```sh
aws sts get-caller-identity --query Account --output text
```

登录 ECR：

```sh
aws ecr get-login-password --region ap-southeast-1 | \
docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com
```

打标签并推送：

```sh
docker tag support-roster-ui:20260317-1 ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/support-roster-ui:20260317-1
docker push ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/support-roster-ui:20260317-1
```

### 4. 创建 ECS Fargate 服务

建议的 AWS 组件组合：

- ECR：保存前端镜像
- ECS Cluster：运行服务
- Fargate Task：容器运行环境
- Application Load Balancer：HTTP/HTTPS 流量入口
- Target Group：健康检查路径使用 `/health`
- ACM：HTTPS 证书
- Route 53：域名解析

ECS Task Definition 关键参数建议如下：

- Container port：`80`
- Health check path：`/health`
- CPU / Memory：先从 `0.25 vCPU + 0.5 GB` 或 `0.5 vCPU + 1 GB` 起步
- Desired count：至少 `2`
- Platform：`linux/amd64`

仓库中已提供可直接改值后使用的 Task Definition 示例：

```text
build/ecs-task-definition.example.json
```

环境变量方面，当前前端镜像不依赖运行时环境变量切换 API 地址；`VITE_API_BASE_URL` 是构建时注入的。如果接口地址变化，需要重新构建镜像。

### 5. ALB 与域名配置

推荐做法：

- ALB 监听 `80/443`
- 将 `443` 挂 ACM 证书
- Listener 转发到 Fargate 对应 target group
- 前端域名例如 `roster.example.com`
- 后端 API 域名例如 `api.example.com`

如果前后端是不同域名，请继续确认后端 CORS 已允许前端域名。

### 6. 上线后检查项

- 首页可以正常加载静态资源
- 直接刷新 `/workspace`、`/viewer` 等前端路由不返回 404
- `/health` 返回 `200`
- 浏览器中接口请求地址符合构建时的 `VITE_API_BASE_URL`
- 后端允许前端域名跨域访问

### 7. 一次性从本地构建并推送到 ECR

仓库中已提供脚本模板：

```text
build/push-to-ecr.example.sh
```

修改脚本顶部变量后，在 `support-roster-ui/` 目录执行：

```sh
chmod +x build/push-to-ecr.example.sh
./build/push-to-ecr.example.sh
```

脚本会完成这些动作：

- 校验 Docker 和 AWS CLI
- 确认或创建 ECR 仓库
- 登录 ECR
- 本地构建镜像
- 用 `/health` 做一次容器自检
- 给镜像打 ECR 标签并推送

### 8. 适用边界

Fargate 可以运行这个前端，但如果你的前端是纯静态站点，长期看通常还有一个更省钱、更简单的替代方案：

- S3 托管静态文件
- CloudFront 分发

如果你当前的部署标准已经统一在 ECS / Fargate，继续使用本仓库里的 Nginx 容器方案是合理的。

## Linux + Nginx 部署（方案 A：前后端不同域名、不同服务器）

本项目当前通过 `VITE_API_BASE_URL` 读取接口基地址。默认约定如下：

- 开发环境：`http://localhost:8080/api`
- 生产环境：`https://supportui.servier/api`

也就是说，生产环境中的前端页面会直接请求后端域名，而不是通过前端服务器上的 Nginx 再转发 `/api`。

### 已生成的部署文件

- `build/build-frontend.sh`：前端生产打包脚本
- `build/support-roster-ui.nginx.conf`：前端静态站点 Nginx 配置示例

### 1. 运行前端打包脚本

要求：Node 版本满足 `package.json` 中的 `engines.node`（当前为 `^20.19.0 || >=22.12.0`）。

首次使用请先给脚本执行权限：

```sh
chmod +x build/build-frontend.sh
```

使用默认生产 API 地址 `https://supportui.servier/api` 打包：

```sh
./build/build-frontend.sh
```

如果你想临时覆盖 API 地址，也可以在执行时传入环境变量：

```sh
VITE_API_BASE_URL=https://supportui.servier/api ./build/build-frontend.sh
```

打包成功后，产物位于 `dist/`。

### 2. 上传前端静态文件到 Linux 服务器

以下示例会把本地 `dist/` 上传到服务器版本目录：

```sh
rsync -avz --delete dist/ user@your-server:/var/www/support-roster-ui/releases/20260313-1/
```

登录服务器后切换当前版本：

```sh
ln -sfn /var/www/support-roster-ui/releases/20260313-1 /var/www/support-roster-ui/current
```

### 3. 安装前端 Nginx 配置

将 `build/support-roster-ui.nginx.conf` 复制到服务器，例如：

```sh
sudo cp build/support-roster-ui.nginx.conf /etc/nginx/conf.d/support-roster-ui.conf
```

然后根据实际环境修改以下内容：

- `server_name roster.example.com;` 改为你的前端域名
- `root /var/www/support-roster-ui/current;` 改为你的静态文件目录

当前这个 Nginx 示例只负责托管前端静态文件，不负责转发 API 请求。

检查并重载 Nginx：

```sh
sudo nginx -t
sudo systemctl reload nginx
```

### 4. 配置 HTTPS（推荐）

如果服务器使用 Ubuntu + Nginx，可以通过 Certbot 自动申请并安装证书：

```sh
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d roster.example.com
```

### 5. 部署完成后检查项

- 打开页面后，请确认接口请求地址为 `https://supportui.servier/api/...`
- 直接刷新 `/workspace`、`/workspace/staff`、`/workspace/roster` 等页面不应出现 404
- 如果接口请求失败，请优先检查：
  - 后端是否已对前端域名开启 CORS
  - 浏览器开发者工具中是否出现跨域错误（CORS）
  - 后端服务端口、防火墙、安全组是否已放行
  - `VITE_API_BASE_URL` 是否为正确的生产地址

### 6. 后端跨域配置提醒

由于前端和后端不在同一个域名下，后端服务必须允许前端站点跨域访问。至少需要确认：

- `Access-Control-Allow-Origin` 包含你的前端域名
- 如果接口依赖 Cookie / Session，还需要正确配置 `Access-Control-Allow-Credentials`
- 如果存在自定义请求头或 `PUT` / `DELETE` / 文件上传请求，后端需要正确处理预检请求（`OPTIONS`）

### 7. 常用上线命令汇总

```sh
chmod +x build/build-frontend.sh
./build/build-frontend.sh
rsync -avz --delete dist/ user@your-server:/var/www/support-roster-ui/releases/20260313-1/
ssh user@your-server
ln -sfn /var/www/support-roster-ui/releases/20260313-1 /var/www/support-roster-ui/current
sudo cp build/support-roster-ui.nginx.conf /etc/nginx/conf.d/support-roster-ui.conf
sudo nginx -t
sudo systemctl reload nginx
```

