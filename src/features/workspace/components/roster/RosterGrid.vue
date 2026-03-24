<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Clock3, Globe2, Star } from 'lucide-vue-next'
import {
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from 'radix-vue'
import AvatarImage from '../AvatarImage.vue'
import { cn } from '@/lib/utils'
import { describeShiftWindow } from '../../lib/shiftTime'

const props = defineProps({
  days: { type: Array, required: true },
  groups: { type: Array, required: true },
  selectedCell: { type: Object, default: null },
  selectedRange: { type: Object, default: null },
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  shiftCodeColorMap: { type: Object, default: () => ({}) },
  shiftDetailsByTeam: { type: Object, default: () => ({}) },
  pendingUpdateKeySet: { type: Object, default: () => new Set() },
})

const emit = defineEmits(['select-cell', 'select-range', 'navigate-cell', 'open-selected-cell'])
const { t } = useI18n()

const GROUP_ROW_HEIGHT = 38
const STAFF_ROW_HEIGHT = 46
const OVERSCAN_HEIGHT = 240

const colorMap = {
  OC: 'border-amber-200 bg-amber-100 text-amber-800',
  DS: 'border-sky-200 bg-sky-50 text-sky-700',
  NS: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  A: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  B: 'border-teal-200 bg-teal-50 text-teal-700',
  D: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  HoL: 'border-rose-200 bg-rose-50 text-rose-700',
}

function isSelected(staffId, day) {
  return props.selectedCell?.staffId === staffId && props.selectedCell?.day === day
}

function isSelectedStaff(staffId) {
  return props.selectedCell?.staffId === staffId
}

function isPendingUpdate(staffId, day) {
  return props.pendingUpdateKeySet.has(`${staffId}:${day}`)
}

function isRangeSelected(staffId, day) {
  if (!props.selectedRange || props.selectedRange.staffId !== staffId) {
    return false
  }

  return day >= props.selectedRange.startDay && day <= props.selectedRange.endDay
}

const pointerState = ref({
  active: false,
  staffId: null,
  startDay: null,
  currentDay: null,
  dragged: false,
})

function emitRangeSelection(staffId, startDay, endDay, openEditor = false) {
  const normalizedStartDay = Math.min(startDay, endDay)
  const normalizedEndDay = Math.max(startDay, endDay)

  emit('select-range', {
    staffId,
    startDay: normalizedStartDay,
    endDay: normalizedEndDay,
    openEditor,
  })
}

function startPointerSelection(staffId, day) {
  pointerState.value = {
    active: true,
    staffId,
    startDay: day,
    currentDay: day,
    dragged: false,
  }

  emit('select-cell', { staffId, day })
}

function updatePointerSelection(staffId, day) {
  if (!pointerState.value.active || pointerState.value.staffId !== staffId) {
    return
  }

  if (pointerState.value.currentDay !== day) {
    pointerState.value.dragged = true
    pointerState.value.currentDay = day
    emitRangeSelection(staffId, pointerState.value.startDay, day, false)
  }
}

function clearPointerState() {
  pointerState.value = {
    active: false,
    staffId: null,
    startDay: null,
    currentDay: null,
    dragged: false,
  }
}

function finishPointerSelection(staffId, day) {
  if (!pointerState.value.active || pointerState.value.staffId !== staffId) {
    return
  }

  const didDrag = pointerState.value.dragged
  const startDay = pointerState.value.startDay
  const endDay = pointerState.value.currentDay ?? day

  if (didDrag) {
    emitRangeSelection(staffId, startDay, endDay, true)
  } else {
    emit('open-selected-cell', { staffId, day })
  }

  clearPointerState()
}

function handleWindowMouseup() {
  if (!pointerState.value.active) {
    return
  }

  if (pointerState.value.dragged && pointerState.value.staffId && pointerState.value.startDay && pointerState.value.currentDay) {
    finishPointerSelection(pointerState.value.staffId, pointerState.value.currentDay)
    return
  }

  clearPointerState()
}

function handleCellKeydown(event, staffId, day) {
  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault()
      emit('navigate-cell', { rowDelta: 0, dayDelta: -1, staffId, day })
      break
    case 'ArrowRight':
      event.preventDefault()
      emit('navigate-cell', { rowDelta: 0, dayDelta: 1, staffId, day })
      break
    case 'ArrowUp':
      event.preventDefault()
      emit('navigate-cell', { rowDelta: -1, dayDelta: 0, staffId, day })
      break
    case 'ArrowDown':
      event.preventDefault()
      emit('navigate-cell', { rowDelta: 1, dayDelta: 0, staffId, day })
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      emit('open-selected-cell', { staffId, day })
      break
    default:
      break
  }
}

const weekdayTone = computed(() => (day) => {
  return day.label === 'Su' || day.label === 'Sa' ? 'text-rose-500' : 'text-slate-700'
})

const todayParts = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'UTC',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).formatToParts(new Date())

const todayYear = Number(todayParts.find((part) => part.type === 'year')?.value)
const todayMonth = Number(todayParts.find((part) => part.type === 'month')?.value)
const todayDay = Number(todayParts.find((part) => part.type === 'day')?.value)

function isToday(day) {
  return props.year === todayYear && props.month === todayMonth && day.value === todayDay
}

function isWeekend(day) {
  return day.label === 'Su' || day.label === 'Sa'
}

function hexToRgba(hex, alpha = 1) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return null
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function getShiftMeta(teamId, code) {
  if (!code) {
    return null
  }

  const teamDetails = props.shiftDetailsByTeam?.[String(teamId)] || props.shiftDetailsByTeam?.[teamId] || {}
  return teamDetails?.[code] || null
}

const fallbackShiftPresentationByCode = computed(() => {
  return Object.fromEntries(
    Object.entries(props.shiftCodeColorMap || {}).map(([code, colorHex]) => [
      code,
      {
        meta: null,
        cellStyle: {
          backgroundColor: hexToRgba(colorHex, 0.15),
          borderColor: hexToRgba(colorHex, 0.4),
          color: colorHex,
        },
        cardStyle: {
          borderColor: hexToRgba(colorHex, 0.26),
          background: `linear-gradient(135deg, ${hexToRgba(colorHex, 0.14)} 0%, rgba(255, 255, 255, 0.98) 72%)`,
        },
        badgeStyle: {
          backgroundColor: hexToRgba(colorHex, 0.14),
          borderColor: hexToRgba(colorHex, 0.24),
          color: colorHex,
        },
        windowLabel: '',
      },
    ]),
  )
})

const shiftPresentationByTeam = computed(() => {
  const byTeam = {}

  for (const [teamId, teamDetails] of Object.entries(props.shiftDetailsByTeam || {})) {
    byTeam[teamId] = Object.fromEntries(
      Object.entries(teamDetails || {}).map(([code, detail]) => {
        const colorHex = detail?.colorHex || props.shiftCodeColorMap[code]
        return [
          code,
          {
            meta: detail,
            cellStyle: colorHex ? {
              backgroundColor: hexToRgba(colorHex, 0.15),
              borderColor: hexToRgba(colorHex, 0.4),
              color: colorHex,
            } : null,
            cardStyle: colorHex ? {
              borderColor: hexToRgba(colorHex, 0.26),
              background: `linear-gradient(135deg, ${hexToRgba(colorHex, 0.14)} 0%, rgba(255, 255, 255, 0.98) 72%)`,
            } : null,
            badgeStyle: colorHex ? {
              backgroundColor: hexToRgba(colorHex, 0.14),
              borderColor: hexToRgba(colorHex, 0.24),
              color: colorHex,
            } : null,
            windowLabel: describeShiftWindow(detail.startTime, detail.endTime),
          },
        ]
      }),
    )
  }

  return byTeam
})

function getShiftPresentation(teamId, code) {
  if (!code) {
    return null
  }

  const normalizedTeamId = String(teamId)
  return shiftPresentationByTeam.value?.[normalizedTeamId]?.[code] || fallbackShiftPresentationByCode.value?.[code] || null
}

function getShiftStyle(teamId, code) {
  return getShiftPresentation(teamId, code)?.cellStyle || null
}

function getShiftWindowLabel(teamId, code) {
  return getShiftPresentation(teamId, code)?.windowLabel || ''
}

function getShiftCardStyle(teamId, code) {
  return getShiftPresentation(teamId, code)?.cardStyle || null
}

function getShiftBadgeStyle(teamId, code) {
  return getShiftPresentation(teamId, code)?.badgeStyle || null
}

const scrollContainer = ref(null)
const scrollTop = ref(0)
const viewportHeight = ref(720)
let resizeObserver = null

const flattenedRows = computed(() => {
  const rows = []

  props.groups.forEach((group) => {
    rows.push({
      type: 'group',
      key: `group-${group.teamId || group.team}`,
      group,
      start: 0,
      end: 0,
    })

    group.staff.forEach((person) => {
      rows.push({
        type: 'staff',
        key: `staff-${person.id}`,
        group,
        person,
        start: 0,
        end: 0,
      })
    })
  })

  let offset = 0
  return rows.map((row) => {
    const height = row.type === 'group' ? GROUP_ROW_HEIGHT : STAFF_ROW_HEIGHT
    const nextRow = {
      ...row,
      start: offset,
      end: offset + height,
    }
    offset += height
    return nextRow
  })
})

const totalContentHeight = computed(() => flattenedRows.value.at(-1)?.end || 0)
const colspanCount = computed(() => props.days.length + 1)

function findRowIndex(offset) {
  const rows = flattenedRows.value
  if (!rows.length) {
    return 0
  }

  let low = 0
  let high = rows.length - 1

  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    if (rows[mid].end < offset) {
      low = mid + 1
    } else {
      high = mid
    }
  }

  return low
}

const visibleWindow = computed(() => {
  const rows = flattenedRows.value
  if (!rows.length) {
    return {
      rows: [],
      topPadding: 0,
      bottomPadding: 0,
    }
  }

  const viewportStart = Math.max(scrollTop.value - OVERSCAN_HEIGHT, 0)
  const viewportEnd = scrollTop.value + viewportHeight.value + OVERSCAN_HEIGHT
  const startIndex = findRowIndex(viewportStart)
  const endIndex = Math.min(findRowIndex(viewportEnd) + 1, rows.length - 1)
  const topPadding = rows[startIndex]?.start || 0
  const bottomPadding = Math.max(totalContentHeight.value - (rows[endIndex]?.end || 0), 0)

  return {
    rows: rows.slice(startIndex, endIndex + 1),
    topPadding,
    bottomPadding,
  }
})

function syncViewportMetrics() {
  viewportHeight.value = scrollContainer.value?.clientHeight || 720
}

function handleScroll(event) {
  scrollTop.value = event.target.scrollTop
}

if (typeof window !== 'undefined') {
  window.addEventListener('mouseup', handleWindowMouseup)
}

onMounted(() => {
  syncViewportMetrics()

  if (typeof ResizeObserver !== 'undefined' && scrollContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      syncViewportMetrics()
    })
    resizeObserver.observe(scrollContainer.value)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('mouseup', handleWindowMouseup)
  }

  resizeObserver?.disconnect()
})
</script>

<template>
  <TooltipProvider :delay-duration="120">
    <div ref="scrollContainer" class="relative flex-1 overflow-auto bg-[#fcfcfd]" @scroll="handleScroll">
      <table class="min-w-full w-max border-collapse text-left font-sans text-sm text-slate-700">
        <thead class="sticky top-0 z-20 bg-white shadow-[0_1px_0_0_#e2e8f0]">
          <tr>
            <th class="sticky left-0 z-30 min-w-[256px] w-64 border-b border-r border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 shadow-[1px_0_0_0_#e2e8f0]">
              {{ t('workspace.grid.staffAndTeam') }}
            </th>
            <th
              v-for="day in days"
              :key="day.value"
              :class="[
                'min-w-[44px] w-[44px] border-b border-slate-200 px-1 py-2 text-center font-mono text-xs font-medium',
                isWeekend(day) ? 'bg-rose-50/60' : '',
                isToday(day) ? 'bg-teal-50/80' : '',
              ]"
            >
              <div class="flex flex-col items-center">
                <span class="text-[10px] uppercase text-slate-400">{{ day.label }}</span>
                <span :class="['mt-0.5', weekdayTone(day), isToday(day) ? 'font-bold text-teal-700' : '']">{{ day.value }}</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="visibleWindow.topPadding > 0" aria-hidden="true">
            <td :colspan="colspanCount" class="border-0 p-0" :style="{ height: `${visibleWindow.topPadding}px` }"></td>
          </tr>
          <template v-for="row in visibleWindow.rows" :key="row.key">
            <tr v-if="row.type === 'group'">
              <td :colspan="colspanCount" class="sticky left-0 z-20 border-y border-slate-200 bg-slate-50/90 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-800 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
                {{ row.group.team }}
              </td>
            </tr>
            <tr v-else class="group transition-colors hover:bg-slate-50/60">
              <td :class="[
                 'sticky left-0 z-20 border-b border-r border-slate-200 bg-white px-4 py-2.5 shadow-[1px_0_0_0_#e2e8f0] group-hover:bg-slate-50',
                 isSelectedStaff(row.person.id) ? 'bg-teal-50/40 group-hover:bg-teal-50/60' : '',
               ]">
                 <div class="flex items-center gap-3">
                   <AvatarImage
                     :name="row.person.name"
                     :src="row.person.avatar"
                     size-class="h-6 w-6"
                     fallback-class="border border-slate-200 bg-slate-100 text-[10px] font-semibold text-slate-600"
                   />
                   <div class="flex flex-col">
                     <span class="text-sm font-medium text-slate-800">{{ row.person.name }}</span>
                     <span class="text-[10px] text-slate-400">{{ row.person.role }}</span>
                   </div>
                 </div>
               </td>
               <td
                 v-for="(code, index) in row.person.schedule"
                 :key="`${row.person.id}-${index}`"
                 :class="[
                   'relative cursor-cell border-b border-r border-slate-100 p-1 text-center font-mono text-[11px] outline-none transition-all focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500',
                   isWeekend(days[index]) ? 'bg-rose-50/20' : '',
                   isSelected(row.person.id, index + 1) ? 'z-10 bg-teal-50/60 ring-2 ring-inset ring-teal-500' : 'hover:bg-slate-100/80',
                   isRangeSelected(row.person.id, index + 1) ? 'bg-sky-50/70 ring-1 ring-inset ring-sky-300' : '',
                   isPendingUpdate(row.person.id, index + 1) ? 'bg-amber-50/70 ring-1 ring-inset ring-amber-300' : '',
                 ]"
                 :tabindex="0"
                  :aria-label="t('workspace.grid.rosterCell', { name: row.person.name, day: index + 1 })"
                 @focus="emit('select-cell', { staffId: row.person.id, day: index + 1 })"
                 @keydown="handleCellKeydown($event, row.person.id, index + 1)"
                 @mousedown.prevent="startPointerSelection(row.person.id, index + 1)"
                 @mouseenter="updatePointerSelection(row.person.id, index + 1)"
                 @mouseup.prevent="finishPointerSelection(row.person.id, index + 1)"
               >
                 <span
                   v-if="isPendingUpdate(row.person.id, index + 1)"
                   class="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-500"
                 ></span>
                 <TooltipRoot v-if="code">
                  <TooltipTrigger as-child>
                    <div
                       :class="[
                         'flex min-h-[28px] w-full items-center justify-center rounded-[3px] border outline-none transition-transform hover:-translate-y-0.5 focus-visible:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-teal-500/30',
                         !getShiftStyle(row.person.teamId, code) && (colorMap[code] || 'border-slate-200 bg-white text-slate-700')
                       ]"
                       :style="getShiftStyle(row.person.teamId, code)"
                     >
                       {{ code }}
                     </div>
                  </TooltipTrigger>

                  <TooltipPortal>
                     <TooltipContent
                       class="z-50 w-64 rounded-2xl border border-slate-200 bg-white/98 p-3.5 text-left shadow-[0_18px_50px_rgba(15,23,42,0.18)] backdrop-blur"
                       :style="getShiftCardStyle(row.person.teamId, code)"
                       side="top"
                       align="center"
                       :side-offset="8"
                    >
                      <div class="space-y-3">
                        <div class="flex items-start justify-between gap-3">
                          <div class="space-y-1">
                            <div class="flex items-center gap-2">
                               <span
                                 class="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]"
                                 :class="!getShiftBadgeStyle(row.person.teamId, code) && (colorMap[code] || 'border-slate-200 bg-slate-100 text-slate-700')"
                                 :style="getShiftBadgeStyle(row.person.teamId, code)"
                               >
                                 {{ code }}
                               </span>
                               <span v-if="getShiftMeta(row.person.teamId, code)?.primaryShift" class="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-600">
                                 <Star class="h-3 w-3 fill-current" />
                                  {{ t('workspace.grid.primary') }}
                               </span>
                             </div>
                             <p class="text-sm font-semibold leading-5 text-slate-900">
                                {{ getShiftMeta(row.person.teamId, code)?.meaning || t('workspace.grid.shiftDefinition') }}
                             </p>
                           </div>
                        </div>

                        <div class="rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2.5">
                          <div class="flex items-start gap-2 text-slate-700">
                            <Clock3 class="mt-0.5 h-3.5 w-3.5 flex-none text-slate-400" />
                            <div>
                               <div class="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{{ t('workspace.grid.timeWindow') }}</div>
                              <div class="mt-1 font-mono text-[12px] leading-5 text-slate-800">
                                  {{ getShiftWindowLabel(row.person.teamId, code) || t('workspace.grid.timeUnavailable') }}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div class="flex items-center justify-between gap-3 rounded-xl border border-dashed border-slate-200 px-3 py-2 text-[11px] text-slate-600">
                          <div class="flex items-center gap-2">
                            <Globe2 class="h-3.5 w-3.5 text-slate-400" />
                             <span class="uppercase tracking-[0.14em] text-slate-400">{{ t('workspace.grid.timezone') }}</span>
                          </div>
                          <span class="font-semibold text-slate-800">
                              {{ getShiftMeta(row.person.teamId, code)?.timezone || t('workspace.grid.notAvailable') }}
                           </span>
                         </div>
                       </div>

                    <TooltipArrow class="fill-white" />
                  </TooltipContent>
                </TooltipPortal>
              </TooltipRoot>
                 <div
                   v-else
                   :class="[
                     'flex min-h-[28px] w-full items-center justify-center rounded-[3px] border border-dashed text-slate-300 transition-colors',
                     isPendingUpdate(row.person.id, index + 1) ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-200/80',
                   ]"
                 >
                    {{ isPendingUpdate(row.person.id, index + 1) ? t('workspace.grid.clear') : '' }}
                  </div>
               </td>
            </tr>
          </template>
          <tr v-if="visibleWindow.bottomPadding > 0" aria-hidden="true">
            <td :colspan="colspanCount" class="border-0 p-0" :style="{ height: `${visibleWindow.bottomPadding}px` }"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </TooltipProvider>
</template>
