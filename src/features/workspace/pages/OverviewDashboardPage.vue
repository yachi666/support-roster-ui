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
  TrendingUp,
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api } from '@/api'
import OverviewStatCard from '../components/OverviewStatCard.vue'
import WorkspacePageHeader from '../components/WorkspacePageHeader.vue'
import WorkspaceSurface from '../components/WorkspaceSurface.vue'
import { useWorkspacePeriod } from '../composables/useWorkspacePeriod'
import { WORKSPACE_OVERVIEW_PATH, getWorkspaceQuickActionTarget } from '../config/navigation'

const overviewStats = shallowRef([])
const activityEntries = shallowRef([])
const rawQuickActions = shallowRef([])
const loading = shallowRef(false)
const errorMessage = shallowRef('')

const { year, month, monthLabel, timezone } = useWorkspacePeriod()
const { t } = useI18n()

const STATUS_WEIGHT = {
  error: 0,
  warning: 1,
  neutral: 2,
  good: 3,
}

const statusCopy = computed(() => ({
  error: {
    label: t('workspace.overview.status.critical'),
    chip: 'border-rose-200/60 bg-rose-50/80 text-rose-700',
    panel: 'border-rose-100/50 bg-gradient-to-br from-rose-50/40 via-white to-rose-50/20',
    accent: 'bg-gradient-to-r from-rose-400 to-rose-500',
    icon: TriangleAlert,
  },
  warning: {
    label: t('workspace.overview.status.needsAttention'),
    chip: 'border-amber-200/60 bg-amber-50/80 text-amber-700',
    panel: 'border-amber-100/50 bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20',
    accent: 'bg-gradient-to-r from-amber-400 to-amber-500',
    icon: ShieldAlert,
  },
  neutral: {
    label: t('workspace.overview.status.tracking'),
    chip: 'border-sky-200/60 bg-sky-50/80 text-sky-700',
    panel: 'border-sky-100/50 bg-gradient-to-br from-sky-50/40 via-white to-sky-50/20',
    accent: 'bg-gradient-to-r from-sky-400 to-sky-500',
    icon: Radar,
  },
  good: {
    label: t('workspace.overview.status.healthy'),
    chip: 'border-emerald-200/60 bg-emerald-50/80 text-emerald-700',
    panel: 'border-emerald-100/50 bg-gradient-to-br from-emerald-50/40 via-white to-emerald-50/20',
    accent: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
    icon: CheckCircle2,
  },
}))

function normalizeStatus(status) {
  return statusCopy.value[status] ? status : 'neutral'
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
      eyebrow: t('workspace.overview.signal.completionEyebrow'),
      title: t('workspace.overview.signal.completionTitle'),
      detail: stat.trend,
      cta: t('workspace.overview.signal.completionCta'),
      to: '/workspace/roster',
    }
  }

  if (label.includes('assignment') || label.includes('shift')) {
    return {
      eyebrow: t('workspace.overview.signal.coverageEyebrow'),
      title: t('workspace.overview.signal.coverageTitle'),
      detail: stat.trend,
      cta: t('workspace.overview.signal.coverageCta'),
      to: '/workspace/roster',
    }
  }

  if (label.includes('issue') || label.includes('validation')) {
    return {
      eyebrow: t('workspace.overview.signal.validationEyebrow'),
      title: t('workspace.overview.signal.validationTitle'),
      detail: stat.trend,
      cta: t('workspace.overview.signal.validationCta'),
      to: '/workspace/validation',
    }
  }

  return {
    eyebrow: index === 0 ? t('workspace.overview.signal.primaryEyebrow') : t('workspace.overview.signal.operationalEyebrow'),
    title: stat.label,
    detail: stat.trend,
    cta: t('workspace.overview.signal.defaultCta'),
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
const primaryMonthlyStats = computed(() => monthlyStats.value.slice(0, 2))
const remainingMonthlyStats = computed(() => monthlyStats.value.slice(2))
const activityPreview = computed(() => activityEntries.value.slice(0, 5))

const monthlySignalCards = computed(() => {
  if (!primaryMonthlyStats.value.length) {
    return [
      {
        key: 'empty-month-signal',
        eyebrow: t('workspace.overview.signal.emptyEyebrow'),
        title: t('workspace.overview.signal.emptyTitle'),
        detail: t('workspace.overview.signal.emptyDetail'),
        cta: t('workspace.overview.signal.emptyCta'),
        to: WORKSPACE_OVERVIEW_PATH,
        status: 'neutral',
        value: '--',
      },
    ]
  }

  return primaryMonthlyStats.value.map((stat, index) => ({
    key: stat.id,
    ...getSignalCopy(stat, index),
    status: stat.status,
    value: stat.value,
  }))
})

const heroNarrative = computed(() => {
  if (!leadStat.value) {
    return `Monitor your roster operations, spot risks early, and take action when needed.`
  }

  return `${leadStat.value.value} ${leadStat.value.label.toLowerCase()} — ${leadStat.value.trend}`
})

const compactMeta = computed(() => [
  { icon: CalendarDays, value: monthLabel.value },
  { icon: Clock3, value: timezone.value },
  { icon: Radar, value: `${normalizedStats.value.length} signals` },
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
  <div class="min-h-screen bg-gradient-to-br from-slate-50/50 via-white to-amber-50/30">
    <div class="mx-auto max-w-[1440px] space-y-8 p-6 xl:p-10">
      <WorkspacePageHeader
        title="Monthly Roster Overview"
        :description="t('workspace.overview.description', { monthLabel })"
        class="animate-fade-in-up"
      >
        <template #actions>
          <button
            class="group inline-flex items-center gap-2 rounded-2xl border border-slate-200/60 bg-white/80 px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-all hover:border-slate-300 hover:bg-white hover:shadow-md"
            @click="loadOverview"
          >
            <RefreshCw class="h-4 w-4 transition-transform group-hover:rotate-180" />
            {{ t('workspace.overview.refresh') }}
          </button>
          <RouterLink
            to="/workspace/roster"
            class="inline-flex items-center gap-2 rounded-2xl border border-slate-200/60 bg-white/80 px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-all hover:border-slate-300 hover:bg-white hover:shadow-md"
          >
            <ClipboardCheck class="h-4 w-4" />
            {{ t('workspace.overview.openRoster') }}
          </RouterLink>
          <RouterLink
            to="/workspace/import-export"
            class="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-slate-900/10 transition-all hover:from-slate-900 hover:to-slate-950 hover:shadow-xl"
          >
            <FileSpreadsheet class="h-4 w-4" />
            {{ t('workspace.overview.importExport') }}
          </RouterLink>
        </template>
      </WorkspacePageHeader>

      <WorkspaceSurface v-if="errorMessage" tone="muted" class="border-rose-200/60 bg-gradient-to-r from-rose-50 to-rose-50/50 p-6 text-sm text-rose-700 backdrop-blur-sm animate-fade-in">
        <div class="flex items-center justify-between gap-4">
          <span>{{ errorMessage }}</span>
          <button class="rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-medium text-rose-700 transition-all hover:bg-rose-100" @click="loadOverview">
            {{ t('common.retry') }}
          </button>
        </div>
      </WorkspaceSurface>

      <div class="grid gap-8 xl:grid-cols-[1.6fr_1fr]" style="animation: fadeInUp 0.6s ease-out 0.1s both">
        <WorkspaceSurface
          :padded="false"
          class="group overflow-hidden border-slate-200/50 bg-gradient-to-br from-white via-slate-50/30 to-white shadow-xl shadow-slate-900/5 backdrop-blur-sm transition-all hover:shadow-2xl"
        >
          <div class="relative space-y-8 px-8 py-8 lg:px-10 lg:py-10">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.08),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(245,158,11,0.06),transparent_50%)]"></div>
            
            <div class="relative space-y-6">
              <div class="flex flex-wrap items-center gap-3">
                <div
                  v-for="item in compactMeta"
                  :key="item.value"
                  class="inline-flex items-center gap-2 rounded-full border border-slate-200/60 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-sm"
                >
                  <component :is="item.icon" class="h-4 w-4 text-slate-500" />
                  {{ item.value }}
                </div>
              </div>

              <div>
                <h2 class="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
                  {{ t('workspace.overview.rosterOverview', { monthLabel }) }}
                </h2>
                <p class="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
                  {{ loading ? t('workspace.overview.loadingHero') : heroNarrative }}
                </p>
              </div>
            </div>

            <div class="relative grid gap-5 lg:grid-cols-2">
              <div
                v-for="(signal, index) in monthlySignalCards"
                :key="signal.key"
                :class="[
                  'group relative overflow-hidden rounded-3xl border p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl',
                  statusCopy[signal.status].panel,
                ]"
                :style="{ animationDelay: `${index * 100}ms` }"
              >
                <div :class="['absolute inset-x-0 top-0 h-1.5', statusCopy[signal.status].accent]"></div>
                <div class="text-xs font-semibold uppercase tracking-widest text-slate-500">{{ signal.eyebrow }}</div>
                <div class="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <div class="text-sm font-semibold text-slate-800">{{ signal.title }}</div>
                    <div class="mt-2 text-4xl font-bold tracking-tight text-slate-900">{{ signal.value }}</div>
                  </div>
                  <span :class="['inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider', statusCopy[signal.status].chip]">
                    {{ statusCopy[signal.status].label }}
                  </span>
                </div>
                <div class="mt-4 text-sm leading-relaxed text-slate-600">{{ signal.detail }}</div>
                <RouterLink :to="signal.to" class="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700 transition-colors hover:text-slate-900">
                  {{ signal.cta }}
                  <ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </RouterLink>
              </div>
            </div>
          </div>
        </WorkspaceSurface>

        <div class="space-y-6">
          <WorkspaceSurface :padded="false" class="group overflow-hidden border-slate-200/50 bg-white/80 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl">
            <div class="border-b border-slate-100/80 px-6 py-5">
              <div class="text-xs font-semibold uppercase tracking-widest text-slate-500">{{ t('workspace.overview.validationWatch') }}</div>
              <h2 class="mt-2 text-lg font-semibold tracking-tight text-slate-900">{{ t('workspace.overview.escalationPanel') }}</h2>
            </div>
            <div :class="['space-y-5 px-6 py-6', statusCopy[validationSummary.status].panel]">
              <div class="flex items-center justify-between gap-4">
                <span :class="['inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider', statusCopy[validationSummary.status].chip]">
                  <component :is="statusCopy[validationSummary.status].icon" class="h-3.5 w-3.5" />
                  {{ statusCopy[validationSummary.status].label }}
                </span>
                <div class="text-lg font-bold text-slate-900">{{ validationSummary.value }}</div>
              </div>
              <div class="text-sm leading-relaxed text-slate-600">{{ validationSummary.trend }}</div>
              <div>
                <div class="mb-3 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
                  <span>{{ t('workspace.overview.reviewReadiness') }}</span>
                  <span>{{ validationSummary.progress }}%</span>
                </div>
                <div class="h-2.5 overflow-hidden rounded-full bg-white/80 ring-1 ring-inset ring-slate-200/70">
                  <div :class="['h-full rounded-full transition-all', statusCopy[validationSummary.status].accent]" :style="{ width: `${validationSummary.progress}%` }"></div>
                </div>
              </div>
              <RouterLink to="/workspace/validation" class="inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-white hover:shadow-md">
                {{ t('workspace.validation.title') }}
                <ArrowRight class="h-3.5 w-3.5" />
              </RouterLink>
            </div>
          </WorkspaceSurface>
        </div>
      </div>

      <div v-if="remainingMonthlyStats.length" class="grid gap-6 xl:grid-cols-3" style="animation: fadeInUp 0.6s ease-out 0.2s both">
        <OverviewStatCard
          v-for="(stat, index) in remainingMonthlyStats"
          :key="stat.id"
          :stat="stat"
          :style="{ animationDelay: `${index * 50}ms` }"
        />
      </div>
      <WorkspaceSurface v-else-if="!primaryMonthlyStats.length" class="border-slate-200/50 bg-white/80 p-8 text-center text-sm text-slate-500 shadow-lg backdrop-blur-sm animate-fade-in">
        <Activity class="mx-auto mb-3 h-12 w-12 text-slate-300" />
        {{ loading ? t('workspace.overview.loadingMetrics') : t('workspace.overview.emptyMetrics') }}
      </WorkspaceSurface>

      <div class="grid gap-8 xl:grid-cols-[1.3fr_1fr]" style="animation: fadeInUp 0.6s ease-out 0.3s both">
        <WorkspaceSurface :padded="false" class="group overflow-hidden border-slate-200/50 bg-white/80 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl">
          <div class="flex items-center justify-between border-b border-slate-100/80 px-6 py-5">
            <div>
              <div class="text-xs font-semibold uppercase tracking-widest text-slate-500">{{ t('workspace.overview.activityStream') }}</div>
              <h2 class="mt-2 text-lg font-semibold tracking-tight text-slate-900">{{ t('workspace.overview.recentOperations') }}</h2>
            </div>
            <div class="flex items-center gap-2 rounded-full border border-slate-200/60 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600">
              <Activity class="h-4 w-4 text-slate-500" />
              {{ activityPreview.length }}
            </div>
          </div>
          <div class="px-6 py-6">
            <div v-if="loading && !activityPreview.length" class="text-sm text-slate-500">{{ t('workspace.overview.loadingActivity') }}</div>
            <div v-else-if="!activityPreview.length" class="text-sm text-slate-500">{{ t('workspace.overview.emptyActivity') }}</div>
            <div v-else class="space-y-4">
              <div
                v-for="entry in activityPreview"
                :key="`${entry.user}-${entry.time}-${entry.action}`"
                class="group/item grid gap-4 rounded-2xl border border-slate-100/80 bg-gradient-to-r from-slate-50/50 to-white p-5 transition-all hover:border-slate-200 hover:shadow-md sm:grid-cols-[auto_1fr_auto]"
              >
                <div class="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50 text-sm font-bold text-slate-700 shadow-sm">
                  {{ entry.user?.[0] || '?' }}
                </div>
                <div>
                  <div class="text-sm text-slate-800">
                    <span class="font-semibold">{{ entry.user }}</span>
                    <span class="text-slate-500"> {{ entry.action }}</span>
                  </div>
                  <div class="mt-1 text-xs text-slate-500">{{ t('workspace.overview.activityHint') }}</div>
                </div>
                <div class="text-xs font-medium uppercase tracking-wider text-slate-400">
                  {{ entry.time }}
                </div>
              </div>
            </div>
          </div>
        </WorkspaceSurface>

        <WorkspaceSurface :padded="false" class="group overflow-hidden border-slate-200/50 bg-white/80 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl">
          <div class="border-b border-slate-100/80 px-6 py-5">
            <div class="text-xs font-semibold uppercase tracking-widest text-slate-500">{{ t('workspace.overview.actionDeck') }}</div>
            <h2 class="mt-2 text-lg font-semibold tracking-tight text-slate-900">{{ t('workspace.overview.nextMoves') }}</h2>
          </div>
          <div class="space-y-3 p-5">
            <div v-if="loading && !quickActions.length" class="px-2 py-3 text-sm text-slate-500">{{ t('workspace.overview.loadingActions') }}</div>
            <div v-else-if="!quickActions.length" class="px-2 py-3 text-sm text-slate-500">{{ t('workspace.overview.emptyActions') }}</div>
            <RouterLink
              v-for="action in quickActions"
              :key="`${action.title}-${action.actionKey}`"
              :to="action.to"
              class="group block rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white via-slate-50/30 to-white p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex items-start gap-4">
                  <div
                    :class="[
                      'flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-110',
                      action.tone === 'rose'
                        ? 'bg-gradient-to-br from-rose-100 to-rose-50 text-rose-600'
                        : action.tone === 'slate'
                          ? 'bg-gradient-to-br from-slate-100 to-slate-50 text-slate-700'
                          : 'bg-gradient-to-br from-teal-100 to-teal-50 text-teal-700',
                    ]"
                  >
                    <TriangleAlert v-if="action.actionKey?.includes('validation') || action.actionKey?.includes('issue')" class="h-5 w-5" />
                    <FileSpreadsheet v-else-if="action.actionKey?.includes('import') || action.actionKey?.includes('export')" class="h-5 w-5" />
                    <ClipboardCheck v-else class="h-5 w-5" />
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-slate-900">{{ action.title }}</div>
                    <div class="mt-1 text-xs leading-relaxed text-slate-500">{{ action.subtitle }}</div>
                  </div>
                </div>
                <ArrowRight class="mt-1 h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-slate-600" />
              </div>
            </RouterLink>
          </div>
        </WorkspaceSurface>
      </div>
    </div>
  </div>
</template>
