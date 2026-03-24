<script setup>
import { computed } from 'vue'
import { AlertTriangle, CheckCircle2, Clock3 } from 'lucide-vue-next'
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
  good: 'bg-emerald-400',
  warning: 'bg-amber-400',
  error: 'bg-rose-400',
  neutral: 'bg-sky-400',
}

const badgeToneMap = {
  good: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  error: 'border-rose-200 bg-rose-50 text-rose-700',
  neutral: 'border-sky-200 bg-sky-50 text-sky-700',
}

const cardToneMap = {
  good: 'border-emerald-100/80 bg-[linear-gradient(180deg,rgba(236,253,245,0.95),rgba(255,255,255,1))]',
  warning: 'border-amber-100/80 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,255,255,1))]',
  error: 'border-rose-100/80 bg-[linear-gradient(180deg,rgba(255,241,242,0.96),rgba(255,255,255,1))]',
  neutral: 'border-sky-100/80 bg-[linear-gradient(180deg,rgba(240,249,255,0.96),rgba(255,255,255,1))]',
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
      'group relative overflow-hidden rounded-[28px] border p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition-transform duration-200 hover:-translate-y-0.5',
      cardToneMap[normalizedStatus],
    ]"
  >
    <div class="absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(148,163,184,0.45),transparent)]"></div>

    <div class="flex items-start justify-between gap-4">
      <div>
        <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          {{ stat.label }}
        </div>
        <div class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          {{ stat.value }}
        </div>
      </div>
      <div class="flex flex-col items-end gap-2">
        <span
          :class="[
            'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
            badgeToneMap[normalizedStatus],
          ]"
        >
          <component :is="iconMap[normalizedStatus]" class="h-3.5 w-3.5" />
          {{ statusLabelMap[normalizedStatus] }}
        </span>
        <component :is="iconMap[normalizedStatus]" :class="['h-5 w-5', toneMap[normalizedStatus]]" />
      </div>
    </div>

    <div class="mt-4 text-sm leading-6 text-slate-600">
      {{ stat.trend }}
    </div>

    <div class="mt-5">
      <div class="mb-2 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
        <span>{{ t('workspace.overview.healthIndex') }}</span>
        <span>{{ progressValue }}%</span>
      </div>
      <div class="h-2 rounded-full bg-white/80 ring-1 ring-inset ring-slate-200/70">
        <div
          :class="['h-full rounded-full transition-all', progressToneMap[normalizedStatus]]"
          :style="{ width: `${progressValue}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>
