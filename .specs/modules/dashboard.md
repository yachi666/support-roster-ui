# Dashboard 模块规范

## 文档定位

本文件描述 Public Viewer 页面容器 `Dashboard.vue` 的职责、状态编排与模块协作方式，是模块分册中的页面总控章节。

## 阅读提示

- 若要理解模块间调用关系，建议先读 `index.md`，再回到本页。
- 具体顶部控件与时间轴算法分别拆在 `header.md` 与 `timeline.md`。

## 模块概述

Dashboard 是应用的主容器组件，负责协调 Header 和 Timeline 子组件，管理页面级日期、三态时区和数据，并处理 API 数据获取。

**文件位置**: `src/components/Dashboard.vue`

---

## 组件结构

```
Dashboard.vue
├── Header.vue (日期/时区选择)
└── Timeline.vue (排班时间轴)
```

---

## 状态管理

### 本地状态

| 状态 | 类型 | 初始值 | 说明 |
|------|------|--------|------|
| `selectedDate` | `Date` | `new Date()` | 当前选中日期 |
| `selectedTimezone` | `string` | 归一化后的 UTC/HKT/IST | 当前选中时区 |
| `teams` | `TeamDto[]` | `[]` | 团队列表 |
| `shifts` | `ShiftDto[]` | `[]` | 排班数据 |
| `loading` | `boolean` | `false` | 加载状态 |
| `error` | `string \| null` | `null` | 错误信息 |

### 计算属性

```javascript
const formattedDate = computed(() => format(selectedDate.value, 'yyyy-MM-dd'))
```

---

## 数据流

### 初始化流程

```
onMounted()
    │
    ├── fetchTeams() ──────────────► teams.value
    │
    └── fetchShifts() ─────────────► shifts.value
                   │
                   └── GET /api/shifts?date=YYYY-MM-DD&timezone=IANA_TZ
```

### 响应式更新

```javascript
watch([selectedDate, selectedTimezone], () => {
  fetchShifts()
})
```

当日期或时区变化时，自动重新获取排班数据。Header 输出的 UTC/HKT/IST 会在请求前转换为 IANA 时区。

---

## API 调用

### fetchTeams

```javascript
async function fetchTeams() {
  try {
    const data = await api.getTeams()
    teams.value = data
  } catch (err) {
    console.error('Failed to fetch teams:', err)
    error.value = 'Failed to load teams'
  }
}
```

### fetchShifts

```javascript
async function fetchShifts() {
  loading.value = true
  error.value = null
  try {
    const data = await api.getShifts(formattedDate.value, null, toIanaTimezone(selectedTimezone.value))
    shifts.value = data
  } catch (err) {
    console.error('Failed to fetch shifts:', err)
    error.value = 'Failed to load shifts'
  } finally {
    loading.value = false
  }
}
```

---

## Props 传递

### Header Props

```vue
<Header 
  v-model:selected-date="selectedDate" 
  v-model:selected-timezone="selectedTimezone" 
/>
```

等价于：

```vue
<Header 
  :selected-date="selectedDate"
  :selected-timezone="selectedTimezone"
  @update:selected-date="selectedDate = $event"
  @update:selected-timezone="selectedTimezone = $event"
/>
```

### Timeline Props

```vue
<Timeline
  :selected-date="selectedDate"
  :selected-timezone="selectedTimezone"
  :teams="teams"
  :shifts="shifts"
/>
```

---

## 条件渲染

### 加载状态

```vue
<div v-if="loading" class="flex items-center justify-center h-full">
  <div class="text-gray-500">Loading...</div>
</div>
```

### 错误状态

```vue
<div v-else-if="error" class="flex items-center justify-center h-full">
  <div class="text-red-500">{{ error }}</div>
</div>
```

### 正常状态

```vue
<Timeline
  v-else
  :selected-date="selectedDate"
  :selected-timezone="selectedTimezone"
  :teams="teams"
  :shifts="shifts"
/>
```

---

## 布局结构

```vue
<template>
  <div class="flex flex-col h-full bg-slate-50 text-slate-900 font-sans">
    <!-- Header: 固定高度 -->
    <Header v-model:selected-date="selectedDate" v-model:selected-timezone="selectedTimezone" />
    
    <!-- Timeline: 填充剩余空间 -->
    <div class="flex-1 overflow-hidden relative">
      <!-- 状态渲染 -->
    </div>
  </div>
</template>
```

---

## 设计决策

### 为什么使用组件级状态而非 Pinia？

1. **状态范围有限**: 仅日期、时区、数据三个状态
2. **无跨组件共享**: Header 和 Timeline 通过 Props 通信
3. **简单性**: 避免引入额外复杂度

### 时区约束

- Viewer 只允许 `UTC`、`HKT`、`IST`
- 页面内部保留 day-level date 选择，因为公共 Viewer 仍按单日查看排班
- 时间展示和接口参数统一通过共享时区映射工具转换

### 为什么并行获取 Teams 和 Shifts？

```javascript
await Promise.all([fetchTeams(), fetchShifts()])
```

两个 API 无依赖关系，并行获取可减少总加载时间。

---

## 改进建议

### 错误处理增强

```javascript
// 当前
error.value = 'Failed to load shifts'

// 建议
error.value = {
  message: 'Failed to load shifts',
  retry: () => fetchShifts()
}
```

### 加载状态增强

```vue
<!-- 建议添加骨架屏 -->
<div v-if="loading" class="animate-pulse">
  <div class="h-12 bg-gray-200 rounded"></div>
  <div class="h-32 bg-gray-100 rounded mt-4"></div>
</div>
```

### 数据缓存

```javascript
// 建议添加简单缓存
const shiftsCache = new Map<string, ShiftDto[]>()

async function fetchShifts() {
  const cacheKey = `${formattedDate.value}|${selectedTimezone.value}`
  if (shiftsCache.has(cacheKey)) {
    shifts.value = shiftsCache.get(cacheKey)
    return
  }
  // ... fetch and cache
}
```
