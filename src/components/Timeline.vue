<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { format, addHours, differenceInMinutes } from 'date-fns'
import { fromZonedTime } from 'date-fns-tz'
import { User, Mail, Phone, MessageSquare, Star, Clock } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
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

const HOUR_WIDTH = 120
const TOTAL_WIDTH = 24 * HOUR_WIDTH
const BLOCK_HEIGHT = 36
const BLOCK_GAP = 8
const ROW_PADDING = 16
const MIN_ROW_HEIGHT = 80

const now = ref(new Date())
let timer = null

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 60000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const viewWindow = computed(() => {
  const dateStr = format(props.selectedDate, 'yyyy-MM-dd')
  const start = fromZonedTime(dateStr + ' 00:00:00', props.selectedTimezone)
  const end = addHours(start, 24)
  return { start, end }
})

const layout = computed(() => {
  const teamLayouts = []

  props.teams.forEach((team) => {
    const teamShifts = props.shifts.filter((s) => s.teamId === team.id)

    const sorted = [...teamShifts].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    )

    const lanes = []
    const layoutShifts = []

    sorted.forEach((shift) => {
      const shiftStart = new Date(shift.start)
      const shiftEnd = new Date(shift.end)

      if (shiftEnd <= viewWindow.value.start || shiftStart >= viewWindow.value.end) return

      const visibleStart = shiftStart < viewWindow.value.start ? viewWindow.value.start : shiftStart
      const visibleEnd = shiftEnd > viewWindow.value.end ? viewWindow.value.end : shiftEnd

      const startDiff = differenceInMinutes(visibleStart, viewWindow.value.start)
      const duration = differenceInMinutes(visibleEnd, visibleStart)

      const left = (startDiff / 60) * HOUR_WIDTH
      const width = (duration / 60) * HOUR_WIDTH

      let laneIndex = -1
      for (let i = 0; i < lanes.length; i++) {
        if (lanes[i] <= shiftStart) {
          laneIndex = i
          lanes[i] = shiftEnd
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
  if (diff < 0 || diff > 24 * 60) return null
  return (diff / 60) * HOUR_WIDTH
})

const hours = Array.from({ length: 24 }, (_, i) => i)

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

const getShiftRole = (shift) => {
  return shift.meaning || shift.code || 'Support'
}

const formatShiftTime = (iso) => {
  return format(new Date(iso), 'HH:mm')
}

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

const getShiftStyle = (layoutShift) => ({
  left: `${layoutShift.left}px`,
  width: `${Math.max(layoutShift.width, 4)}px`,
  top: `${ROW_PADDING + layoutShift.laneIndex * (BLOCK_HEIGHT + BLOCK_GAP)}px`,
  height: `${BLOCK_HEIGHT}px`,
})

const getTeamShiftCount = (teamId) => {
  return props.shifts.filter((s) => s.teamId === teamId).length
}
</script>

<template>
  <TooltipProvider :delay-duration="200">
    <div class="h-full overflow-auto bg-white relative">
      <div class="min-w-max flex flex-col">
        <div class="sticky top-0 z-30 flex bg-gray-50 border-b border-gray-200 shadow-sm h-12">
          <div
            class="sticky left-0 z-40 w-60 bg-gray-50 border-r border-gray-200 flex items-center px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider shadow-[1px_0_0_0_rgba(229,231,235,1)]"
          >
            Teams
          </div>
          <div class="flex relative" :style="{ width: `${TOTAL_WIDTH}px` }">
            <div
              v-for="h in hours"
              :key="h"
              class="flex-none border-r border-gray-200/50 flex items-center px-2 text-xs font-mono text-gray-400 select-none"
              :style="{ width: `${HOUR_WIDTH}px` }"
            >
              {{ h.toString().padStart(2, '0') }}:00
            </div>

            <div
              v-if="currentTimeLeft !== null"
              class="absolute top-0 bottom-0 z-50 w-px bg-red-500 pointer-events-none"
              :style="{ left: `${currentTimeLeft}px` }"
            >
              <div
                class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-red-500 -ml-[4.5px]"
              ></div>
            </div>
          </div>
        </div>

        <div class="relative">
          <div
            class="absolute inset-0 pointer-events-none flex pl-60"
            :style="{ width: `${TOTAL_WIDTH + 240}px` }"
          >
            <div
              v-for="h in hours"
              :key="h"
              class="flex-none border-r border-dashed border-gray-100 h-full"
              :style="{ width: `${HOUR_WIDTH}px` }"
            ></div>
          </div>

          <div
            v-if="currentTimeLeft !== null"
            class="absolute top-0 bottom-0 w-px bg-red-500/50 z-20 pointer-events-none ml-60"
            :style="{ left: `${currentTimeLeft}px` }"
          ></div>

          <div
            v-for="{ team, height, shifts } in layout"
            :key="team.id"
            class="flex border-b border-gray-100 group hover:bg-gray-50/50 transition-colors"
          >
            <div
              class="sticky left-0 z-20 w-60 bg-white border-r border-gray-200 flex flex-col justify-center px-4 group-hover:bg-gray-50/50 transition-colors shadow-[1px_0_0_0_rgba(229,231,235,1)]"
              :style="{ height: `${height}px` }"
            >
              <div class="font-semibold text-gray-800 text-sm flex items-center">
                <span
                  :class="cn('w-2 h-2 rounded-full mr-2', getTeamColorClass(team.color))"
                ></span>
                {{ team.name }}
              </div>
              <div class="text-xs text-gray-400 mt-1 pl-4">
                {{ getTeamShiftCount(team.id) }} active shifts
              </div>
            </div>

            <div
              class="relative flex-1"
              :style="{ width: `${TOTAL_WIDTH}px`, height: `${height}px` }"
            >
              <div
                v-if="shifts.length === 0"
                class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBMODAgMCIgc3Ryb2tlPSIjRjNGNEY2IiBzdHJva2Utd2lkdGg9IjIiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-50"
              ></div>

              <TooltipRoot v-for="layoutShift in shifts" :key="layoutShift.shift.id">
                <TooltipTrigger as-child>
                  <div
                    :class="
                      cn(
                        'absolute rounded-lg border px-3 flex items-center justify-between overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all select-none z-10 hover:z-20',
                        getShiftBgClass(team.color),
                      )
                    "
                    :style="getShiftStyle(layoutShift)"
                  >
                    <div class="flex items-center space-x-2 min-w-0">
                      <Star
                        v-if="layoutShift.shift.isPrimary"
                        class="w-3 h-3 flex-shrink-0 fill-current opacity-70"
                      />
                      <img
                        :src="layoutShift.shift.userAvatar"
                        alt=""
                        class="w-5 h-5 rounded-full bg-white/50 flex-shrink-0 object-cover border border-white/30"
                      />
                      <span class="font-semibold text-xs truncate">{{
                        layoutShift.shift.userName
                      }}</span>
                    </div>

                    <span
                      v-if="layoutShift.width > 80"
                      class="text-xs font-mono opacity-80 whitespace-nowrap ml-2 hidden sm:inline-block"
                    >
                      {{ formatShiftTimeInZone(layoutShift.shift.start) }} -
                      {{ formatShiftTimeInZone(layoutShift.shift.end) }}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent
                    class="z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-72"
                    :side-offset="5"
                  >
                    <div class="flex items-start justify-between mb-3">
                      <div class="flex items-center space-x-3">
                        <img
                          :src="layoutShift.shift.userAvatar"
                          class="w-10 h-10 rounded-full object-cover border border-gray-100"
                        />
                        <div>
                          <div class="font-bold text-gray-900">
                            {{ layoutShift.shift.userName }}
                          </div>
                          <div class="text-xs text-gray-500 flex items-center mt-0.5">
                            {{
                              layoutShift.shift.isPrimary ? 'Primary On-call' : 'Secondary Support'
                            }}
                          </div>
                        </div>
                      </div>
                      <div
                        :class="
                          cn(
                            'text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide border',
                            getShiftBgClass(team.color),
                          )
                        "
                      >
                        {{ getShiftRole(layoutShift.shift) }}
                      </div>
                    </div>

                    <div class="space-y-2 text-sm text-gray-600">
                      <div class="flex items-center">
                        <Clock class="w-3.5 h-3.5 mr-2 text-gray-400" />
                        <span class="font-mono text-xs">
                          {{ formatShiftTimeInZone(layoutShift.shift.start) }} -
                          {{ formatShiftTimeInZone(layoutShift.shift.end) }}
                        </span>
                      </div>
                      <div class="h-px bg-gray-100 my-2"></div>
                      <div
                        class="flex items-center hover:text-gray-900 cursor-pointer transition-colors"
                      >
                        <MessageSquare class="w-3.5 h-3.5 mr-2 text-gray-400" />
                        <span class="select-all">{{ layoutShift.shift.contact.slack }}</span>
                      </div>
                      <div
                        class="flex items-center hover:text-gray-900 cursor-pointer transition-colors"
                      >
                        <Mail class="w-3.5 h-3.5 mr-2 text-gray-400" />
                        <span class="select-all">{{ layoutShift.shift.contact.email }}</span>
                      </div>
                      <div
                        class="flex items-center hover:text-gray-900 cursor-pointer transition-colors"
                      >
                        <Phone class="w-3.5 h-3.5 mr-2 text-gray-400" />
                        <span class="select-all">{{ layoutShift.shift.contact.phone }}</span>
                      </div>
                    </div>

                    <div v-if="layoutShift.shift.backup" class="mt-3 pt-3 border-t border-gray-100">
                      <div class="text-xs font-semibold text-gray-500 mb-1">Backup</div>
                      <div class="flex items-center text-sm">
                        <User class="w-3.5 h-3.5 mr-2 text-gray-400" />
                        {{ layoutShift.shift.backup.name }}
                        <span class="text-gray-400 ml-1"
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
