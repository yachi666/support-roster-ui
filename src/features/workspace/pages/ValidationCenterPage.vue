<script setup>
import { computed, shallowRef, watch } from 'vue'
import { RouterLink } from 'vue-router'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CheckSquare,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Wrench,
} from 'lucide-vue-next'
import { api } from '@/api'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import WorkspacePageHeader from '../components/WorkspacePageHeader.vue'
import WorkspaceSurface from '../components/WorkspaceSurface.vue'
import { useWorkspacePeriod } from '../composables/useWorkspacePeriod'

const searchTerm = shallowRef('')
const selectedSeverity = shallowRef('all')
const selectedSource = shallowRef('all')
const selectedIssueIds = shallowRef([])
const issues = shallowRef([])
const summary = shallowRef({ high: 0, medium: 0, low: 0 })
const loading = shallowRef(false)
const errorMessage = shallowRef('')
const actionMessage = shallowRef('')
const actionErrorMessage = shallowRef('')
const resolvePending = shallowRef(false)
const resolvingIssueIds = shallowRef([])
const { year, month, monthLabel } = useWorkspacePeriod()
const authStore = useAuthStore()

const severityMeta = {
  high: {
    label: 'Critical',
    eyebrow: 'Immediate attention',
    description: 'Blocking issues that put roster correctness at risk.',
    badge: 'border-rose-200 bg-rose-50 text-rose-700',
    panel: 'border-rose-200 bg-[linear-gradient(135deg,rgba(255,241,242,0.98),rgba(255,255,255,0.96))]',
    mutedPanel: 'border-rose-100 bg-rose-50/70',
    icon: ShieldAlert,
  },
  medium: {
    label: 'Warning',
    eyebrow: 'Review soon',
    description: 'Important data problems that still need admin follow-up.',
    badge: 'border-amber-200 bg-amber-50 text-amber-700',
    panel: 'border-amber-200 bg-[linear-gradient(135deg,rgba(255,251,235,0.98),rgba(255,255,255,0.96))]',
    mutedPanel: 'border-amber-100 bg-amber-50/70',
    icon: AlertTriangle,
  },
  low: {
    label: 'Notice',
    eyebrow: 'Monitor',
    description: 'Lower-risk hygiene signals that should not be forgotten.',
    badge: 'border-sky-200 bg-sky-50 text-sky-700',
    panel: 'border-sky-200 bg-[linear-gradient(135deg,rgba(240,249,255,0.98),rgba(255,255,255,0.96))]',
    mutedPanel: 'border-sky-100 bg-sky-50/70',
    icon: AlertCircle,
  },
}

const sourceMeta = {
  'import-issue': {
    label: 'Import pipeline',
    badge: 'border-violet-200 bg-violet-50 text-violet-700',
  },
  manual: {
    label: 'Live data',
    badge: 'border-slate-200 bg-slate-100 text-slate-700',
  },
}

async function loadValidation() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await api.workspace.getValidation(year.value, month.value)
    issues.value = response?.issues || []
    summary.value = response?.summary || { high: 0, medium: 0, low: 0 }
    selectedIssueIds.value = []
    actionMessage.value = ''
    actionErrorMessage.value = ''
  } catch (error) {
    errorMessage.value = error.message || 'Failed to load validation results.'
  } finally {
    loading.value = false
  }
}

const normalizedIssues = computed(() =>
  issues.value.map((issue) => {
    const severity = severityMeta[issue.severity] ? issue.severity : 'low'
    const resolutionKind = issue.resolutionKind === 'import-issue' ? 'import-issue' : 'manual'
    return {
      ...issue,
      severity,
      resolutionKind,
      sourceLabel: sourceMeta[resolutionKind].label,
    }
  }),
)

const visibleIssues = computed(() => {
  const query = searchTerm.value.trim().toLowerCase()

  return normalizedIssues.value.filter((issue) => {
    if (selectedSeverity.value !== 'all' && issue.severity !== selectedSeverity.value) {
      return false
    }

    if (selectedSource.value !== 'all') {
      if (selectedSource.value === 'resolvable' && !issue.resolvable) {
        return false
      }

      if (selectedSource.value === 'manual-only' && issue.resolvable) {
        return false
      }

      if (selectedSource.value === 'import-issue' && issue.resolutionKind !== 'import-issue') {
        return false
      }

      if (selectedSource.value === 'live-data' && issue.resolutionKind !== 'manual') {
        return false
      }
    }

    if (!query) {
      return true
    }

    return [issue.type, issue.description, issue.team, issue.date, issue.sourceLabel]
      .join(' ')
      .toLowerCase()
      .includes(query)
  })
})

const severityCounts = computed(() => summary.value)
const totalIssueCount = computed(() => normalizedIssues.value.length)
const resolvableIssueCount = computed(() => normalizedIssues.value.filter((issue) => issue.resolvable).length)
const manualOnlyCount = computed(() => normalizedIssues.value.filter((issue) => !issue.resolvable).length)
const importIssueCount = computed(() => normalizedIssues.value.filter((issue) => issue.resolutionKind === 'import-issue').length)

const resolvableSelectedIssueIds = computed(() =>
  selectedIssueIds.value.filter((issueId) => normalizedIssues.value.find((issue) => issue.id === issueId)?.resolvable),
)

const visibleIssueIds = computed(() => visibleIssues.value.map((issue) => issue.id))
const allVisibleSelected = computed(() =>
  visibleIssueIds.value.length > 0 && visibleIssueIds.value.every((id) => selectedIssueIds.value.includes(id)),
)

const prioritizedIssue = computed(() => {
  const ordered = [...normalizedIssues.value].sort((left, right) => {
    const leftWeight = left.severity === 'high' ? 0 : left.severity === 'medium' ? 1 : 2
    const rightWeight = right.severity === 'high' ? 0 : right.severity === 'medium' ? 1 : 2
    if (leftWeight !== rightWeight) {
      return leftWeight - rightWeight
    }

    if (left.resolvable !== right.resolvable) {
      return left.resolvable ? -1 : 1
    }

    return String(left.id).localeCompare(String(right.id))
  })

  return ordered[0] ?? null
})

const focusHeadline = computed(() => {
  if (!prioritizedIssue.value) {
    return 'Validation queue is currently clear'
  }

  if (prioritizedIssue.value.severity === 'high') {
    return `${prioritizedIssue.value.type} is the top blocker for ${monthLabel.value}`
  }

  if (prioritizedIssue.value.severity === 'medium') {
    return `${prioritizedIssue.value.type} should be reviewed next`
  }

  return `No urgent blockers detected for ${monthLabel.value}`
})

const focusNarrative = computed(() => {
  if (!prioritizedIssue.value) {
    return 'Use this page to watch for new import problems, roster conflicts, and manual follow-up items.'
  }

  return prioritizedIssue.value.description
})

const issueGroups = computed(() =>
  ['high', 'medium', 'low']
    .map((severity) => ({
      severity,
      meta: severityMeta[severity],
      items: visibleIssues.value.filter((issue) => issue.severity === severity),
    }))
    .filter((group) => group.items.length > 0),
)

function toggleIssue(issueId) {
  selectedIssueIds.value = selectedIssueIds.value.includes(issueId)
    ? selectedIssueIds.value.filter((id) => id !== issueId)
    : [...selectedIssueIds.value, issueId]
}

function toggleAll() {
  const currentIds = visibleIssueIds.value

  selectedIssueIds.value = allVisibleSelected.value
    ? selectedIssueIds.value.filter((id) => !currentIds.includes(id))
    : Array.from(new Set([...selectedIssueIds.value, ...currentIds]))
}

async function resolveIssues(issueIds) {
  if (!issueIds.length || resolvePending.value || authStore.isReadonly) {
    return
  }

  resolvePending.value = true
  actionErrorMessage.value = ''
  actionMessage.value = ''
  resolvingIssueIds.value = issueIds

  try {
    const response = await api.workspace.resolveValidationIssues({
      year: year.value,
      month: month.value,
      issueIds,
    })

    summary.value = response?.validation?.summary || { high: 0, medium: 0, low: 0 }
    issues.value = response?.validation?.issues || []
    selectedIssueIds.value = selectedIssueIds.value.filter((id) => !response?.resolvedIssueIds?.includes(id))

    const resolvedCount = response?.resolvedCount || 0
    const skippedCount = response?.skippedCount || 0

    if (resolvedCount === 0 && skippedCount > 0) {
      actionMessage.value = `No issues were auto-resolved. ${skippedCount} selected item(s) still require manual action.`
      return
    }

    actionMessage.value = skippedCount > 0
      ? `Resolved ${resolvedCount} issue(s); ${skippedCount} item(s) still require manual action.`
      : `Resolved ${resolvedCount} issue(s) via the workspace validation API.`
  } catch (error) {
    actionErrorMessage.value = error.message || 'Failed to resolve validation issue.'
  } finally {
    resolvePending.value = false
    resolvingIssueIds.value = []
  }
}

function resolveSelectedIssues() {
  void resolveIssues(resolvableSelectedIssueIds.value)
}

function resolveSingleIssue(issueId) {
  void resolveIssues([issueId])
}

function isResolving(issueId) {
  return resolvingIssueIds.value.includes(issueId)
}

function getIssueTarget(issue) {
  if (issue.resolutionKind === 'import-issue') {
    return '/workspace/import-export'
  }

  const normalizedType = (issue.type || '').toLowerCase()

  if (normalizedType.includes('team')) {
    return '/workspace/teams'
  }

  if (normalizedType.includes('shift')) {
    return '/workspace/shifts'
  }

  if (normalizedType.includes('time zone') || normalizedType.includes('staff')) {
    return '/workspace/staff'
  }

  return '/workspace/roster'
}

watch([year, month], () => {
  void loadValidation()
}, { immediate: true })
</script>

<template>
  <div class="flex h-full flex-col bg-slate-50">
    <div class="flex-1 overflow-auto p-6 xl:p-8">
      <div class="mx-auto flex max-w-[1280px] flex-col gap-6">
        <WorkspacePageHeader
          title="Validation Center"
          :description="`Issue workbench for ${monthLabel}: prioritize blockers, resolve what can be automated, and route the rest to the right workspace page.`"
        >
          <template #actions>
            <button
              class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
              @click="loadValidation"
            >
              <RefreshCw class="h-4 w-4" />
              Refresh
            </button>
            <button
              v-if="!authStore.isReadonly"
              class="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="resolvableSelectedIssueIds.length === 0 || resolvePending"
              @click="resolveSelectedIssues"
            >
              <CheckSquare class="h-4 w-4" />
              {{ resolvePending ? 'Resolving...' : `Resolve Selected (${resolvableSelectedIssueIds.length})` }}
            </button>
          </template>
        </WorkspacePageHeader>

        <WorkspaceSurface v-if="errorMessage" tone="muted" class="border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          <div class="flex items-center justify-between gap-4">
            <span>{{ errorMessage }}</span>
            <button class="rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100" @click="loadValidation">
              Retry
            </button>
          </div>
        </WorkspaceSurface>

        <WorkspaceSurface v-if="actionErrorMessage" tone="muted" class="border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {{ actionErrorMessage }}
        </WorkspaceSurface>

        <WorkspaceSurface v-if="actionMessage" class="border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {{ actionMessage }}
        </WorkspaceSurface>

        <div class="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
          <WorkspaceSurface
            :padded="false"
            class="overflow-hidden border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(248,113,113,0.14),transparent_32%),linear-gradient(180deg,#ffffff,rgba(248,250,252,0.98))]"
          >
            <div class="grid gap-8 px-6 py-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-8">
              <div class="space-y-5">
                <div class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <Sparkles class="h-3.5 w-3.5 text-amber-500" />
                  Validation workbench
                </div>

                <div>
                  <h2 class="max-w-2xl text-3xl font-semibold tracking-tight text-slate-950 lg:text-[2.4rem]">
                    {{ loading ? 'Refreshing validation signals...' : focusHeadline }}
                  </h2>
                  <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-600 lg:text-[15px]">
                    {{ focusNarrative }}
                  </p>
                </div>

                <div class="grid gap-3 sm:grid-cols-3">
                  <div class="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                    <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Total issues</div>
                    <div class="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{{ totalIssueCount }}</div>
                    <div class="mt-1 text-xs leading-6 text-slate-500">Across all validation sources for {{ monthLabel }}.</div>
                  </div>
                  <div class="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                    <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Auto-fixable</div>
                    <div class="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{{ resolvableIssueCount }}</div>
                    <div class="mt-1 text-xs leading-6 text-slate-500">Can be resolved directly from this page.</div>
                  </div>
                  <div class="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                    <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Manual follow-up</div>
                    <div class="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{{ manualOnlyCount }}</div>
                    <div class="mt-1 text-xs leading-6 text-slate-500">Need routing to roster, staff, shift, or team maintenance.</div>
                  </div>
                </div>
              </div>

              <div
                v-if="prioritizedIssue"
                :class="[
                  'rounded-[28px] border p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)]',
                  severityMeta[prioritizedIssue.severity].panel,
                ]"
              >
                <div class="flex items-center justify-between gap-4">
                  <div
                    :class="[
                      'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]',
                      severityMeta[prioritizedIssue.severity].badge,
                    ]"
                  >
                    <component :is="severityMeta[prioritizedIssue.severity].icon" class="h-3.5 w-3.5" />
                    {{ severityMeta[prioritizedIssue.severity].eyebrow }}
                  </div>
                  <span
                    :class="[
                      'inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
                      sourceMeta[prioritizedIssue.resolutionKind].badge,
                    ]"
                  >
                    {{ prioritizedIssue.sourceLabel }}
                  </span>
                </div>

                <div class="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Priority issue</div>
                <div class="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{{ prioritizedIssue.type }}</div>
                <div class="mt-2 text-sm leading-7 text-slate-600">{{ prioritizedIssue.description }}</div>

                <div class="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div class="rounded-2xl bg-white/85 p-3">
                    <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Team</div>
                    <div class="mt-1 font-semibold text-slate-900">{{ prioritizedIssue.team || '-' }}</div>
                  </div>
                  <div class="rounded-2xl bg-white/85 p-3">
                    <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Date</div>
                    <div class="mt-1 font-semibold text-slate-900">{{ prioritizedIssue.date || '-' }}</div>
                  </div>
                </div>

                <div class="mt-5 flex flex-wrap gap-2">
                  <button
                    v-if="prioritizedIssue.resolvable && !authStore.isReadonly"
                    class="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
                    :disabled="resolvePending"
                    @click="resolveSingleIssue(prioritizedIssue.id)"
                  >
                    <Wrench class="h-3.5 w-3.5" />
                    {{ isResolving(prioritizedIssue.id) ? 'Fixing...' : 'Fix now' }}
                  </button>
                  <RouterLink
                    :to="getIssueTarget(prioritizedIssue)"
                    class="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-white"
                  >
                    Open related area
                    <ArrowRight class="h-3.5 w-3.5" />
                  </RouterLink>
                </div>
              </div>
            </div>
          </WorkspaceSurface>

          <WorkspaceSurface :padded="false" class="overflow-hidden">
            <div class="border-b border-slate-100 px-6 py-5">
              <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Severity queue</div>
              <h2 class="mt-2 text-lg font-semibold tracking-tight text-slate-900">What needs attention now</h2>
            </div>
            <div class="space-y-3 px-4 py-4">
              <div
                v-for="severity in ['high', 'medium', 'low']"
                :key="severity"
                :class="[
                  'rounded-2xl border p-4',
                  severityMeta[severity].mutedPanel,
                ]"
              >
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{{ severityMeta[severity].eyebrow }}</div>
                    <div class="mt-1 text-sm font-semibold text-slate-900">{{ severityMeta[severity].label }}</div>
                  </div>
                  <div class="text-2xl font-semibold tracking-tight text-slate-950">
                    {{ severityCounts[severity] || 0 }}
                  </div>
                </div>
                <div class="mt-2 text-xs leading-6 text-slate-600">{{ severityMeta[severity].description }}</div>
              </div>

              <div class="rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
                <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-500">Import-linked</div>
                <div class="mt-1 text-sm font-semibold text-slate-900">{{ importIssueCount }} unresolved import issue(s)</div>
                <div class="mt-2 text-xs leading-6 text-slate-600">These can usually be reviewed from Import / Export and auto-resolved if the data is no longer blocking.</div>
              </div>
            </div>
          </WorkspaceSurface>
        </div>

        <WorkspaceSurface :padded="false" class="overflow-hidden">
          <div class="border-b border-slate-100 bg-slate-50/50 p-4">
            <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div class="relative max-w-md flex-1">
                <label for="workspace-validation-search" class="sr-only">Search validation issues</label>
                <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="workspace-validation-search"
                  name="workspace-validation-search"
                  v-model="searchTerm"
                  type="text"
                  placeholder="Search by type, description, team, date, or source..."
                  class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-700 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <button
                  v-for="option in [
                    { value: 'all', label: 'All severities' },
                    { value: 'high', label: 'Critical' },
                    { value: 'medium', label: 'Warnings' },
                    { value: 'low', label: 'Notices' },
                  ]"
                  :key="option.value"
                  :class="[
                    'rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors',
                    selectedSeverity === option.value ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100',
                  ]"
                  @click="selectedSeverity = option.value"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div class="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div class="flex flex-wrap items-center gap-2">
                <button
                  v-for="option in [
                    { value: 'all', label: 'All sources' },
                    { value: 'resolvable', label: 'Auto-fixable' },
                    { value: 'manual-only', label: 'Manual only' },
                    { value: 'import-issue', label: 'Import pipeline' },
                    { value: 'live-data', label: 'Live data' },
                  ]"
                  :key="option.value"
                  :class="[
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    selectedSource === option.value ? 'border-teal-200 bg-teal-50 text-teal-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100',
                  ]"
                  @click="selectedSource = option.value"
                >
                  {{ option.label }}
                </button>
              </div>

              <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span class="rounded-full border border-slate-200 bg-white px-3 py-1.5">
                  {{ visibleIssues.length }} visible
                </span>
                <span class="rounded-full border border-slate-200 bg-white px-3 py-1.5">
                  {{ selectedIssueIds.length }} selected
                </span>
                <button
                  class="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100"
                  @click="toggleAll"
                >
                  {{ allVisibleSelected ? 'Clear visible selection' : 'Select visible' }}
                </button>
              </div>
            </div>
          </div>

          <div class="space-y-6 p-4">
            <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              Loading validation results...
            </div>

            <div
              v-else-if="!visibleIssues.length"
              class="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500"
            >
              No validation issues matched the current filter.
            </div>

            <section
              v-for="group in issueGroups"
              :key="group.severity"
              class="space-y-4"
            >
              <div class="flex items-center justify-between gap-4">
                <div>
                  <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{{ group.meta.eyebrow }}</div>
                  <h2 class="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                    {{ group.meta.label }} issues
                    <span class="text-slate-400">({{ group.items.length }})</span>
                  </h2>
                </div>
                <span
                  :class="[
                    'inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]',
                    group.meta.badge,
                  ]"
                >
                  {{ group.meta.description }}
                </span>
              </div>

              <div class="grid gap-4">
                <article
                  v-for="issue in group.items"
                  :key="issue.id"
                  :class="[
                    'rounded-[26px] border bg-white p-5 shadow-sm transition-all',
                    group.meta.mutedPanel,
                    selectedIssueIds.includes(issue.id) ? 'ring-2 ring-teal-500/30' : 'hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.06)]',
                  ]"
                >
                  <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div class="flex items-start gap-4">
                      <input
                        :id="`workspace-validation-issue-${issue.id}`"
                        :name="`workspace-validation-issue-${issue.id}`"
                        type="checkbox"
                        :aria-label="`Select validation issue ${issue.type}`"
                        class="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        :checked="selectedIssueIds.includes(issue.id)"
                        @change="toggleIssue(issue.id)"
                      />

                      <div class="min-w-0">
                        <div class="flex flex-wrap items-center gap-2">
                          <span
                            :class="[
                              'inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
                              severityMeta[issue.severity].badge,
                            ]"
                          >
                            {{ severityMeta[issue.severity].label }}
                          </span>
                          <span
                            :class="[
                              'inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
                              sourceMeta[issue.resolutionKind].badge,
                            ]"
                          >
                            {{ issue.sourceLabel }}
                          </span>
                          <span
                            :class="cn(
                              'inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
                              issue.resolvable ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-600',
                            )"
                          >
                            {{ issue.resolvable ? 'Auto-fixable' : 'Manual only' }}
                          </span>
                        </div>

                        <h3 class="mt-3 text-base font-semibold tracking-tight text-slate-950">{{ issue.type }}</h3>
                        <p class="mt-2 max-w-3xl text-sm leading-7 text-slate-600">{{ issue.description }}</p>

                        <div class="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span class="rounded-full border border-slate-200 bg-white px-3 py-1.5">Team: {{ issue.team || '-' }}</span>
                          <span class="rounded-full border border-slate-200 bg-white px-3 py-1.5">Date: {{ issue.date || '-' }}</span>
                          <span class="rounded-full border border-slate-200 bg-white px-3 py-1.5">Issue ID: {{ issue.id }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="flex flex-wrap items-center gap-2 xl:justify-end">
                      <button
                        v-if="issue.resolvable && !authStore.isReadonly"
                        class="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
                        :disabled="resolvePending"
                        @click="resolveSingleIssue(issue.id)"
                      >
                        <Wrench class="h-3.5 w-3.5" />
                        {{ isResolving(issue.id) ? 'Fixing...' : 'Fix now' }}
                      </button>

                      <RouterLink
                        :to="getIssueTarget(issue)"
                        class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100"
                      >
                        Open related area
                        <ArrowRight class="h-3.5 w-3.5" />
                      </RouterLink>
                    </div>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </WorkspaceSurface>
      </div>
    </div>
  </div>
</template>
