<script setup>
import { computed } from 'vue'
import { AlertTriangle, CheckCircle2, Clock3, TrendingUp } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  stat: { type: Object, required: true },
})
const { t } = useI18n()

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
  good: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
  warning: 'bg-gradient-to-r from-amber-400 to-amber-500',
  error: 'bg-gradient-to-r from-rose-400 to-rose-500',
  neutral: 'bg-gradient-to-r from-sky-400 to-sky-500',
}

const badgeToneMap = {
  good: 'border-emerald-200/60 bg-emerald-50/80 text-emerald-700',
  warning: 'border-amber-200/60 bg-amber-50/80 text-amber-700',
  error: 'border-rose-200/60 bg-rose-50/80 text-rose-700',
  neutral: 'border-sky-200/60 bg-sky-50/80 text-sky-700',
}

const cardToneMap = {
  good: 'border-emerald-100/50 bg-gradient-to-br from-emerald-50/30 via-white to-emerald-50/10',
  warning: 'border-amber-100/50 bg-gradient-to-br from-amber-50/30 via-white to-amber-50/10',
  error: 'border-rose-100/50 bg-gradient-to-br from-rose-50/30 via-white to-rose-50/10',
  neutral: 'border-sky-100/50 bg-gradient-to-br from-sky-50/30 via-white to-sky-50/10',
}

const accentMap = {
  good: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
  warning: 'bg-gradient-to-r from-amber-400 to-amber-500',
  error: 'bg-gradient-to-r from-rose-400 to-rose-500',
  neutral: 'bg-gradient-to-r from-sky-400 to-sky-500',
}

const statusLabelMap = computed(() => ({
  good: t('workspace.overview.status.healthy'),
  warning: t('workspace.overview.status.needsAttention'),
  error: t('workspace.overview.status.critical'),
  neutral: t('workspace.overview.status.tracking'),
}))

const normalizedStatus = computed(() => {
  return iconMap[props.stat?.status] ? props.stat.status : 'neutral'
})

const progressValue = computed(() => {
  const numericProgress = Number(props.stat?.progress ?? 0)
  return Math.min(100, Math.max(0, Number.isFinite(numericProgress) ? numericProgress : 0))
})
</script>

<template>
  <div
    :class="[
      'group relative overflow-hidden rounded-3xl border p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-in-up',
      cardToneMap[normalizedStatus],
    ]"
  >
    <div :class="['absolute inset-x-0 top-0 h-1.5', accentMap[normalizedStatus]]"></div>
    
    <div class="absolute inset-x-0 top-6 h-px bg-gradient-to-r from-transparent via-slate-200/30 to-transparent"></div>

    <div class="flex items-start justify-between gap-4">
      <div class="flex-1">
        <div class="text-xs font-semibold uppercase tracking-widest text-slate-500">
          {{ stat.label }}
        </div>
        <div class="mt-4 text-4xl font-bold tracking-tight text-slate-900">
          {{ stat.value }}
        </div>
      </div>
      <div class="flex flex-col items-end gap-2">
        <span
          :class="[
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider',
            badgeToneMap[normalizedStatus],
          ]"
        >
          <component :is="iconMap[normalizedStatus]" class="h-3.5 w-3.5" />
          {{ statusLabelMap[normalizedStatus] }}
        </span>
        <component 
          :is="iconMap[normalizedStatus]" 
          :class="['h-6 w-6 transition-transform group-hover:scale-110', toneMap[normalizedStatus]]" 
        />
      </div>
    </div>

    <div class="mt-5 text-sm leading-relaxed text-slate-600">
      {{ stat.trend }}
    </div>

    <div class="mt-6">
      <div class="mb-3 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
        <span>{{ t('workspace.overview.healthIndex') }}</span>
        <span class="font-semibold">{{ progressValue }}%</span>
      </div>
      <div class="h-2.5 overflow-hidden rounded-full bg-white/80 ring-1 ring-inset ring-slate-200/70">
        <div
          :class="['h-full rounded-full transition-all duration-500', progressToneMap[normalizedStatus]]"
          :style="{ width: `${progressValue}%` }"
        ></div>
      </div>
    </div>

    <div class="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 blur-2xl transition-opacity group-hover:opacity-100"></div>
  </div>
</template>
