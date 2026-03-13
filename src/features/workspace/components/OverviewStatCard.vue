<script setup>
import { AlertTriangle, CheckCircle2, Clock3 } from 'lucide-vue-next'

const props = defineProps({
  stat: { type: Object, required: true },
})

const iconMap = {
  good: CheckCircle2,
  warning: AlertTriangle,
  error: AlertTriangle,
  neutral: Clock3,
}

const toneMap = {
  good: 'text-emerald-500',
  warning: 'text-amber-500',
  error: 'text-rose-500',
  neutral: 'text-sky-500',
}

const progressToneMap = {
  good: 'bg-emerald-400',
  warning: 'bg-amber-400',
  error: 'bg-rose-400',
  neutral: 'bg-sky-400',
}
</script>

<template>
  <div class="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium text-slate-500">{{ stat.label }}</span>
      <component :is="iconMap[stat.status]" :class="['h-4 w-4', toneMap[stat.status]]" />
    </div>
    <div class="mt-3 text-3xl font-semibold text-slate-800">{{ stat.value }}</div>
    <div class="mt-1 text-xs text-slate-400">{{ stat.trend }}</div>
    <div class="absolute bottom-0 left-0 h-1 w-full bg-slate-100">
      <div :class="['h-full', progressToneMap[stat.status]]" :style="{ width: `${stat.progress}%` }"></div>
    </div>
  </div>
</template>
