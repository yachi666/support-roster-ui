<script setup>
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  days: { type: Array, required: true },
  groups: { type: Array, required: true },
  selectedCell: { type: Object, default: null },
  shiftCodeColorMap: { type: Object, default: () => ({}) },
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

function getShiftStyle(code) {
  const colorHex = props.shiftCodeColorMap[code]
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
</script>

<template>
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
                <div class="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-[10px] font-semibold text-slate-600">
                  {{ person.name.split(' ').map((part) => part[0]).join('') }}
                </div>
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
              <div
                v-if="code"
                :class="[
                  'flex min-h-[28px] w-full items-center justify-center rounded-[3px] border',
                  !getShiftStyle(code) && (colorMap[code] || 'border-slate-200 bg-white text-slate-700')
                ]"
                :style="getShiftStyle(code)"
              >
                {{ code }}
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
