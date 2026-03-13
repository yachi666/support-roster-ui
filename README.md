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

## Linux + Nginx 部署（方案 A：前端同域，`/api` 反向代理到后端）

本项目当前通过 `VITE_API_BASE_URL` 读取接口基地址。默认约定如下：开发环境使用 `http://localhost:8080/api`，生产环境如果采用“前端静态站点 + Nginx 代理后端”的方式，则使用 `/api`，由 Nginx 将该路径转发到独立后端服务器。

### 已生成的部署文件

- `build/build-frontend.sh`：前端生产打包脚本
- `build/support-roster-ui.nginx.conf`：Nginx 站点配置示例

### 1. 运行前端打包脚本

要求：Node 版本满足 `package.json` 中的 `engines.node`（当前为 `^20.19.0 || >=22.12.0`）。

首次使用请先给脚本执行权限：

```sh
chmod +x build/build-frontend.sh
```

使用默认同域 API 路径 `/api` 打包：

```sh
./build/build-frontend.sh
```

如果你想临时覆盖 API 地址，也可以在执行时传入环境变量：

```sh
VITE_API_BASE_URL=/api ./build/build-frontend.sh
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

### 3. 安装 Nginx 配置

将 `build/support-roster-ui.nginx.conf` 复制到服务器，例如：

```sh
sudo cp build/support-roster-ui.nginx.conf /etc/nginx/conf.d/support-roster-ui.conf
```

然后根据实际环境修改以下内容：

- `server_name roster.example.com;` 改为你的前端域名
- `root /var/www/support-roster-ui/current;` 改为你的静态文件目录
- `proxy_pass https://supportui.servier/api/;` 改为你的后端 API 地址

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

- 打开页面后，请确认接口请求路径为 `/api/...`
- 直接刷新 `/workspace`、`/workspace/staff`、`/workspace/roster` 等页面不应出现 404
- 如果接口请求失败，请优先检查：
  - Nginx 中 `proxy_pass` 是否填写正确
  - 前端服务器是否能访问后端服务器
  - 后端服务端口、防火墙、安全组是否已放行

### 6. 常用上线命令汇总

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

