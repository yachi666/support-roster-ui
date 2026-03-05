# Header 模块

## 模块概述

Header 是顶部导航组件，提供日期选择、时区切换和实时时钟功能。采用 `v-model` 双向绑定模式与父组件通信。

**文件位置**: `src/components/Header.vue`

---

## 组件接口

### Props

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `selectedDate` | `Date` | ✓ | 当前选中日期 |
| `selectedTimezone` | `string` | ✓ | 当前选中时区 |

### Emits

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:selectedDate` | `Date` | 日期变更 |
| `update:selectedTimezone` | `string` | 时区变更 |

---

## 内部状态

### 时区列表

```javascript
const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'Asia/Shanghai', label: 'CST (China Standard Time)' },
  { value: 'America/Los_Angeles', label: 'PST (Pacific Standard Time)' },
  { value: 'America/New_York', label: 'EST (Eastern Standard Time)' },
  { value: 'Europe/London', label: 'GMT (Greenwich Mean Time)' },
  { value: 'Asia/Tokyo', label: 'JST (Japan Standard Time)' },
]
```

### 实时时钟

```javascript
const currentTime = ref(new Date())
let timer = null

onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)  // 每秒更新
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
```

---

## 计算属性

### 日期值 (用于 input[type="date"])

```javascript
const dateValue = computed(() => format(props.selectedDate, 'yyyy-MM-dd'))
```

### 格式化时间

```javascript
const formattedTime = computed(() => {
  return formatInTimeZone(currentTime.value, props.selectedTimezone, 'HH:mm:ss')
})
```

### 时区标签

```javascript
const timezoneLabel = computed(() => {
  return props.selectedTimezone.split('/')[1] || props.selectedTimezone
})
// 'Asia/Shanghai' → 'Shanghai'
// 'UTC' → 'UTC'
```

### 格式化日期

```javascript
const formattedDate = computed(() => {
  return format(props.selectedDate, 'EEE, MMM d, yyyy')
})
// 'Mon, Jan 1, 2025'
```

---

## 事件处理

### 日期输入

```javascript
const handleDateInput = (e) => {
  const date = new Date(e.target.value)
  if (!isNaN(date.getTime())) {
    emit('update:selectedDate', date)
  }
}
```

### 快捷设置今日

```javascript
const setToday = () => emit('update:selectedDate', new Date())
```

### 时区切换

```javascript
const onTimezoneChange = (e) => emit('update:selectedTimezone', e.target.value)
```

---

## 布局结构

```
┌─────────────────────────────────────────────────────────────────────────┐
│  On-call Overview                                                       │
│  🕐 14:30:45 Shanghai | Mon, Jan 1, 2025                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                    ┌─────────┬─────────┐│
│                                                    │ Today ▼ │ 📅 Date ││
│                                                    └─────────┴─────────┘│
│                                                    ┌───────────────────┐│
│                                                    │ 🌐 Timezone    ▼  ││
│                                                    └───────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 样式规范

### 容器

```css
header.flex.items-center.justify-between.px-6.py-4.bg-white.border-b.border-gray-200.shadow-sm.z-20.sticky.top-0
```

### 标题区

```css
h1.text-xl.font-semibold.text-gray-900.tracking-tight
```

### 时钟区

```css
div.flex.items-center.text-sm.text-gray-500.mt-1.font-mono
```

### 日期选择器容器

```css
div.flex.items-center.bg-gray-50.rounded-lg.p-1.border.border-gray-200
```

### 时区选择器容器

```css
div.flex.items-center.space-x-2.bg-white.border.border-gray-200.rounded-lg.px-3.py-1.5.hover:border-gray-300.transition-colors.shadow-sm
```

---

## 依赖

### 外部库

| 库 | 用途 |
|------|------|
| `date-fns` | 日期格式化 (`format`) |
| `date-fns-tz` | 时区格式化 (`formatInTimeZone`) |
| `lucide-vue-next` | 图标 (`Calendar`, `Clock`, `Globe`) |

### 导入

```javascript
import { format } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { Calendar, Clock, Globe } from 'lucide-vue-next'
```

---

## 交互细节

### Today 按钮

- 视觉: 文本按钮，悬停时背景变白
- 行为: 立即将日期设置为当前日期

### 日期选择器

- 使用原生 `<input type="date">`
- 图标: 日历图标 (左侧)
- 格式: YYYY-MM-DD

### 时区选择器

- 使用原生 `<select>`
- 图标: 地球图标 (左侧)
- 下拉箭头: 自定义 SVG

---

## 可访问性

### 当前实现

- 原生 HTML 元素 (`<input>`, `<select>`, `<button>`)
- 支持键盘导航 (Tab, Enter)

### 建议增强

```vue
<button 
  @click="setToday"
  aria-label="Set date to today"
>
  Today
</button>

<select 
  :value="selectedTimezone"
  @change="onTimezoneChange"
  aria-label="Select timezone"
>
```

---

## 性能考量

### 定时器清理

```javascript
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
```

确保组件卸载时清理定时器，避免内存泄漏。

### 更新频率

- 时钟: 每秒更新 (1000ms)
- 可优化为每分钟更新 (60000ms)，秒数可通过 CSS 动画实现

---

## 改进建议

### 添加日期快捷操作

```vue
<div class="flex space-x-1">
  <button @click="setYesterday">Yesterday</button>
  <button @click="setToday">Today</button>
  <button @click="setTomorrow">Tomorrow</button>
</div>
```

### 添加时区搜索

对于大量时区，建议使用 Combobox 组件：

```vue
<Combobox v-model="selectedTimezone">
  <ComboboxInput placeholder="Search timezone..." />
  <ComboboxOptions>
    <ComboboxOption v-for="tz in filteredTimezones" :value="tz.value">
      {{ tz.label }}
    </ComboboxOption>
  </ComboboxOptions>
</Combobox>
```

### 添加用户偏好持久化

```javascript
import { useLocalStorage } from '@vueuse/core'

const selectedTimezone = useLocalStorage('roster-timezone', 'UTC')
```
