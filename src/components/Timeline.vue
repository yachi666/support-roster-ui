<script setup>
import { ref, computed, onMounted, onUnmounted, useTemplateRef } from 'vue'
import { format, addHours, differenceInMinutes } from 'date-fns'
import { fromZonedTime } from 'date-fns-tz'
import { User, Mail, Phone, MessageSquare, Star, Clock } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { toIanaTimezone } from '@/lib/timezones'
import { hexToRgba } from '@/features/workspace/lib/color'
import {
  TooltipRoot,
  TooltipTrigger,
  TooltipPortal,
  TooltipContent,
  TooltipArrow,
  TooltipProvider,
} from 'radix-vue'

const props = defineProps({
  selectedDate: { type: Date, required: true },
  selectedTimezone: { type: String, required: true },
  teams: { type: Array, required: true },
  shifts: { type: Array, required: true },
})

const HOUR_COUNT = 24
const TEAM_COLUMN_WIDTH = 208
const MIN_HOUR_WIDTH = 28
const BLOCK_HEIGHT = 32
const BLOCK_GAP = 6
const ROW_PADDING = 12
const MIN_ROW_HEIGHT = 72

const now = ref(new Date())
const viewportWidth = ref(0)
const timelineViewportRef = useTemplateRef('timelineViewport')

let timer = null
let resizeObserver = null

function updateViewportWidth() {
  viewportWidth.value = timelineViewportRef.value?.clientWidth || 0
}

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 60000)

  updateViewportWidth()

  resizeObserver = new ResizeObserver(() => {
    updateViewportWidth()
  })

  if (timelineViewportRef.value) {
    resizeObserver.observe(timelineViewportRef.value)
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (resizeObserver) resizeObserver.disconnect()
})

const resolvedTimezone = computed(() => toIanaTimezone(props.selectedTimezone))
const minimumTimelineWidth = HOUR_COUNT * MIN_HOUR_WIDTH
const availableTimelineWidth = computed(() => Math.max(viewportWidth.value - TEAM_COLUMN_WIDTH, 0))
const timelineWidth = computed(() => {
  if (!availableTimelineWidth.value) {
    return minimumTimelineWidth
  }

  return Math.max(availableTimelineWidth.value, minimumTimelineWidth)
})
const hourWidth = computed(() => timelineWidth.value / HOUR_COUNT)
const canvasWidth = computed(() => timelineWidth.value + TEAM_COLUMN_WIDTH)
const hours = Array.from({ length: HOUR_COUNT }, (_, index) => index)

const viewWindow = computed(() => {
  const dateStr = format(props.selectedDate, 'yyyy-MM-dd')
  const start = fromZonedTime(`${dateStr} 00:00:00`, resolvedTimezone.value)
  const end = addHours(start, 24)
  return { start, end }
})

const layout = computed(() => {
  const teamLayouts = []

  props.teams.forEach((team) => {
    const teamShifts = props.shifts.filter((shift) => shift.teamId === team.id)
    const sorted = [...teamShifts].sort(
      (left, right) => new Date(left.start).getTime() - new Date(right.start).getTime(),
    )

    const lanes = []
    const layoutShifts = []

    sorted.forEach((shift) => {
      const shiftStart = new Date(shift.start)
      const shiftEnd = new Date(shift.end)

      if (shiftEnd <= viewWindow.value.start || shiftStart >= viewWindow.value.end) {
        return
      }

      const visibleStart = shiftStart < viewWindow.value.start ? viewWindow.value.start : shiftStart
      const visibleEnd = shiftEnd > viewWindow.value.end ? viewWindow.value.end : shiftEnd
      const startDiff = differenceInMinutes(visibleStart, viewWindow.value.start)
      const duration = differenceInMinutes(visibleEnd, visibleStart)
      const left = (startDiff / 60) * hourWidth.value
      const width = (duration / 60) * hourWidth.value

      let laneIndex = -1
      for (let index = 0; index < lanes.length; index += 1) {
        if (lanes[index] <= shiftStart) {
          laneIndex = index
          lanes[index] = shiftEnd
          break
        }
      }

      if (laneIndex === -1) {
        laneIndex = lanes.length
        lanes.push(shiftEnd)
      }

      layoutShifts.push({ shift, laneIndex, left, width })
    })

    const height = Math.max(
      MIN_ROW_HEIGHT,
      lanes.length * (BLOCK_HEIGHT + BLOCK_GAP) + ROW_PADDING * 2,
    )

    teamLayouts.push({ team, height, shifts: layoutShifts })
  })

  return teamLayouts
})

const currentTimeLeft = computed(() => {
  const diff = differenceInMinutes(now.value, viewWindow.value.start)

  if (diff < 0 || diff > 24 * 60) {
    return null
  }

  return (diff / 60) * hourWidth.value
})

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

const getTeamColorStyle = (color) => {
  if (!color) return null
  if (color.startsWith('#')) {
    return { backgroundColor: color }
  }
  return null
}

const getShiftBgClass = (teamColor) => {
  const colors = {
    blue: 'bg-blue-100 border-blue-200 text-blue-900 hover:bg-blue-200',
    green: 'bg-emerald-100 border-emerald-200 text-emerald-900 hover:bg-emerald-200',
    orange: 'bg-orange-100 border-orange-200 text-orange-900 hover:bg-orange-200',
    purple: 'bg-purple-100 border-purple-200 text-purple-900 hover:bg-purple-200',
    red: 'bg-red-100 border-red-200 text-red-900 hover:bg-red-200',
  }

  return colors[teamColor] || 'bg-gray-100 border-gray-200 text-gray-900 hover:bg-gray-200'
}

const getTeamShiftStyle = (teamColor) => {
  if (!teamColor || !teamColor.startsWith('#')) return null

  return {
    backgroundColor: hexToRgba(teamColor, 0.15),
    borderColor: hexToRgba(teamColor, 0.3),
    '--hover-bg': hexToRgba(teamColor, 0.25),
  }
}

const getShiftCustomStyle = (colorHex) => {
  if (!colorHex) return null

  return {
    backgroundColor: hexToRgba(colorHex, 0.15),
    borderColor: hexToRgba(colorHex, 0.3),
    '--hover-bg': hexToRgba(colorHex, 0.25),
  }
}

const getShiftRole = (shift) => shift.meaning || shift.code || 'Support'

const formatShiftTimeInZone = (iso) => {
  const date = new Date(iso)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: resolvedTimezone.value,
  })
}

const getShiftStyle = (layoutShift) => ({
  left: `${layoutShift.left}px`,
  width: `${Math.max(layoutShift.width, 4)}px`,
  top: `${ROW_PADDING + layoutShift.laneIndex * (BLOCK_HEIGHT + BLOCK_GAP)}px`,
  height: `${BLOCK_HEIGHT}px`,
})

const shouldShowShiftTime = (width) => width >= 88

const getTeamShiftCount = (teamId) => props.shifts.filter((shift) => shift.teamId === teamId).length
</script>

<template>
  <TooltipProvider :delay-duration="200">
    <div ref="timelineViewport" class="relative h-full overflow-y-auto overflow-x-auto bg-white">
      <div class="flex flex-col bg-white" :style="{ minWidth: `${canvasWidth}px` }">
        <div class="sticky top-0 z-30 flex h-12 border-b border-gray-200 bg-gray-50 shadow-sm">
          <div
            class="sticky left-0 z-40 flex items-center border-r border-gray-200 bg-gray-50 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 shadow-[1px_0_0_0_rgba(229,231,235,1)]"
            :style="{ width: `${TEAM_COLUMN_WIDTH}px` }"
          >
            Teams
          </div>

          <div class="relative flex bg-gray-50" :style="{ width: `${timelineWidth}px` }">
            <div
              v-for="hour in hours"
              :key="hour"
              class="flex-none select-none border-r border-gray-200/50 text-center font-mono text-[11px] leading-[48px] text-gray-400"
              :style="{ width: `${hourWidth}px` }"
            >
              {{ hour.toString().padStart(2, '0') }}
            </div>

            <div
              v-if="currentTimeLeft !== null"
              class="pointer-events-none absolute bottom-0 top-0 z-50 w-px bg-red-500"
              :style="{ left: `${currentTimeLeft}px` }"
            >
              <div
                class="-ml-[4.5px] h-0 w-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-red-500"
              ></div>
            </div>
          </div>
        </div>

        <div class="relative bg-white">
          <div
            class="pointer-events-none absolute inset-y-0 right-0 z-0 flex"
            :style="{ left: `${TEAM_COLUMN_WIDTH}px`, width: `${timelineWidth}px` }"
          >
            <div
              v-for="hour in hours"
              :key="`grid-${hour}`"
              class="h-full flex-none border-r border-dashed border-gray-100"
              :style="{ width: `${hourWidth}px` }"
            ></div>
          </div>

          <div
            v-if="currentTimeLeft !== null"
            class="pointer-events-none absolute bottom-0 top-0 z-20 w-px bg-red-500/50"
            :style="{ left: `${TEAM_COLUMN_WIDTH + currentTimeLeft}px` }"
          ></div>

          <div
            v-for="{ team, height, shifts } in layout"
            :key="team.id"
            class="group flex border-b border-gray-100 transition-colors hover:bg-gray-50/50"
          >
            <div
              class="sticky left-0 z-20 flex flex-col justify-center border-r border-gray-200 bg-white px-4 shadow-[1px_0_0_0_rgba(229,231,235,1)] transition-colors group-hover:bg-gray-50/50"
              :style="{ width: `${TEAM_COLUMN_WIDTH}px`, height: `${height}px` }"
            >
              <div class="flex items-center text-sm font-semibold text-gray-800">
                <span
                  :class="
                    cn(
                      'mr-2 h-2 w-2 rounded-full',
                      !team.color?.startsWith('#') && getTeamColorClass(team.color),
                    )
                  "
                  :style="getTeamColorStyle(team.color)"
                ></span>
                {{ team.name }}
              </div>
              <div class="mt-1 pl-4 text-xs text-gray-400">
                {{ getTeamShiftCount(team.id) }} active shifts
              </div>
            </div>

            <div
              class="relative flex-1 bg-white"
              :style="{ width: `${timelineWidth}px`, height: `${height}px` }"
            >
              <div v-if="shifts.length === 0" class="absolute inset-0 bg-white"></div>

              <TooltipRoot v-for="layoutShift in shifts" :key="layoutShift.shift.id">
                <TooltipTrigger as-child>
                  <div
                    :class="
                      cn(
                        'absolute z-10 flex cursor-pointer items-center justify-between overflow-hidden rounded-lg border px-2 shadow-sm transition-all select-none hover:z-20 hover:shadow-md',
                        !layoutShift.shift.colorHex &&
                          !team.color?.startsWith('#') &&
                          getShiftBgClass(team.color),
                      )
                    "
                    :style="{
                      ...getShiftStyle(layoutShift),
                      ...getShiftCustomStyle(layoutShift.shift.colorHex),
                      ...(!layoutShift.shift.colorHex && team.color?.startsWith('#')
                        ? getTeamShiftStyle(team.color)
                        : {}),
                    }"
                  >
                    <div class="flex min-w-0 items-center space-x-1.5">
                      <Star
                        v-if="layoutShift.shift.isPrimary"
                        class="h-2.5 w-2.5 flex-shrink-0 fill-current opacity-70"
                      />
                      <img
                        :src="layoutShift.shift.userAvatar"
                        alt=""
                        class="h-4 w-4 flex-shrink-0 rounded-full border border-white/30 bg-white/50 object-cover"
                      />
                      <span class="truncate text-xs font-semibold">{{
                        layoutShift.shift.userName
                      }}</span>
                    </div>

                    <span
                      v-if="shouldShowShiftTime(layoutShift.width)"
                      class="ml-2 hidden whitespace-nowrap text-xs font-mono opacity-80 sm:inline-block"
                    >
                      {{ formatShiftTimeInZone(layoutShift.shift.start) }} -
                      {{ formatShiftTimeInZone(layoutShift.shift.end) }}
                    </span>
                  </div>
                </TooltipTrigger>

                <TooltipPortal>
                  <TooltipContent
                    class="z-50 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-xl"
                    :side-offset="5"
                  >
                    <div class="mb-3 flex items-start justify-between">
                      <div class="flex items-center space-x-3">
                        <img
                          :src="layoutShift.shift.userAvatar"
                          class="h-10 w-10 rounded-full border border-gray-100 object-cover"
                        />
                        <div>
                          <div class="font-bold text-gray-900">
                            {{ layoutShift.shift.userName }}
                          </div>
                          <div class="mt-0.5 flex items-center text-xs text-gray-500">
                            {{
                              layoutShift.shift.isPrimary ? 'Primary On-call' : 'Secondary Support'
                            }}
                          </div>
                        </div>
                      </div>

                      <div
                        :class="
                          cn(
                            'rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
                            !layoutShift.shift.colorHex &&
                              !team.color?.startsWith('#') &&
                              getShiftBgClass(team.color),
                          )
                        "
                        :style="{
                          ...getShiftCustomStyle(layoutShift.shift.colorHex),
                          ...(!layoutShift.shift.colorHex && team.color?.startsWith('#')
                            ? getTeamShiftStyle(team.color)
                            : {}),
                        }"
                      >
                        {{ getShiftRole(layoutShift.shift) }}
                      </div>
                    </div>

                    <div class="space-y-2 text-sm text-gray-600">
                      <div class="flex items-center">
                        <Clock class="mr-2 h-3.5 w-3.5 text-gray-400" />
                        <span class="font-mono text-xs">
                          {{ formatShiftTimeInZone(layoutShift.shift.start) }} -
                          {{ formatShiftTimeInZone(layoutShift.shift.end) }}
                        </span>
                      </div>
                      <div class="my-2 h-px bg-gray-100"></div>
                      <div
                        class="flex cursor-pointer items-center transition-colors hover:text-gray-900"
                      >
                        <MessageSquare class="mr-2 h-3.5 w-3.5 text-gray-400" />
                        <span class="select-all">{{ layoutShift.shift.contact.slack }}</span>
                      </div>
                      <div
                        class="flex cursor-pointer items-center transition-colors hover:text-gray-900"
                      >
                        <Mail class="mr-2 h-3.5 w-3.5 text-gray-400" />
                        <span class="select-all">{{ layoutShift.shift.contact.email }}</span>
                      </div>
                      <div
                        class="flex cursor-pointer items-center transition-colors hover:text-gray-900"
                      >
                        <Phone class="mr-2 h-3.5 w-3.5 text-gray-400" />
                        <span class="select-all">{{ layoutShift.shift.contact.phone }}</span>
                      </div>
                    </div>

                    <div v-if="layoutShift.shift.backup" class="mt-3 border-t border-gray-100 pt-3">
                      <div class="mb-1 text-xs font-semibold text-gray-500">Backup</div>
                      <div class="flex items-center text-sm">
                        <User class="mr-2 h-3.5 w-3.5 text-gray-400" />
                        {{ layoutShift.shift.backup.name }}
                        <span class="ml-1 text-gray-400"
                          >({{ layoutShift.shift.backup.contact }})</span
                        >
                      </div>
                    </div>

                    <TooltipArrow class="fill-white" />
                  </TooltipContent>
                </TooltipPortal>
              </TooltipRoot>
            </div>
          </div>
        </div>
      </div>
    </div>
  </TooltipProvider>
</template>

<style scoped>
div[style*='--hover-bg']:hover {
  background-color: var(--hover-bg) !important;
}
</style>
