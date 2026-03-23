<script setup>
import { computed, shallowRef, watch } from 'vue'
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileSpreadsheet,
  Radar,
  RefreshCw,
  ShieldAlert,
  TriangleAlert,
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { api } from '@/api'
import OverviewStatCard from '../components/OverviewStatCard.vue'
import WorkspacePageHeader from '../components/WorkspacePageHeader.vue'
import WorkspaceSurface from '../components/WorkspaceSurface.vue'
import { useWorkspacePeriod } from '../composables/useWorkspacePeriod'
import { getWorkspaceQuickActionTarget } from '../config/navigation'

const overviewStats = shallowRef([])
const activityEntries = shallowRef([])
const rawQuickActions = shallowRef([])
const loading = shallowRef(false)
const errorMessage = shallowRef('')

const { year, month, monthLabel, timezone } = useWorkspacePeriod()

const STATUS_WEIGHT = {
  error: 0,
  warning: 1,
  neutral: 2,
  good: 3,
}

const statusCopy = {
  error: {
    label: 'Critical',
    chip: 'border-rose-200 bg-rose-50 text-rose-700',
    panel: 'border-rose-200 bg-[linear-gradient(135deg,rgba(255,241,242,0.98),rgba(255,255,255,0.96))]',
    accent: 'bg-rose-500',
    icon: TriangleAlert,
  },
  warning: {
    label: 'Needs review',
    chip: 'border-amber-200 bg-amber-50 text-amber-700',
    panel: 'border-amber-200 bg-[linear-gradient(135deg,rgba(255,251,235,0.98),rgba(255,255,255,0.96))]',
    accent: 'bg-amber-500',
    icon: ShieldAlert,
  },
  neutral: {
    label: 'Tracking',
    chip: 'border-sky-200 bg-sky-50 text-sky-700',
    panel: 'border-sky-200 bg-[linear-gradient(135deg,rgba(240,249,255,0.98),rgba(255,255,255,0.96))]',
    accent: 'bg-sky-500',
    icon: Radar,
  },
  good: {
    label: 'Healthy',
    chip: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    panel: 'border-emerald-200 bg-[linear-gradient(135deg,rgba(236,253,245,0.98),rgba(255,255,255,0.96))]',
    accent: 'bg-emerald-500',
    icon: CheckCircle2,
  },
}

function normalizeStatus(status) {
  return statusCopy[status] ? status : 'neutral'
}

function isValidationStat(stat) {
  return /issue|validation/i.test(stat?.label || '')
}

function getMonthlyMetricPriority(stat) {
  const label = (stat?.label || '').toLowerCase()

  if (label.includes('completion')) {
    return 0
  }

  if (label.includes('assignment') || label.includes('shift')) {
    return 1
  }

  return 2
}

function getSignalCopy(stat, index) {
  const label = (stat?.label || '').toLowerCase()

  if (label.includes('completion')) {
    return {
      eyebrow: 'Completion pulse',
      title: 'Month completion',
      detail: stat.trend,
      cta: 'Open Monthly Roster',
      to: '/workspace/roster',
    }
  }

  if (label.includes('assignment') || label.includes('shift')) {
    return {
      eyebrow: 'Coverage volume',
      title: 'Scheduled workload',
      detail: stat.trend,
      cta: 'Inspect roster grid',
      to: '/workspace/roster',
    }
  }

  if (label.includes('issue') || label.includes('validation')) {
    return {
      eyebrow: 'Validation watch',
      title: 'Open review items',
      detail: stat.trend,
      cta: 'Open Validation Center',
      to: '/workspace/validation',
    }
  }

  return {
    eyebrow: index === 0 ? 'Primary signal' : 'Operational signal',
    title: stat.label,
    detail: stat.trend,
    cta: 'Open workspace',
    to: '/workspace/roster',
  }
}

const quickActions = computed(() =>
  rawQuickActions.value.map((action) => {
    const normalizedKey = (action.actionKey || '').toLowerCase()
    let tone = 'teal'

    if (normalizedKey.includes('validation') || normalizedKey.includes('issue')) {
      tone = 'rose'
    } else if (normalizedKey.includes('import') || normalizedKey.includes('export')) {
      tone = 'slate'
    }

    return {
      ...action,
      to: getWorkspaceQuickActionTarget(action.actionKey),
      tone,
    }
  }),
)

const normalizedStats = computed(() =>
  overviewStats.value
    .map((stat, index) => {
      const status = normalizeStatus(stat.status)
      const progress = Math.min(100, Math.max(0, Number(stat.progress ?? 0) || 0))

      return {
        ...stat,
        id: `${stat.label}-${index}`,
        status,
        progress,
      }
    })
    .sort((left, right) => STATUS_WEIGHT[left.status] - STATUS_WEIGHT[right.status]),
)

const validationStat = computed(() => normalizedStats.value.find((stat) => isValidationStat(stat)) ?? null)
const monthlyStats = computed(() =>
  normalizedStats.value
    .filter((stat) => !isValidationStat(stat))
    .sort((left, right) => {
      const priorityGap = getMonthlyMetricPriority(left) - getMonthlyMetricPriority(right)

      if (priorityGap !== 0) {
        return priorityGap
      }

      return STATUS_WEIGHT[left.status] - STATUS_WEIGHT[right.status]
    }),
)
const leadStat = computed(() => monthlyStats.value[0] ?? validationStat.value ?? null)
const secondaryMonthlyStats = computed(() => monthlyStats.value.slice(0, 3))
const activityPreview = computed(() => activityEntries.value.slice(0, 5))

const monthlySignalCards = computed(() => {
  if (!secondaryMonthlyStats.value.length) {
    return [
      {
        key: 'empty-month-signal',
        eyebrow: 'Waiting for data',
        title: 'No month signals returned',
        detail: 'Once overview stats are available, this area will summarize completion, coverage, and roster execution for the selected month.',
        cta: 'Refresh overview',
        to: '/workspace',
        status: 'neutral',
        value: '--',
      },
    ]
  }

  return secondaryMonthlyStats.value.map((stat, index) => ({
    key: stat.id,
    ...getSignalCopy(stat, index),
    status: stat.status,
    value: stat.value,
  }))
})

const heroNarrative = computed(() => {
  if (!leadStat.value) {
    return `Use this page to monitor ${monthLabel.value}, spot month-level risk early, and jump straight into the roster when intervention is needed.`
  }

  return `${leadStat.value.value} currently reported for ${leadStat.value.label}. ${leadStat.value.trend}`
})

const monthMeta = computed(() => [
  { label: 'Workspace month', value: monthLabel.value, icon: CalendarDays },
  { label: 'Timezone', value: timezone.value, icon: Clock3 },
  { label: 'Tracked signals', value: String(normalizedStats.value.length || 0), icon: Radar },
  { label: 'Recent actions', value: String(activityPreview.value.length || 0), icon: Activity },
])

const monthStatusCard = computed(() => {
  if (!leadStat.value) {
    return {
      status: 'neutral',
      label: 'Month status',
      value: '--',
      trend: 'No overview data returned for the selected month yet.',
    }
  }

  return leadStat.value
})

const validationSummary = computed(() => {
  if (!validationStat.value) {
    return {
      status: 'good',
      label: 'Validation watch',
      value: '0',
      trend: 'No validation signals are currently raised for this month.',
      progress: 100,
    }
  }

  return validationStat.value
})

async function loadOverview() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await api.workspace.getOverview(year.value, month.value)
    overviewStats.value = response?.stats || []
    activityEntries.value = response?.activity || []
    rawQuickActions.value = response?.quickActions || []
  } catch (error) {
    errorMessage.value = error.message || 'Failed to load workspace overview.'
  } finally {
    loading.value = false
  }
}

watch([year, month], () => {
  void loadOverview()
}, { immediate: true })
</script>

<template>
  <div class="mx-auto max-w-[1280px] space-y-6 p-6 xl:p-8">
    <WorkspacePageHeader
      title="Monthly Roster Overview"
      :description="`Month-first control board for ${monthLabel}, focused on roster readiness, coverage signals, and the smallest set of issues that need escalation.`"
    >
      <template #actions>
        <button
          class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          @click="loadOverview"
        >
          <RefreshCw class="h-4 w-4" />
          Refresh
        </button>
        <RouterLink
          to="/workspace/roster"
          class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          <ClipboardCheck class="h-4 w-4" />
          Open Monthly Roster
        </RouterLink>
        <RouterLink
          to="/workspace/import-export"
          class="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
        >
          <FileSpreadsheet class="h-4 w-4" />
          Import or Export
        </RouterLink>
      </template>
    </WorkspacePageHeader>

    <WorkspaceSurface v-if="errorMessage" tone="muted" class="border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
      <div class="flex items-center justify-between gap-4">
        <span>{{ errorMessage }}</span>
        <button class="rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100" @click="loadOverview">
          Retry
        </button>
      </div>
    </WorkspaceSurface>

    <div class="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
      <WorkspaceSurface
        :padded="false"
        class="overflow-hidden border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.17),transparent_32%),radial-gradient(circle_at_82%_14%,rgba(245,158,11,0.14),transparent_24%),linear-gradient(180deg,#ffffff,rgba(248,250,252,0.98))]"
      >
        <div class="space-y-6 px-6 py-6 lg:px-8 lg:py-8">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="space-y-4">
              <div class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                <CalendarDays class="h-3.5 w-3.5 text-teal-600" />
                Monthly operations brief
              </div>

              <div>
                <h2 class="max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 lg:text-[2.7rem]">
                  {{ monthLabel }} roster overview
                </h2>
                <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-600 lg:text-[15px]">
                  {{ loading ? 'Refreshing month-level roster signals from the workspace API...' : heroNarrative }}
                </p>
              </div>
            </div>

            <div class="rounded-[26px] border border-white/80 bg-white/80 px-5 py-4 shadow-[0_20px_40px_rgba(15,23,42,0.06)]">
              <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Selected month</div>
              <div class="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{{ monthLabel }}</div>
              <div class="mt-2 text-xs text-slate-500">Aligned with the shared workspace period and used across roster, import, and validation flows.</div>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div
              v-for="item in monthMeta"
              :key="item.label"
              class="rounded-2xl border border-white/80 bg-white/82 px-4 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)]"
            >
              <div class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                <component :is="item.icon" class="h-3.5 w-3.5 text-slate-500" />
                {{ item.label }}
              </div>
              <div class="mt-3 text-lg font-semibold tracking-tight text-slate-950">{{ item.value }}</div>
            </div>
          </div>

          <div class="grid gap-4 lg:grid-cols-3">
            <div
              v-for="signal in monthlySignalCards"
              :key="signal.key"
              :class="[
                'relative overflow-hidden rounded-[24px] border p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]',
                statusCopy[signal.status].panel,
              ]"
            >
              <div :class="['absolute inset-x-0 top-0 h-1', statusCopy[signal.status].accent]"></div>
              <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{{ signal.eyebrow }}</div>
              <div class="mt-3 flex items-end justify-between gap-4">
                <div>
                  <div class="text-sm font-semibold text-slate-900">{{ signal.title }}</div>
                  <div class="mt-1 text-3xl font-semibold tracking-tight text-slate-950">{{ signal.value }}</div>
                </div>
                <span :class="['inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]', statusCopy[signal.status].chip]">
                  {{ statusCopy[signal.status].label }}
                </span>
              </div>
              <div class="mt-3 text-sm leading-6 text-slate-600">{{ signal.detail }}</div>
              <RouterLink :to="signal.to" class="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 transition-colors hover:text-slate-950">
                {{ signal.cta }}
                <ArrowRight class="h-3.5 w-3.5" />
              </RouterLink>
            </div>
          </div>
        </div>
      </WorkspaceSurface>

      <div class="space-y-6">
        <WorkspaceSurface :padded="false" class="overflow-hidden">
          <div class="border-b border-slate-100 px-6 py-5">
            <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Month status</div>
            <h2 class="mt-2 text-lg font-semibold tracking-tight text-slate-900">Primary roster signal</h2>
          </div>
          <div :class="['space-y-4 px-6 py-6', statusCopy[monthStatusCard.status].panel]">
            <div class="flex items-center justify-between gap-4">
              <span :class="['inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]', statusCopy[monthStatusCard.status].chip]">
                <component :is="statusCopy[monthStatusCard.status].icon" class="h-3.5 w-3.5" />
                {{ statusCopy[monthStatusCard.status].label }}
              </span>
              <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{{ monthLabel }}</div>
            </div>
            <div>
              <div class="text-sm font-semibold text-slate-900">{{ monthStatusCard.label }}</div>
              <div class="mt-2 text-4xl font-semibold tracking-tight text-slate-950">{{ monthStatusCard.value }}</div>
            </div>
            <div class="text-sm leading-7 text-slate-600">{{ monthStatusCard.trend }}</div>
            <RouterLink to="/workspace/roster" class="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-white">
              Open roster workspace
              <ArrowRight class="h-3.5 w-3.5" />
            </RouterLink>
          </div>
        </WorkspaceSurface>

        <WorkspaceSurface :padded="false" class="overflow-hidden">
          <div class="border-b border-slate-100 px-6 py-5">
            <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Validation watch</div>
            <h2 class="mt-2 text-lg font-semibold tracking-tight text-slate-900">Compact escalation panel</h2>
          </div>
          <div :class="['space-y-4 px-6 py-6', statusCopy[validationSummary.status].panel]">
            <div class="flex items-center justify-between gap-4">
              <span :class="['inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]', statusCopy[validationSummary.status].chip]">
                <component :is="statusCopy[validationSummary.status].icon" class="h-3.5 w-3.5" />
                {{ statusCopy[validationSummary.status].label }}
              </span>
              <div class="text-sm font-semibold text-slate-900">{{ validationSummary.value }}</div>
            </div>
            <div class="text-sm leading-7 text-slate-600">{{ validationSummary.trend }}</div>
            <div>
              <div class="mb-2 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                <span>Review readiness</span>
                <span>{{ validationSummary.progress }}%</span>
              </div>
              <div class="h-2 rounded-full bg-white/80 ring-1 ring-inset ring-slate-200/70">
                <div :class="['h-full rounded-full transition-all', statusCopy[validationSummary.status].accent]" :style="{ width: `${validationSummary.progress}%` }"></div>
              </div>
            </div>
            <RouterLink to="/workspace/validation" class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 transition-colors hover:text-slate-950">
              Open Validation Center
              <ArrowRight class="h-3.5 w-3.5" />
            </RouterLink>
          </div>
        </WorkspaceSurface>
      </div>
    </div>

    <div v-if="monthlyStats.length" class="grid gap-5 xl:grid-cols-3">
      <OverviewStatCard
        v-for="stat in monthlyStats"
        :key="stat.id"
        :stat="stat"
      />
    </div>
    <WorkspaceSurface v-else class="p-6 text-sm text-slate-500">
      {{ loading ? 'Loading month summary metrics...' : 'No month summary metrics returned by the server.' }}
    </WorkspaceSurface>

    <div class="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
      <WorkspaceSurface :padded="false" class="overflow-hidden">
        <div class="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Activity stream</div>
            <h2 class="mt-2 text-lg font-semibold tracking-tight text-slate-900">Recent month operations</h2>
          </div>
          <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{{ monthLabel }}</div>
        </div>
        <div class="px-6 py-5">
          <div v-if="loading && !activityPreview.length" class="text-sm text-slate-500">Loading recent activity...</div>
          <div v-else-if="!activityPreview.length" class="text-sm text-slate-500">No recent activity returned by the server.</div>
          <div v-else class="space-y-5">
            <div
              v-for="entry in activityPreview"
              :key="`${entry.user}-${entry.time}-${entry.action}`"
              class="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-[auto_1fr_auto]"
            >
              <div class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm">
                {{ entry.user?.[0] || '?' }}
              </div>
              <div>
                <div class="text-sm text-slate-800">
                  <span class="font-semibold">{{ entry.user }}</span>
                  <span class="text-slate-500"> {{ entry.action }}</span>
                </div>
                <div class="mt-1 text-xs text-slate-500">Captured from the latest workspace operation log for month-level roster operations.</div>
              </div>
              <div class="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                {{ entry.time }}
              </div>
            </div>
          </div>
        </div>
      </WorkspaceSurface>

      <WorkspaceSurface :padded="false" class="overflow-hidden">
        <div class="border-b border-slate-100 px-6 py-5">
          <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Action deck</div>
          <h2 class="mt-2 text-lg font-semibold tracking-tight text-slate-900">Next moves for this month</h2>
        </div>
        <div class="space-y-3 p-4">
          <div v-if="loading && !quickActions.length" class="px-2 py-3 text-sm text-slate-500">Loading quick actions...</div>
          <div v-else-if="!quickActions.length" class="px-2 py-3 text-sm text-slate-500">No quick actions returned by the server.</div>
          <RouterLink
            v-for="action in quickActions"
            :key="`${action.title}-${action.actionKey}`"
            :to="action.to"
            class="group block rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#fff,rgba(248,250,252,0.96))] p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-start gap-3">
                <div
                  :class="[
                    'flex h-10 w-10 items-center justify-center rounded-2xl',
                    action.tone === 'rose'
                      ? 'bg-rose-100 text-rose-600'
                      : action.tone === 'slate'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-teal-100 text-teal-700',
                  ]"
                >
                  <TriangleAlert v-if="action.actionKey?.includes('validation') || action.actionKey?.includes('issue')" class="h-5 w-5" />
                  <FileSpreadsheet v-else-if="action.actionKey?.includes('import') || action.actionKey?.includes('export')" class="h-5 w-5" />
                  <ClipboardCheck v-else class="h-5 w-5" />
                </div>
                <div>
                  <div class="text-sm font-semibold text-slate-900">{{ action.title }}</div>
                  <div class="mt-1 text-xs leading-6 text-slate-500">{{ action.subtitle }}</div>
                </div>
              </div>
              <ArrowRight class="mt-1 h-4 w-4 text-slate-300 transition-colors group-hover:text-slate-600" />
            </div>
          </RouterLink>
        </div>
      </WorkspaceSurface>
    </div>
  </div>
</template>
