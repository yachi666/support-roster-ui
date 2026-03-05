# 系统架构设计

## 整体架构

Support Roster 采用经典的前后端分离架构，后端使用 **Excel 文件作为数据源**，通过内存缓存提供 REST API 服务。这种设计适合小规模团队、快速迭代的场景。

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Client Layer                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                        Browser Runtime                           │   │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │   │
│   │  │   Vue 3     │  │   Pinia     │  │    Vue Router           │  │   │
│   │  │ (Reactivity)│  │  (Store)    │  │    (SPA Routing)        │  │   │
│   │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │ HTTP/REST
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                             API Gateway                                  │
│                     (Spring Boot Embedded Tomcat)                        │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Service Layer                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │  RosterService  │  │  StaffService   │  │   RoleGroupService      │  │
│  └────────┬────────┘  └────────┬────────┘  └────────────┬────────────┘  │
│           │                    │                        │               │
│           └────────────────────┼────────────────────────┘               │
│                                │                                        │
└────────────────────────────────┼────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Data Access Layer                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    RosterRepository                              │   │
│   │  ┌─────────────────────────────────────────────────────────┐    │   │
│   │  │              In-Memory Cache (@PostConstruct)            │    │   │
│   │  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │    │   │
│   │  │  │shiftDefMap   │ │ staffShifts  │ │   roleGroupMap   │ │    │   │
│   │  │  │Map<String,   │ │ List<        │ │ Map<String,      │ │    │   │
│   │  │  │ShiftDef>     │ │ StaffShift>  │ │ RoleGroup>       │ │    │   │
│   │  │  └──────────────┘ └──────────────┘ └──────────────────┘ │    │   │
│   │  └─────────────────────────────────────────────────────────┘    │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ Apache Fesod (Excel Parser)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Data Source                                     │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    roster.xlsx (Classpath)                       │   │
│   │  ┌────────────────────────┐ ┌────────────────────────────────┐  │   │
│   │  │  Sheet 0: Shift Defs   │ │  Sheet 1: Staff Shifts         │  │   │
│   │  │  (班次定义)            │ │  (员工排班数据, 1-31天)        │  │   │
│   │  └────────────────────────┘ └────────────────────────────────┘  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 前端架构

### 目录结构

```
src/
├── api/
│   └── index.js          # API 客户端封装
├── assets/
│   └── main.css          # 全局样式 (Tailwind 入口)
├── components/
│   ├── Dashboard.vue     # 主仪表盘容器
│   ├── Header.vue        # 顶部导航栏
│   └── Timeline.vue      # 时间轴组件
├── data/
│   └── mockData.js       # 开发用 Mock 数据 (生产未使用)
├── lib/
│   └── utils.js          # 工具函数 (cn, formatTime24)
├── router/
│   └── index.js          # Vue Router 配置 (当前为空)
├── stores/
│   └── counter.js        # Pinia Store (模板代码，未使用)
├── App.vue               # 根组件
└── main.js               # 应用入口
```

### 组件层级

```
App.vue
└── Dashboard.vue
    ├── Header.vue
    │   ├── 日期选择器
    │   ├── 时区选择器
    │   └── 实时时钟
    └── Timeline.vue
        ├── 时间轴表头 (24小时刻度)
        ├── 当前时间指示线
        └── TeamRow[]
            └── ShiftCard[] (带 Tooltip)
```

### 状态管理策略

当前项目采用 **组件级状态管理**，未使用全局 Store：

```
┌─────────────────────────────────────────────────────────────────┐
│                        Dashboard.vue                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Local State (ref)                                         │ │
│  │  ├── selectedDate: Date                                    │ │
│  │  ├── selectedTimezone: string                              │ │
│  │  ├── teams: TeamDto[]                                      │ │
│  │  ├── shifts: ShiftDto[]                                    │ │
│  │  ├── loading: boolean                                      │ │
│  │  └── error: string | null                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Props Flow (单向数据流)                                   │ │
│  │  Header ← [selectedDate, selectedTimezone]                 │ │
│  │  Timeline ← [selectedDate, selectedTimezone, teams, shifts]│ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Events Flow (向上冒泡)                                    │ │
│  │  Header → update:selectedDate                              │ │
│  │  Header → update:selectedTimezone                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**设计决策**：
- 状态范围有限（仅日期、时区、数据），无需全局 Store
- 使用 `v-model:selected-date` 实现双向绑定语法糖
- 未来如需添加用户偏好、主题等全局状态，可迁移至 Pinia

---

## 后端架构

### 数据持久化方案

**设计理念**：无数据库架构，使用 Excel 作为唯一数据源。

```
┌─────────────────────────────────────────────────────────────────┐
│                    Application Lifecycle                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Spring Boot 启动                                             │
│       │                                                          │
│       ▼                                                          │
│  2. RosterRepository @PostConstruct                              │
│       │                                                          │
│       ▼                                                          │
│  3. loadRosterData()                                             │
│       │                                                          │
│       ├──► loadShiftDefinitions()                                │
│       │    └── Sheet 0 → shiftDefinitionMap                      │
│       │                                                          │
│       └──► loadStaffShiftData()                                  │
│            └── Sheet 1 → staffShifts, staffMap, roleGroupMap     │
│                                                                  │
│  4. 数据驻留内存，API 直接访问                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Excel 数据模型

#### Sheet 0: Shift Definitions (班次定义)

| 列名 | 类型 | 说明 |
|------|------|------|
| role_group | String | 角色组 ID (如 `L1_China`) |
| code | String | 班次代码 (如 `OC`, `DS`) |
| meaning | String | 班次含义描述 |
| start_time | String | 开始时间 (HH:mm:ss) |
| end_time | String | 结束时间 (HH:mm:ss) |
| timezone | String | 时区代码 (HKT/IST/INT) |
| show_on_roster_page | String | 是否显示 (Y/N) |
| remark | String | 备注 |

#### Sheet 1: Staff Shifts (员工排班)

| 列名 | 类型 | 说明 |
|------|------|------|
| name | String | 员工姓名 |
| staff_id | Long | 员工 ID |
| role_group | String | 角色组 ID |
| region | String | 区域 |
| contact | String | 联系电话 |
| notes | String | 备注 |
| day1 - day31 | String | 每日班次代码 |

### 实体关系

```
┌──────────────────┐       ┌──────────────────┐
│      Staff       │       │   RoleGroup      │
├──────────────────┤       ├──────────────────┤
│ id: Long         │       │ id: String       │
│ name: String     │       │ name: String     │
│ avatar: String   │       │ category: String │
│ email: String    │       │ region: String   │
│ phone: String    │       └────────┬─────────┘
│ slack: String    │                │
│ region: String   │                │
│ contact: String  │                │
│ roleGroups: List │────────────────┘
└────────┬─────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐       ┌──────────────────┐
│    StaffShift    │       │ ShiftDefinition  │
├──────────────────┤       ├──────────────────┤
│ staffId: Long    │──────►│ roleGroup: String│
│ name: String     │       │ code: String     │
│ roleGroup: String│──────►│ meaning: String  │
│ region: String   │       │ startTime: String│
│ contact: String  │       │ endTime: String  │
│ notes: String    │       │ timezone: String │
│ dailyShifts:     │       │ showOnRosterPage │
│   Map<day, code> │       │ remark: String   │
└──────────────────┘       └──────────────────┘
```

---

## API 设计

### RESTful Endpoints

| Method | Endpoint | 描述 | 参数 |
|--------|----------|------|------|
| GET | `/api/teams` | 获取所有团队列表 | - |
| GET | `/api/shifts` | 获取指定日期的排班 | `date`, `teamId?`, `timezone` |
| GET | `/api/shifts/{id}` | 获取单个排班详情 | - |
| GET | `/api/staff` | 获取所有员工列表 | - |
| GET | `/api/staff/{id}` | 获取单个员工详情 | - |
| GET | `/api/role-groups` | 获取所有角色组 | - |
| GET | `/api/shift-codes` | 获取所有班次代码 | - |

### API 客户端实现

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  }
  const response = await fetch(url, config)
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(error.message || 'Request failed')
  }
  return response.json()
}
```

### 数据传输对象 (DTO)

#### ShiftDto

```typescript
interface ShiftDto {
  id: string              // UUID (staffId|code|date)
  teamId: string          // 团队 ID
  staffId: number         // 员工 ID
  userName: string        // 员工姓名
  userAvatar: string      // 头像 URL
  code: string            // 班次代码
  meaning: string         // 班次含义
  start: OffsetDateTime   // 开始时间 (ISO 8601)
  end: OffsetDateTime     // 结束时间 (ISO 8601)
  timezone: string        // 时区
  isPrimary: boolean      // 是否主班次
  showOnRoster: boolean   // 是否显示
  remark: string          // 备注
  contact: ContactDto     // 联系方式
  backup: BackupDto       // 备份人员
}
```

#### TeamDto

```typescript
interface TeamDto {
  id: string      // 团队 ID
  name: string    // 显示名称
  color: string   // 颜色标识
  order: number   // 排序权重
}
```

---

## 时区处理

### 时区映射

| 代码 | 时区 |
|------|------|
| HKT | Asia/Hong_Kong |
| IST | Asia/Kolkata |
| INT | UTC |

### 时区转换流程

```
Excel 数据 (源时区)
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  RosterService.convertToShiftDto()                   │
│                                                      │
│  1. 解析班次时间: startTime, endTime, shiftTimezone  │
│  2. 构建源时区 ZonedDateTime                         │
│  3. 转换为目标时区 (用户选择)                        │
│  4. 输出 OffsetDateTime (ISO 8601)                   │
│                                                      │
└──────────────────────────────────────────────────────┘
       │
       ▼
前端 Timeline.vue
       │
       ├── viewWindow: 计算可视窗口 (UTC 基准)
       └── layout: 计算卡片位置 (像素映射)
```

### 跨日班次处理

```java
if (endTime != null && startTime != null && endTime.isBefore(startTime)) {
    endDateTime = endDateTime.plusDays(1);
}
```

当结束时间小于开始时间时（如夜班 22:00-06:00），自动将结束日期延后一天。

---

## 性能考量

### 前端优化

| 策略 | 实现方式 |
|------|---------|
| 组件懒加载 | 未使用（单页应用，组件较少） |
| 虚拟滚动 | 未使用（数据量小，最大 24 小时 × 8 团队） |
| 防抖/节流 | 未使用（无高频交互） |
| 计算属性缓存 | `computed(() => layout)` 避免重复计算 |

### 后端优化

| 策略 | 实现方式 |
|------|---------|
| 内存缓存 | `@PostConstruct` 一次性加载 |
| 无数据库查询 | 所有操作在内存中完成 |
| 无连接池 | 单体应用，无外部依赖 |

### 潜在瓶颈

1. **Excel 文件大小**: 当前设计适合月度排班（~31 天），年度排班需分表
2. **并发写入**: 当前无写入 API，如需添加需考虑文件锁
3. **热更新**: 数据变更需重启应用

---

## 安全考量

### 当前状态

- **无认证**: 所有 API 公开访问
- **无授权**: 无角色权限控制
- **CORS**: 已配置允许跨域

### CORS 配置

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("*")
            .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}
```

### 建议增强

1. 添加 Spring Security + JWT 认证
2. 限制 CORS 允许的域名
3. 添加 API 速率限制
