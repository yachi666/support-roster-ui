# Header 模块规范

## 文档定位

本文件描述 `Header.vue` 在 Public Viewer 中承载的筛选、切换与触发职责，属于展示页的顶部控制章节。

## 阅读提示

- 本页关注用户输入和事件触发，不重复展开页面容器逻辑。
- 与时间轴渲染直接相关的布局算法请参见 `timeline.md`。

## 模块概述

Header 是顶部导航组件，提供日期选择、UTC/HKT/IST 时区切换、实时时钟、外部系统抽屉入口和跨产品页面入口。采用 `v-model` 双向绑定模式与父组件通信。

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
const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC' },
  { value: 'HKT', label: 'HKT' },
  { value: 'IST', label: 'IST' },
]
```

- Header 对外只暴露 UTC / HKT / IST 三种选择。
- 组件内部会把 HKT / IST 映射到 IANA 时区，用于时钟显示与时间轴计算。

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

### 外部系统抽屉

```javascript
const isExternalSystemsDrawerOpen = ref(false)

const openExternalSystemsDrawer = () => {
  isExternalSystemsDrawerOpen.value = true
}

const closeExternalSystemsDrawer = () => {
  isExternalSystemsDrawerOpen.value = false
}
```

- Header 内部维护抽屉开关状态，不向 Dashboard 暴露额外事件。
- 外部系统列表来自 `src/lib/externalSystems.js`，便于后续替换公司内部链接。
- 抽屉组件为 `ExternalSystemsDrawer.vue`，负责遮罩、关闭、Esc 键关闭和外链跳转。

---

## 计算属性

### 日期值 (用于 input[type="date"])

```javascript
const dateValue = computed(() => format(props.selectedDate, 'yyyy-MM-dd'))
```

### 格式化时间

```javascript
const formattedTime = computed(() => {
  return formatInTimeZone(currentTime.value, resolvedTimezone.value, 'HH:mm:ss')
})
```

### 时区标签

```javascript
const timezoneLabel = computed(() => {
  return normalizeTimezoneSelection(props.selectedTimezone)
})
// 'Asia/Hong_Kong' → 'HKT'
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

Viewer 请求后端 `/api/shifts` 时，应把当前选项转换为 IANA 时区，例如 `HKT -> Asia/Hong_Kong`、`IST -> Asia/Kolkata`。

---

## 布局结构

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Messaging Support Rota & Escalation Matrix                            │
│  🕐 14:30:45 Shanghai | Mon, Jan 1, 2025                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                    ┌─────────┬─────────┐│
│                                                    │ Today ▼ │ 📅 Date ││
│                                                    └─────────┴─────────┘│
│                                                    ┌───────────────────┐│
│                                                    │ 🌐 Timezone    ▼  ││
│                                                    └───────────────────┘│
│                                                    [Contact][Vault][Workspace][↗][📰]
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
h1.text-lg.font-semibold.text-gray-900.tracking-tight
```

### 时钟区

```css
div.flex.items-center.text-sm.text-gray-500.mt-1.font-mono
```

### 日期选择器容器

```css
div.flex.h-10.items-center.rounded-md.border.border-slate-200.bg-slate-50/70.p-0.5
```

### 时区选择器容器

```css
div.flex.h-10.items-center.gap-2.rounded-md.border.border-slate-200.bg-white.px-3.hover:border-slate-300.hover:bg-slate-50
```

### 工具入口

- Header 右侧工具区依次展示 Contact Information、Linux Password Vault、Workspace、External Systems 和 Product Updates。
- Header 工具栏采用 quiet operational toolbar 风格：控件统一 `h-10`、`rounded-md`、浅 slate 边框和白底/浅灰底默认态，去掉独立卡片式阴影。
- Contact Information、Linux Password Vault 与 Workspace 使用文字 + 图标按钮，保持普通工具入口层级。
- Workspace 不使用大面积 teal 底色，仅保留 teal 图标和 hover/focus 强调，避免抢占主视觉。
- Product Updates 使用最右侧仅图标按钮，`to="/product-updates"`，图标采用 `Newspaper`，用于快速打开产品更新日志中心。
- Product Updates 图标按钮必须提供 `aria-label` 与 `title`，显示文本来自 `common.productUpdates`，避免纯图标入口对辅助技术不可见。
- External Systems 使用仅图标按钮，放在 Product Updates 前一位，图标采用 `PanelRightOpen`，默认态与其他工具入口一致，仅在 hover/focus 时出现 sky 强调。
- External Systems 抽屉展示 xMatters、ServiceNow 和 Message Delivery Knowledge Base 三个入口，URL 优先来自 `VITE_XMATTERS_URL`、`VITE_SERVICENOW_URL`、`VITE_MESSAGE_DELIVERY_KB_URL`，未配置时使用公开官网/文档站占位，点击后以新标签页打开。
- Workspace 保持 teal 主动作层级，显示文案统一为 `Workspace`。

```vue
<RouterLink
  to="/product-updates"
  :aria-label="t('common.productUpdates')"
  :title="t('common.productUpdates')"
>
  <Newspaper aria-hidden="true" />
</RouterLink>
```

---

## 依赖

### 外部库

| 库 | 用途 |
|------|------|
| `date-fns` | 日期格式化 (`format`) |
| `date-fns-tz` | 时区格式化 (`formatInTimeZone`) |
| `lucide-vue-next` | 图标 (`Calendar`, `Clock`, `Globe`, `ContactRound`, `KeyRound`, `LayoutDashboard`, `Newspaper`) |

### 导入

```javascript
import { format } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import {
  Calendar,
  Clock,
  ContactRound,
  Globe,
  KeyRound,
  LayoutDashboard,
  Newspaper,
  PanelRightOpen,
} from 'lucide-vue-next'
import ExternalSystemsDrawer from '@/components/ExternalSystemsDrawer.vue'
import { EXTERNAL_SYSTEM_LINKS } from '@/lib/externalSystems'
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

### 外部系统抽屉

- 入口为纯图标按钮，提供 `aria-label="External systems"` 与 `title="External systems"`。
- 抽屉使用 `Teleport` 挂载到 `body`，避免受 Header 层级影响。
- 关闭方式包括点击遮罩、点击关闭按钮和按 Esc。
- 每个外部系统入口使用 `<a target="_blank" rel="noreferrer">`，避免替换当前 viewer 页面。
- 外部系统 URL 属于 Vite 构建期环境变量；修改 `.env.production` 后需要重新构建前端包或镜像才会生效。
- Message Delivery Knowledge Base 使用本地生成图标 `src/assets/external-systems/message-delivery-kb.png`；xMatters 与 ServiceNow 使用公开官网 favicon URL 作为占位图标。

---

## 可访问性

### 当前实现

- 原生 HTML 元素 (`<input>`, `<select>`, `<button>`)
- 支持键盘导航 (Tab, Enter)
- External Systems 抽屉使用 `role="dialog"`、`aria-modal="true"` 与标题关联，并支持 Esc 关闭

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
