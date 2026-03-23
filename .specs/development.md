# 前端本地联调与浏览器验证规范

## 文档定位

本文件沉淀 `support-roster-ui` 在本地开发时的标准重启流程、日志定位方式与浏览器自动化验证方法，避免每次联调时重复摸索前后端启动命令与校验步骤。

适用场景：

- 需要同时启动前端与后端进行联调
- 修改 Public Viewer 或 Admin Workspace 后做浏览器回归验证
- 需要快速确认本地服务端口、健康状态与日志位置

## 推荐使用入口

统一从仓库根目录执行：

```bash
cd /Users/lzn/Documents/trae_projects/support
```

优先使用现成脚本：

```bash
./scripts/dev/restart-all.sh
```

该脚本会：

1. 停掉 `5173` 与 `8080` 上已有监听
2. 后台重启前端与后端
3. 等待后端健康检查 `http://127.0.0.1:8080/actuator/health`
4. 等待前端 `http://127.0.0.1:5173`

## 本地服务脚本

脚本来源：`../scripts/dev/README.md`

### 重启并校验前后端

```bash
./scripts/dev/restart-all.sh
```

这是默认推荐入口，适合绝大多数本地验证场景。

### 单独启动后端

```bash
./scripts/dev/start-backend.sh
```

默认数据库环境变量：

- `DB_URL=jdbc:postgresql://127.0.0.1:5432/support`
- `DB_USERNAME=lzn`
- `DB_PASSWORD=123456`

### 单独启动前端

```bash
./scripts/dev/start-frontend.sh
```

默认前端地址：

- `HOST=127.0.0.1`
- `PORT=5173`

### 停止本地服务

```bash
./scripts/dev/stop-all.sh
```

## 启动后检查项

至少确认以下两项：

```bash
curl -sf http://127.0.0.1:8080/actuator/health
curl -I -s http://127.0.0.1:5173 | head -n 1
```

期望结果：

- 后端返回 `{"status":"UP"}` 一类健康响应
- 前端返回 `HTTP/1.1 200 OK`

## 日志位置

本地脚本约定的日志目录：

- `.dev-runtime/logs/backend.log`
- `.dev-runtime/logs/frontend.log`

排查优先级建议：

1. 先看 `restart-all.sh` 输出是否完成健康检查
2. 再看前端日志是否已启动 Vite
3. 再看后端日志是否存在数据库、端口或配置错误

## 浏览器验证方法

涉及交互或视觉改动时，优先使用 Playwright 做真实浏览器验证，而不是只依赖构建成功。

### 推荐优先：`playwright-cli`

若环境已安装 `playwright-cli`，优先用它做本地交互回归。它适合：

- 快速打开指定页面
- 复用单个浏览器 session
- 抓取结构化 snapshot
- 执行点击、输入、拖拽、键盘和鼠标动作
- 读取 console 错误，辅助区分功能问题与外部资源噪音

先确认可用性：

```bash
cd /Users/lzn/Documents/trae_projects/support/support-roster-ui
playwright-cli --version
```

### `playwright-cli` 标准流程

建议使用固定 session 名称，便于连续操作：

```bash
cd /Users/lzn/Documents/trae_projects/support/support-roster-ui

playwright-cli close-all >/dev/null 2>&1 || true
playwright-cli -s=support-check open http://127.0.0.1:5173/viewer
playwright-cli -s=support-check resize 1440 960
playwright-cli -s=support-check snapshot --filename=viewer-snapshot.yaml

playwright-cli -s=support-check goto http://127.0.0.1:5173/workspace/roster
playwright-cli -s=support-check snapshot --filename=workspace-roster-before-drag.yaml
```

输出物通常包括：

- `*.yaml`：页面结构快照，可用于查元素 ref 与状态文本
- `.playwright-cli/console-*.log`：console 错误日志

### `playwright-cli` 交互示例：月排班拖拽

对于需要验证“拖拽选区 -> 打开抽屉”这类交互，可以直接使用 CLI 的鼠标命令：

```bash
playwright-cli -s=support-check mousemove 534 235
playwright-cli -s=support-check mousedown
playwright-cli -s=support-check mousemove 622 235
playwright-cli -s=support-check mouseup
playwright-cli -s=support-check snapshot --filename=workspace-roster-after-drag.yaml
playwright-cli -s=support-check console error
```

验证时，至少确认拖拽后的 snapshot 中出现：

- `Clear range`
- `Edit Assignment`
- `Drag selection detected`

### `playwright-cli` 快照判读建议

可直接在快照文件中搜索关键文本：

```bash
rg -n "Edit Assignment|Drag selection detected|Clear range" workspace-roster-after-drag.yaml
```

如果这些关键文本同时存在，通常可判定：

1. 区间选择已形成
2. 抽屉已打开
3. 抽屉已接收到拖拽区间上下文

### `playwright-cli` 使用注意

- 在 Vite 开发环境中，优先使用 `open` / `goto` / `snapshot`，不要把成功条件绑定到 `networkidle`
- `eval` 适合做简单查询；若遇到 CLI 的序列化限制，优先改用 `snapshot + rg`
- 如果只是做拖拽、点击、键盘验证，优先使用 `mousemove`、`mousedown`、`mouseup`、`press`
- 结束后可按需执行：

```bash
playwright-cli close-all
```

### 推荐验证页面

- Public Viewer：`http://127.0.0.1:5173/viewer`
- Monthly Roster：`http://127.0.0.1:5173/workspace/roster`

### 推荐验证要点

#### Viewer

- 页面可正常打开，标题 `On-call Overview` 可见
- 时间轴或状态卡片二者至少有一种正确渲染
- 若接口有数据，应能看到团队行与班次信息
- 若接口无数据或失败，应出现明确空态 / 错误态 / Retry

#### Workspace 月排班

- 页面可正常打开，标题 `Monthly Roster` 可见
- 网格成功渲染，单元格可聚焦和点击
- 键盘导航与抽屉编辑链路可正常触发
- 同一员工行内拖拽后应出现区间摘要，并稳定打开抽屉
- 抽屉中应能看到与区间编辑对应的提示或动作

### Playwright 验证原则

- 优先等待 `domcontentloaded` 或明确元素出现，不要依赖开发环境下不稳定的 `networkidle`
- 对 Vite 开发环境截图时，若字体外链较慢，需避免把截图成功与字体加载强绑定
- 记录 `console error`、`pageerror` 与 `requestfailed`，用于区分页面逻辑错误和外部静态资源失败

### 常见外部资源噪音

在无外网或受限网络环境中，以下失败通常不阻塞主流程验证：

- 头像外链，例如 `photos.global.image`
- Google Fonts，例如 `fonts.googleapis.com`

这类失败会影响视觉一致性，但不应误判为前端功能回归失败。

## 建议的最小回归流程

```bash
cd /Users/lzn/Documents/trae_projects/support
./scripts/dev/restart-all.sh
```

随后在浏览器或 Playwright 中至少检查：

1. `/viewer`
2. `/workspace/roster`
3. 本次改动直接涉及的交互链路

## 维护要求

- 若 `scripts/dev/` 下的命令、端口、日志路径或健康检查地址变化，必须同步更新本文件
- 若新增稳定的浏览器验证目标页或关键交互，也应回写到本文件
- 若 AGENT 执行流依赖本地联调与浏览器验证，本文件应作为优先参考入口之一
