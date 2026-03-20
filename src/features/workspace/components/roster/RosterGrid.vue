<script setup>
import { computed } from 'vue'
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
  shiftCodeColorMap: { type: Object, default: () => ({}) },
  shiftDetailsByTeam: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['select-cell'])

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

const weekdayTone = computed(() => (day) => {
  return day.label === 'Su' || day.label === 'Sa' ? 'text-rose-500' : 'text-slate-700'
})

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

function getShiftStyle(teamId, code) {
  const colorHex = getShiftMeta(teamId, code)?.colorHex || props.shiftCodeColorMap[code]
  if (!colorHex) {
    return null
  }
  const bgColor = hexToRgba(colorHex, 0.15)
  const borderColor = hexToRgba(colorHex, 0.4)
  return {
    backgroundColor: bgColor,
    borderColor: borderColor,
    color: colorHex,
  }
}

function getShiftWindowLabel(teamId, code) {
  const detail = getShiftMeta(teamId, code)
  if (!detail) {
    return ''
  }

  return describeShiftWindow(detail.startTime, detail.endTime)
}

function getShiftCardStyle(teamId, code) {
  const colorHex = getShiftMeta(teamId, code)?.colorHex || props.shiftCodeColorMap[code]
  if (!colorHex) {
    return null
  }

  return {
    borderColor: hexToRgba(colorHex, 0.26),
    background: `linear-gradient(135deg, ${hexToRgba(colorHex, 0.14)} 0%, rgba(255, 255, 255, 0.98) 72%)`,
  }
}

function getShiftBadgeStyle(teamId, code) {
  const colorHex = getShiftMeta(teamId, code)?.colorHex || props.shiftCodeColorMap[code]
  if (!colorHex) {
    return null
  }

  return {
    backgroundColor: hexToRgba(colorHex, 0.14),
    borderColor: hexToRgba(colorHex, 0.24),
    color: colorHex,
  }
}
</script>

<template>
  <TooltipProvider :delay-duration="120">
    <div class="relative flex-1 overflow-auto bg-[#fcfcfd]">
      <table class="min-w-full w-max border-collapse text-left font-sans text-sm text-slate-700">
        <thead class="sticky top-0 z-20 bg-white shadow-[0_1px_0_0_#e2e8f0]">
          <tr>
            <th class="sticky left-0 z-30 min-w-[256px] w-64 border-b border-r border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 shadow-[1px_0_0_0_#e2e8f0]">
              Staff & Team
            </th>
            <th
              v-for="day in days"
              :key="day.value"
              class="min-w-[44px] w-[44px] border-b border-slate-200 px-1 py-2 text-center font-mono text-xs font-medium"
            >
              <div class="flex flex-col items-center">
                <span class="text-[10px] uppercase text-slate-400">{{ day.label }}</span>
                <span :class="['mt-0.5', weekdayTone(day)]">{{ day.value }}</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="group in groups" :key="group.team">
            <tr>
              <td colspan="32" class="sticky left-0 z-20 border-y border-slate-200 bg-slate-50/90 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-800 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
                {{ group.team }}
              </td>
            </tr>
            <tr v-for="person in group.staff" :key="person.id" class="group transition-colors hover:bg-slate-50/60">
              <td class="sticky left-0 z-20 border-b border-r border-slate-200 bg-white px-4 py-2.5 shadow-[1px_0_0_0_#e2e8f0] group-hover:bg-slate-50">
                <div class="flex items-center gap-3">
                  <AvatarImage
                    :name="person.name"
                    :src="person.avatar"
                    size-class="h-6 w-6"
                    fallback-class="border border-slate-200 bg-slate-100 text-[10px] font-semibold text-slate-600"
                  />
                  <div class="flex flex-col">
                    <button class="text-left text-sm font-medium text-slate-800 transition-colors hover:text-teal-600 hover:underline decoration-teal-300 underline-offset-2" @click="emit('select-cell', { staffId: person.id, day: 1 })">
                      {{ person.name }}
                    </button>
                    <span class="text-[10px] text-slate-400">{{ person.role }}</span>
                  </div>
                </div>
              </td>
              <td
                v-for="(code, index) in person.schedule"
                :key="`${person.id}-${index}`"
                :class="[
                  'relative cursor-cell border-b border-r border-slate-100 p-1 text-center font-mono text-[11px] transition-all',
                  isSelected(person.id, index + 1) ? 'z-10 bg-teal-50/60 ring-2 ring-inset ring-teal-500' : 'hover:bg-slate-100/80'
                ]"
                @click="emit('select-cell', { staffId: person.id, day: index + 1 })"
              >
                <TooltipRoot v-if="code">
                  <TooltipTrigger as-child>
                    <div
                      :class="[
                        'flex min-h-[28px] w-full items-center justify-center rounded-[3px] border outline-none transition-transform hover:-translate-y-0.5 focus-visible:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-teal-500/30',
                        !getShiftStyle(person.teamId, code) && (colorMap[code] || 'border-slate-200 bg-white text-slate-700')
                      ]"
                      :style="getShiftStyle(person.teamId, code)"
                      tabindex="0"
                    >
                      {{ code }}
                    </div>
                  </TooltipTrigger>

                  <TooltipPortal>
                    <TooltipContent
                      class="z-50 w-64 rounded-2xl border border-slate-200 bg-white/98 p-3.5 text-left shadow-[0_18px_50px_rgba(15,23,42,0.18)] backdrop-blur"
                      :style="getShiftCardStyle(person.teamId, code)"
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
                                :class="!getShiftBadgeStyle(person.teamId, code) && (colorMap[code] || 'border-slate-200 bg-slate-100 text-slate-700')"
                                :style="getShiftBadgeStyle(person.teamId, code)"
                              >
                                {{ code }}
                              </span>
                              <span v-if="getShiftMeta(person.teamId, code)?.primaryShift" class="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-600">
                                <Star class="h-3 w-3 fill-current" />
                                Primary
                              </span>
                            </div>
                            <p class="text-sm font-semibold leading-5 text-slate-900">
                              {{ getShiftMeta(person.teamId, code)?.meaning || 'Shift definition' }}
                            </p>
                          </div>
                        </div>

                        <div class="rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2.5">
                          <div class="flex items-start gap-2 text-slate-700">
                            <Clock3 class="mt-0.5 h-3.5 w-3.5 flex-none text-slate-400" />
                            <div>
                              <div class="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Time Window</div>
                              <div class="mt-1 font-mono text-[12px] leading-5 text-slate-800">
                                {{ getShiftWindowLabel(person.teamId, code) || 'Time range unavailable' }}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div class="flex items-center justify-between gap-3 rounded-xl border border-dashed border-slate-200 px-3 py-2 text-[11px] text-slate-600">
                          <div class="flex items-center gap-2">
                            <Globe2 class="h-3.5 w-3.5 text-slate-400" />
                            <span class="uppercase tracking-[0.14em] text-slate-400">Timezone</span>
                          </div>
                          <span class="font-semibold text-slate-800">
                            {{ getShiftMeta(person.teamId, code)?.timezone || 'N/A' }}
                          </span>
                        </div>
                      </div>

                      <TooltipArrow class="fill-white" />
                    </TooltipContent>
                  </TooltipPortal>
                </TooltipRoot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </TooltipProvider>
</template>
