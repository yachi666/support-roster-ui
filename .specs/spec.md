# Support Roster UI - 技术规格书

## 项目概述

**Support Roster UI** 是一个企业级值班排班可视化系统，为技术支持团队提供实时值班状态展示、多时区排班视图和人员联系方式查询功能。系统采用前后端分离架构，前端基于 Vue 3 构建，后端使用 Spring Boot + Excel 数据存储方案。

### 核心价值

- **实时可视化**：24小时时间轴展示当前值班人员，支持多团队并行显示
- **多时区支持**：自动时区转换，支持全球分布式团队协作
- **高信息密度**：在单一视图内聚合团队、人员、联系方式、班次信息
- **零配置部署**：基于 Excel 的数据存储，无需数据库依赖

---

## 技术栈选型

| 层级 | 技术选型 | 版本 | 选型理由 |
|------|---------|------|---------|
| **框架** | Vue.js | 3.5.28 | Composition API、响应式系统、TypeScript 支持 |
| **构建工具** | Vite | 7.3.1 | 快速 HMR、ESM 原生支持、简洁配置 |
| **样式方案** | Tailwind CSS | 4.2.0 | 原子化 CSS、快速原型开发、一致性设计系统 |
| **状态管理** | Pinia | 3.0.4 | Vue 3 官方推荐、类型安全、DevTools 集成 |
| **路由** | Vue Router | 5.0.2 | SPA 路由管理 |
| **UI 组件库** | Radix Vue | 1.9.17 | 无样式原语组件、可访问性保证 |
| **日期处理** | date-fns | 4.1.0 | 模块化、时区支持 (date-fns-tz) |
| **图标** | Lucide Vue Next | 0.574.0 | 轻量级、一致性图标集 |

---

## 文档地图

```
.specs/
├── spec.md              # 本文档 - 主索引
├── architecture.md      # 系统架构设计
├── ui-design.md         # UI 设计规范
└── modules/
    ├── dashboard.md     # Dashboard 仪表盘模块
    ├── header.md        # Header 导航模块
    └── timeline.md      # Timeline 时间轴模块
```

---

## 系统架构概览

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (SPA)                             │
├─────────────────────────────────────────────────────────────────┤
│  App.vue                                                         │
│    └── Dashboard.vue                                             │
│          ├── Header.vue (日期/时区选择)                          │
│          └── Timeline.vue (排班时间轴)                           │
├─────────────────────────────────────────────────────────────────┤
│  API Layer (src/api/index.js)                                   │
│    └── REST Client (fetch-based)                                │
├─────────────────────────────────────────────────────────────────┤
│  HTTP/REST                                                       │
├─────────────────────────────────────────────────────────────────┤
│  Spring Boot Backend (support-roster-server)                    │
│    └── RosterRepository → Excel (roster.xlsx)                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 核心业务概念

### 1. 团队层级 (Team Hierarchy)

| Team ID | 显示名称 | 颜色 | 排序 | 对应 RoleGroup |
|---------|---------|------|------|----------------|
| `incident-manager` | Incident Manager | orange | 0 | Incident_Manager_China, Incident_Manager_India |
| `l1` | L1 | blue | 1 | L1_China, L1_India |
| `ap-l2` | AP L2 | green | 2 | AP_L2 |
| `emea-l2` | EMEA L2 | purple | 3 | EMEA_L2 |
| `mdp-l2` | MDP L2 | red | 4 | MDP_L2 |
| `ap-l2-plus` | AP L2+ | green | 5 | AP_L2+ |
| `ap-l3` | AP L3 | green | 6 | AP_L3 |
| `devops` | DevOps | orange | 7 | DevOps_China, DevOps_India |

### 2. 班次代码 (Shift Codes)

| 代码 | 含义 | 是否主班次 |
|------|------|-----------|
| `OC` | Full Day Oncall Support | ✓ |
| `DS` | Day Shift | ✓ |
| `NS` | Night Shift | ✓ |
| `A` | 00:00-07:00 | ✓ |
| `B` | 06:30-15:30 | ✓ |
| `D` | 15:30-00:30 | ✓ |
| `C` | 08:00-17:00 | ✗ |
| `BH` | Business Hours | ✗ |
| `HoL` | Holiday or Leave | ✗ |

> 说明: 后端主班次集合来自 `PRIMARY_CODES = {OC, DS, NS, A, B, D}`，`C` 作为班次定义存在，但当前不会进入 `/api/shifts` 的主班次输出。

### 3. 角色职责 (非鉴权权限模型)

- **L1**: 一线支持，处理基础工单和用户请求
- **L2**: 二线支持，处理复杂技术问题和区域专项
- **L3**: 三线支持，处理架构级问题和深层技术排查
- **Incident Manager**: 事件协调者，负责重大事件响应协调

当前代码中的约束如下:

- **无登录与 RBAC**: 前后端都没有用户身份或权限校验逻辑。
- **无前端角色态**: Vue 端没有 `currentUserRole` 或类似状态，不会按角色隐藏/禁用功能。
- **后端过滤仅按 teamId + 主班次规则**: `/api/shifts` 仅基于日期、可选 `teamId`、时区和主班次集合筛选。
- **角色职责属于业务语义，不是访问控制**: L1/L2/Incident Manager 目前仅体现在 team/role-group 映射与展示。

---

## 数据流

```
用户选择日期/时区
       │
       ▼
┌──────────────────┐
│  Dashboard.vue   │
│  watch([date,    │
│    timezone])    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  api.getShifts() │
│  GET /api/shifts │
│  ?date=YYYY-MM-DD│
│  &timezone=TZ    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Spring Boot     │
│  RosterService   │
│  .getShiftsByDate│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  RosterRepository│
│  (内存缓存)       │
│  ← roster.xlsx   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  ShiftDto[]      │
│  (JSON Response) │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Timeline.vue    │
│  layout 计算     │
│  → 渲染排班卡片   │
└──────────────────┘
```

---

## Constraints & Technical Debt

### 当前限制

1. **无持久化存储**: 数据完全依赖 Excel 文件，重启后需重新加载
2. **无用户认证**: 系统无登录机制，所有数据公开可见
3. **无实时更新**: 前端需手动刷新或轮询获取最新数据
4. **路由未使用**: Vue Router 配置为空数组，当前为单页应用

### 技术债

| 项目 | 描述 | 优先级 |
|------|------|--------|
| Store 未使用 | `counter.js` 为 Pinia 模板代码，未实际使用 | Low |
| Mock 数据残留 | `mockData.js` 在生产环境未使用 | Low |
| 错误处理简陋 | API 错误仅显示文本，无重试机制 | Medium |
| 无国际化 | 界面硬编码英文 | Low |
| 无单元测试 | 缺少测试覆盖 | Medium |

### TODO 项 (代码中)

- `RosterService.getShiftById()` 返回 `null`，功能未实现

---

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build

# 代码格式化
npm run format
```

---

## 相关文档

- [架构设计](./architecture.md) - 详细架构说明
- [UI 设计规范](./ui-design.md) - 组件设计与样式规范
- [Dashboard 模块](./modules/dashboard.md) - 仪表盘详细设计
- [Header 模块](./modules/header.md) - 导航栏详细设计
- [Timeline 模块](./modules/timeline.md) - 时间轴详细设计
- [变更记录](./CHANGELOG.md) - Spec 变更历史
