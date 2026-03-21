# Timeline 模块规范

## 文档定位

本文件描述 `Timeline.vue` 的布局算法、泳道规则、tooltip 行为与视觉渲染方式，是 Viewer 分册中最偏实现的章节。

## 阅读提示

- 若先想理解整体关系，建议先读 `index.md` 与 `dashboard.md`。
- 本页适合保留算法、数据结构与渲染细节，不必承担模块导航职责。

## 模块概述

Timeline 是核心业务组件，负责将排班数据渲染为可视化时间轴。当前实现支持多团队并行显示、当前时间指示和班次时间重叠的泳道布局。

**文件位置**: `src/components/Timeline.vue`

### 实现状态 (Implemented vs Planned)

- **Implemented**: 桌面端自适应时间轴、24h 一屏展示、窄屏兜底横向滚动、重叠班次自动分泳道、Tooltip 详情。
- **Not Implemented**: 时间轴缩放、拖拽改班、冲突告警提示（仅做可视化重叠避让，不产生告警结果）。

---

## 组件接口

### Props

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `selectedDate` | `Date` | ✓ | 当前选中日期 |
| `selectedTimezone` | `string` | ✓ | 当前选中时区 |
| `teams` | `TeamDto[]` | ✓ | 团队列表 |
| `shifts` | `ShiftDto[]` | ✓ | 排班数据 |

---

## 布局常量

```javascript
const HOUR_COUNT = 24
const TEAM_COLUMN_WIDTH = 208
const MIN_HOUR_WIDTH = 28
const BLOCK_HEIGHT = 32
const BLOCK_GAP = 6
const ROW_PADDING = 12
const MIN_ROW_HEIGHT = 72
```

- 时间轴宽度不再写死为 2880px。
- 桌面端按容器宽度平均分配 24 个小时列。
- 当容器过窄且每小时宽度会小于 28px 时，退回横向滚动兜底。

---

## 核心算法

### 1. 可视窗口计算

将用户选择的日期和时区转换为 UTC 时间范围：

```javascript
const viewWindow = computed(() => {
  const dateStr = format(props.selectedDate, 'yyyy-MM-dd')
  const start = fromZonedTime(dateStr + ' 00:00:00', props.selectedTimezone)
  const end = addHours(start, 24)
  return { start, end }
})
```

### 2. 班次布局算法

**目标**: 识别时间重叠并自动分配到不同"泳道"避免遮挡。

> 该算法用于布局避让，不会产出“排班冲突告警”业务事件。

```
输入: 按 startTime 排序的班次列表
输出: 每个班次的 laneIndex、left、width

算法: 贪心泳道分配
─────────────────────────────────────────────────────
lanes = []  // 记录每个泳道的最后结束时间

for each shift in sorted_shifts:
    // 检查班次是否在可视窗口内
    if shift.end <= viewWindow.start OR shift.start >= viewWindow.end:
        skip
    
    // 计算可见部分
    visibleStart = max(shift.start, viewWindow.start)
    visibleEnd = min(shift.end, viewWindow.end)
    
    // 计算像素位置
    left = (visibleStart - viewWindow.start) / 1hour * hourWidth
    width = (visibleEnd - visibleStart) / 1hour * hourWidth
    
    // 寻找可用泳道
    laneIndex = -1
    for i, laneEndTime in lanes:
        if laneEndTime <= shift.start:
            laneIndex = i
            lanes[i] = shift.end
            break
    
    // 无可用泳道，创建新泳道
    if laneIndex == -1:
        laneIndex = lanes.length
        lanes.push(shift.end)
    
    emit { shift, laneIndex, left, width }
```

**示例**:

```
时间轴: 00:00 ─────────────────────────────── 24:00

Team L1:
  Lane 0: [=== Mike 08:00-17:00 ===]
  Lane 1:     [=== Emily 10:00-19:00 ===]
  Lane 2:                 [=== David 16:00-24:00 ===]

重叠处理:
  Mike (08:00-17:00) vs Emily (10:00-19:00) → 重叠 → 不同泳道
  Mike (08:00-17:00) vs David (16:00-24:00) → 重叠 → 不同泳道
  Emily (10:00-19:00) vs David (16:00-24:00) → 重叠 → 不同泳道
```

### 3. 当前时间指示器

```javascript
const currentTimeLeft = computed(() => {
  const diff = differenceInMinutes(now.value, viewWindow.value.start)
  if (diff < 0 || diff > 24 * 60) return null  // 不在当前视图
  return (diff / 60) * hourWidth
})
```

---

## 数据结构

### Layout 计算结果

```typescript
interface TeamLayout {
  team: TeamDto
  height: number          // 行高 (动态计算)
  shifts: LayoutShift[]   // 该团队的班次布局
}

interface LayoutShift {
  shift: ShiftDto         // 原始班次数据
  laneIndex: number       // 泳道索引
  left: number            // 左偏移 (px)
  width: number           // 宽度 (px)
}
```

### Layout 计算代码

```javascript
const layout = computed(() => {
  const teamLayouts = []

  props.teams.forEach((team) => {
    const teamShifts = props.shifts.filter((s) => s.teamId === team.id)
    const sorted = [...teamShifts].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    )

    const lanes = []
    const layoutShifts = []

    sorted.forEach((shift) => {
      // ... 布局算法 (见上文)
    })

    const height = Math.max(
      MIN_ROW_HEIGHT,
      lanes.length * (BLOCK_HEIGHT + BLOCK_GAP) + ROW_PADDING * 2
    )

    teamLayouts.push({ team, height, shifts: layoutShifts })
  })

  return teamLayouts
})
```

---

## 渲染结构

### 模板层级

```vue
<TooltipProvider>
  <div class="h-full overflow-y-auto overflow-x-auto bg-white relative">
    <div class="flex flex-col" :style="{ minWidth: canvasWidth }">
      
      <!-- 时间轴表头 (sticky) -->
      <div class="sticky top-0 z-30 flex bg-gray-50 border-b">
        <!-- Team 列标题 -->
        <div class="sticky left-0" :style="{ width: TEAM_COLUMN_WIDTH }">Teams</div>
        
        <!-- 小时刻度 -->
        <div class="flex" :style="{ width: timelineWidth }">
          <div v-for="h in 24" :style="{ width: hourWidth }">{{ h }}</div>
          
          <!-- 当前时间指示器 -->
          <div v-if="currentTimeLeft" :style="{ left: currentTimeLeft }" />
        </div>
      </div>
      
      <!-- 内容区 -->
      <div class="relative">
        <!-- 垂直网格线 -->
        <div class="absolute inset-0 pointer-events-none">
          <div v-for="h in 24" class="border-r border-dashed" />
        </div>
        
        <!-- 当前时间垂直线 -->
        <div v-if="currentTimeLeft" class="absolute bg-red-500/50" />
        
        <!-- 团队行 -->
        <div v-for="{ team, height, shifts } in layout" class="flex border-b">
          <!-- Team 信息 (sticky) -->
          <div class="sticky left-0 w-60" :style="{ height }">
            <span :class="teamColor" />
            {{ team.name }}
            <span>{{ shifts.length }} active shifts</span>
          </div>
          
          <!-- 班次卡片区 -->
          <div class="relative" :style="{ width: timelineWidth, height }">
            <!-- 空状态背景 -->
            <div v-if="shifts.length === 0" class="diagonal-pattern" />
            
            <!-- 班次卡片 -->
            <TooltipRoot v-for="layoutShift in shifts">
              <TooltipTrigger>
                <div class="shift-card" :style="getShiftStyle(layoutShift)">
                  <Star v-if="isPrimary" />
                  <img :src="avatar" />
                  <span>{{ userName }}</span>
                  <span v-if="width > 80">{{ time }}</span>
                </div>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent>
                  <!-- 详情浮层 -->
                </TooltipContent>
              </TooltipPortal>
            </TooltipRoot>
          </div>
        </div>
      </div>
    </div>
  </div>
</TooltipProvider>
```

---

## 样式函数

### 团队颜色

```javascript
const getTeamColorClass = (color) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
  }
  return colors[color] || 'bg-gray-500'
}
```

### 班次卡片样式

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

### 卡片位置样式

```javascript
const getShiftStyle = (layoutShift) => ({
  left: `${layoutShift.left}px`,
  width: `${Math.max(layoutShift.width, 4)}px`,  // 最小宽度 4px
  top: `${ROW_PADDING + layoutShift.laneIndex * (BLOCK_HEIGHT + BLOCK_GAP)}px`,
  height: `${BLOCK_HEIGHT}px`,
})
```

---

## 时间格式化

### 本地时间格式化

```javascript
const formatShiftTimeInZone = (iso) => {
  const date = new Date(iso)
  const options = { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false,
    timeZone: props.selectedTimezone 
  }
  return date.toLocaleTimeString('en-US', options)
}
```

### 简单格式化 (无时区转换)

```javascript
const formatShiftTime = (iso) => {
  return format(new Date(iso), 'HH:mm')
}
```

---

## Tooltip 内容

### 结构

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

### 条件渲染

```vue
<!-- 主/次标识 -->
<div class="text-xs">
  {{ layoutShift.shift.isPrimary ? 'Primary On-call' : 'Secondary Support' }}
</div>

<!-- 备份人员 (可选) -->
<div v-if="layoutShift.shift.backup">
  <div class="text-xs font-semibold">Backup</div>
  <div>{{ backup.name }} ({{ backup.contact }})</div>
</div>
```

---

## 依赖

### 外部库

| 库 | 用途 |
|------|------|
| `date-fns` | 日期计算 (`format`, `addHours`, `differenceInMinutes`) |
| `date-fns-tz` | 时区转换 (`fromZonedTime`) |
| `lucide-vue-next` | 图标 (`User`, `Mail`, `Phone`, `MessageSquare`, `Star`, `Clock`) |
| `radix-vue` | Tooltip 组件 |

---

## 性能优化

### 计算属性缓存

所有布局计算使用 `computed`，仅在依赖变化时重新计算：

```javascript
const layout = computed(() => { /* ... */ })
const currentTimeLeft = computed(() => { /* ... */ })
```

### 定时器频率

```javascript
timer = setInterval(() => {
  now.value = new Date()
}, 60000)  // 每分钟更新，而非每秒
```

### 最小卡片宽度

```javascript
width: `${Math.max(layoutShift.width, 4)}px`
```

避免极短班次卡片不可见。

---

## 边界情况处理

### 跨日班次

班次可能跨越日期边界（如夜班 22:00-06:00），后端已处理为 `end > start`。

### 时区边界

用户选择不同时区时，同一班次可能出现在不同日期的视图中：

```javascript
if (shiftEnd <= viewWindow.start || shiftStart >= viewWindow.end) return
```

### 空数据

```vue
<div v-if="shifts.length === 0" class="diagonal-pattern" />
```

使用白底上的轻斜线图案表示无排班，避免透明画布在不同浏览器或截图环境中露出灰底。

---

## 改进建议

### 虚拟滚动

对于大量团队（> 20），建议实现虚拟滚动：

```javascript
import { useVirtualizer } from '@tanstack/vue-virtual'

const virtualizer = useVirtualizer({
  count: layout.value.length,
  getScrollElement: () => scrollRef.value,
  estimateSize: (index) => layout.value[index].height,
})
```

### 缩放控制

添加时间轴缩放功能：

```javascript
const zoomLevel = ref(1)  // 0.5x, 1x, 2x
const HOUR_WIDTH = computed(() => 120 * zoomLevel.value)
```

### 拖拽调整

允许拖拽调整班次时间（需后端支持写入）。

### 打印优化

添加 `@media print` 样式，优化打印输出。
