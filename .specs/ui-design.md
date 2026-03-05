# UI 设计规范

## 设计理念

Support Roster UI 采用 **高信息密度仪表盘** 设计范式，在有限的屏幕空间内最大化信息展示效率。设计遵循以下原则：

1. **信息优先**: 核心数据（值班人员、时间）占据视觉焦点
2. **渐进披露**: 基础信息直接展示，详细信息通过交互获取
3. **视觉层级**: 通过颜色、大小、间距建立清晰的信息层级
4. **一致性**: 统一的组件样式和交互模式

---

## 设计系统

### 色彩系统

#### 主色调 (团队标识)

| 颜色名 | Tailwind Class | 用途 | Hex |
|--------|---------------|------|-----|
| Orange | `bg-orange-500` | Incident Manager, DevOps | #f97316 |
| Blue | `bg-blue-500` | L1 Support | #3b82f6 |
| Green | `bg-emerald-500` | AP L2, AP L2+, AP L3 | #10b981 |
| Purple | `bg-purple-500` | EMEA L2 | #a855f7 |
| Red | `bg-red-500` | MDP L2 | #ef4444 |

#### 班次卡片背景色

```javascript
const getShiftBgClass = (teamColor) => {
  const colors = {
    blue: 'bg-blue-100 border-blue-200 text-blue-900 hover:bg-blue-200',
    green: 'bg-emerald-100 border-emerald-200 text-emerald-900 hover:bg-emerald-200',
    orange: 'bg-orange-100 border-orange-200 text-orange-900 hover:bg-orange-200',
    purple: 'bg-purple-100 border-purple-200 text-purple-900 hover:bg-purple-200',
    red: 'bg-red-100 border-red-200 text-red-900 hover:bg-red-200',
  }
  return colors[teamColor] || 'bg-gray-100 border-gray-200'
}
```

#### 语义色

| 用途 | Tailwind Class | 说明 |
|------|---------------|------|
| 当前时间线 | `bg-red-500` | 红色垂直线 |
| 成功/在线 | `text-emerald-500` | 主班次标识 |
| 警告 | `text-orange-500` | - |
| 错误 | `text-red-500` | 错误提示 |
| 中性 | `text-gray-500` | 次要文本 |

### 排版系统

#### 字体栈

```css
font-sans: ui-sans-serif, system-ui, sans-serif
font-mono: ui-monospace, SFMono-Regular, monospace
```

#### 字号规范

| 用途 | Tailwind Class | 大小 | 行高 |
|------|---------------|------|------|
| 页面标题 | `text-xl` | 20px | 28px |
| 区块标题 | `text-sm` | 14px | 20px |
| 正文 | `text-sm` | 14px | 20px |
| 辅助文本 | `text-xs` | 12px | 16px |
| 时间标签 | `text-xs font-mono` | 12px | 16px |

#### 字重

| 用途 | Tailwind Class |
|------|---------------|
| 标题 | `font-semibold` (600) |
| 强调 | `font-medium` (500) |
| 正文 | `font-normal` (400) |

### 间距系统

基于 Tailwind 默认间距（1 单位 = 4px）：

| 用途 | 值 | 说明 |
|------|-----|------|
| 组件内边距 | `px-3 py-1.5` | 按钮、输入框 |
| 卡片内边距 | `px-3` | 班次卡片 |
| 区块间距 | `space-x-4` | Header 元素 |
| 行间距 | `space-y-2` | 列表项 |

---

## 通用组件

### 1. 班次卡片 (Shift Card)

#### 视觉规范

```
┌────────────────────────────────────────────────────────┐
│ ┌──┐ ┌────┐ ┌─────────────┐          ┌──────────────┐ │
│ │★ │ │头像│ │ 员工姓名    │          │ 08:00-17:00  │ │
│ └──┘ └────┘ └─────────────┘          └──────────────┘ │
└────────────────────────────────────────────────────────┘
```

#### 属性定义

| 属性 | 类型 | 说明 |
|------|------|------|
| `left` | number | 左偏移量 (px) |
| `width` | number | 卡片宽度 (px) |
| `top` | number | 顶部偏移量 (px) |
| `height` | number | 卡片高度 (固定 36px) |
| `color` | string | 团队颜色 |

#### 样式类

```css
.absolute
.rounded-lg
.border
.px-3
.flex.items-center.justify-between
.overflow-hidden
.cursor-pointer
.shadow-sm.hover:shadow-md
.transition-all
.select-none
```

#### 条件渲染

```vue
<Star v-if="layoutShift.shift.isPrimary" />  <!-- 主班次标识 -->
<span v-if="layoutShift.width > 80">          <!-- 时间显示 (宽度 > 80px) -->
  {{ formatShiftTimeInZone(...) }}
</span>
```

### 2. 时间轴表头 (Timeline Header)

#### 布局参数

```javascript
const HOUR_WIDTH = 120      // 每小时宽度
const TOTAL_WIDTH = 24 * HOUR_WIDTH  // 总宽度 2880px
```

#### 刻度设计

```
┌──────┬──────┬──────┬──────┬──────┬──────┐
│ 00:00│ 01:00│ 02:00│ 03:00│ 04:00│ ...  │
└──────┴──────┴──────┴──────┴──────┴──────┘
```

- 每个刻度宽度: 120px
- 字体: `font-mono text-xs`
- 颜色: `text-gray-400`
- 边框: `border-r border-gray-200/50`

### 3. 当前时间指示线 (Current Time Indicator)

#### 视觉设计

```
        ▼ (红色三角形指示器)
        │
        │ (红色半透明垂直线)
        │
```

#### 实现逻辑

```javascript
const currentTimeLeft = computed(() => {
  const diff = differenceInMinutes(now.value, viewWindow.value.start)
  if (diff < 0 || diff > 24 * 60) return null
  return (diff / 60) * HOUR_WIDTH
})
```

#### 样式

```css
/* 表头指示器 */
.absolute.top-0.bottom-0.z-50.w-px.bg-red-500

/* 三角形 */
.w-0.h-0
.border-l-[5px].border-l-transparent
.border-r-[5px].border-r-transparent
.border-t-[6px].border-t-red-500

/* 内容区指示线 */
.absolute.top-0.bottom-0.w-px.bg-red-500/50
```

### 4. 团队行 (Team Row)

#### 布局结构

```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────┐ ┌─────────────────────────────────────┐ │
│ │ ● Team Name         │ │ [Shift Cards...]                    │ │
│ │   N active shifts   │ │                                     │ │
│ └─────────────────────┘ └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
│← 240px (sticky) →│← 2880px (scrollable) →│
```

#### 高度计算

```javascript
const height = Math.max(
  MIN_ROW_HEIGHT,  // 80px
  lanes.length * (BLOCK_HEIGHT + BLOCK_GAP) + ROW_PADDING * 2
)
// BLOCK_HEIGHT = 36, BLOCK_GAP = 8, ROW_PADDING = 16
```

### 5. Tooltip (详情浮层)

#### 内容结构

```
┌────────────────────────────────────────────────────┐
│ ┌────┐ ┌─────────────────┐    ┌──────────────┐   │
│ │头像│ │ 员工姓名        │    │ Role Badge   │   │
│ │    │ │ Primary/Second  │    │              │   │
│ └────┘ └─────────────────┘    └──────────────┘   │
│ ──────────────────────────────────────────────── │
│ 🕐 08:00 - 17:00                                 │
│ ──────────────────────────────────────────────── │
│ 💬 @username                                     │
│ ✉️ username@company.com                          │
│ 📞 +1-555-0101                                   │
│ ──────────────────────────────────────────────── │
│ Backup: Alex Chen (@achen)                       │
└────────────────────────────────────────────────────┘
```

#### 组件配置

```vue
<TooltipProvider :delay-duration="200">
  <TooltipRoot>
    <TooltipTrigger as-child>
      <!-- Shift Card -->
    </TooltipTrigger>
    <TooltipPortal>
      <TooltipContent
        class="z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-72"
        :side-offset="5"
      >
        <!-- Content -->
        <TooltipArrow class="fill-white" />
      </TooltipContent>
    </TooltipPortal>
  </TooltipRoot>
</TooltipProvider>
```

---

## 交互规范

### 悬停状态

| 元素 | 悬停效果 |
|------|---------|
| 班次卡片 | `hover:bg-{color}-200`, `hover:shadow-md`, `z-index: 20` |
| 团队行 | `hover:bg-gray-50/50` |
| 联系方式 | `hover:text-gray-900`, `cursor-pointer` |
| 时区选择器 | `hover:border-gray-300` |

### 点击行为

| 元素 | 行为 |
|------|------|
| Today 按钮 | 设置 `selectedDate = new Date()` |
| 日期选择器 | 原生 `<input type="date">` |
| 时区选择器 | 原生 `<select>` |
| 班次卡片 | 显示 Tooltip (无跳转) |

### 键盘支持

- Tab 键导航（原生 HTML 元素）
- 无自定义键盘快捷键

---

## 响应式设计

### 当前实现

项目采用 **固定宽度时间轴 + 水平滚动** 的响应策略：

```
┌─────────────────────────────────────────────────────────────┐
│                      Viewport                               │
│  ┌────────────┐ ┌───────────────────────────────────────┐  │
│  │ Team Panel │ │ Timeline (scrollable)                 │  │
│  │ (sticky)   │ │ ← scroll →                            │  │
│  │  240px     │ │ 2880px                                │  │
│  └────────────┘ └───────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 断点处理

| 断点 | 处理方式 |
|------|---------|
| < 640px | 时间标签隐藏 (`hidden sm:inline-block`) |
| >= 640px | 完整显示 |

### 滚动行为

- **水平滚动**: 时间轴内容区
- **垂直滚动**: 整个页面
- **粘性定位**: Team Panel (左侧)、Timeline Header (顶部)

---

## 图标使用

### Lucide Icons

| 图标 | 组件 | 用途 |
|------|------|------|
| `Calendar` | Header | 日期选择器图标 |
| `Clock` | Header, Tooltip | 时间显示 |
| `Globe` | Header | 时区选择器图标 |
| `Star` | Timeline | 主班次标识 |
| `User` | Tooltip | 备份人员 |
| `Mail` | Tooltip | 邮箱 |
| `Phone` | Tooltip | 电话 |
| `MessageSquare` | Tooltip | Slack |

### 图标尺寸

| 用途 | Tailwind Class | 实际大小 |
|------|---------------|---------|
| 小图标 | `w-3 h-3` | 12px |
| 中图标 | `w-3.5 h-3.5` | 14px |
| 标准图标 | `w-4 h-4` | 16px |

---

## 空状态设计

### 无排班数据

使用 SVG 斜线背景图案表示空状态：

```css
.bg-[url('data:image/svg+xml;base64,...')]
.opacity-50
```

视觉效果：

```
┌────────────────────────────────────────────────┐
│╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱│
│╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱│
└────────────────────────────────────────────────┘
```

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

---

## 可访问性 (A11y)

### 当前实现

| 特性 | 状态 | 说明 |
|------|------|------|
| 语义化 HTML | ✓ | 使用原生 `<header>`, `<button>`, `<select>` |
| 键盘导航 | ✓ | 原生元素支持 Tab 导航 |
| ARIA 标签 | 部分 | Radix Vue 组件内置 |
| 颜色对比度 | ✓ | 文本与背景对比度符合 WCAG AA |
| 屏幕阅读器 | 部分 | 图片有 `alt` 属性 |

### 建议增强

1. 添加 `aria-label` 到图标按钮
2. 添加 `role="status"` 到加载/错误状态
3. 添加 `aria-live="polite"` 到动态内容区

---

## 动画规范

### 过渡效果

| 元素 | 过渡 | 时长 |
|------|------|------|
| 班次卡片悬停 | `transition-all` | 150ms (默认) |
| 团队行悬停 | `transition-colors` | 150ms |
| Tooltip | Radix Vue 内置 | 200ms (delay) |

### 避免的动画

- 无入场/退场动画（保持简洁）
- 无骨架屏（加载状态简单）

---

## Tailwind 配置

### 当前配置

```javascript
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 自定义扩展建议

```javascript
theme: {
  extend: {
    colors: {
      team: {
        orange: '#f97316',
        blue: '#3b82f6',
        green: '#10b981',
        purple: '#a855f7',
        red: '#ef4444',
      }
    },
    spacing: {
      'hour': '120px',
      'timeline': '2880px',
    }
  }
}
```
