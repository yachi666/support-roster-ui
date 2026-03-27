<script setup>
import { computed, shallowRef, watch } from 'vue'
import { RouterLink } from 'vue-router'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckSquare,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Wrench,
} from 'lucide-vue-next'
import { api } from '@/api'
import { cn } from '@/lib/utils'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import WorkspaceModal from '../components/WorkspaceModal.vue'
import WorkspacePageHeader from '../components/WorkspacePageHeader.vue'
import WorkspaceSurface from '../components/WorkspaceSurface.vue'
import { useWorkspacePeriod } from '../composables/useWorkspacePeriod'

const searchTerm = shallowRef('')
const selectedSeverity = shallowRef('all')
const selectedSource = shallowRef('all')
const selectedIssueIds = shallowRef([])
const issues = shallowRef([])
const summary = shallowRef({ high: 0, medium: 0, low: 0, total: 0, blocking: 0 })
const topIssue = shallowRef(null)
const loading = shallowRef(false)
const errorMessage = shallowRef('')
const actionMessage = shallowRef('')
const actionErrorMessage = shallowRef('')
const resolvePending = shallowRef(false)
const resolvingIssueIds = shallowRef([])
const remediationModalOpen = shallowRef(false)
const remediationPreviewLoading = shallowRef(false)
const remediationPreviewError = shallowRef('')
const remediationApplyPending = shallowRef(false)
const remediationPreview = shallowRef(null)
const remediationIssue = shallowRef(null)
const { year, month, monthLabel } = useWorkspacePeriod()
const authStore = useAuthStore()
const { t } = useI18n()

const severityMeta = {
  high: {
    label: t('workspace.validation.severity.critical'),
    eyebrow: t('workspace.validation.severity.criticalEyebrow'),
    description: t('workspace.validation.severity.criticalDesc'),
    badge: 'border-rose-200 bg-rose-50 text-rose-700',
    panel: 'border-rose-200 bg-[linear-gradient(135deg,rgba(255,241,242,0.98),rgba(255,255,255,0.96))]',
    mutedPanel: 'border-rose-100 bg-rose-50/70',
    icon: ShieldAlert,
  },
  medium: {
    label: t('workspace.validation.severity.warning'),
    eyebrow: t('workspace.validation.severity.warningEyebrow'),
    description: t('workspace.validation.severity.warningDesc'),
    badge: 'border-amber-200 bg-amber-50 text-amber-700',
    panel: 'border-amber-200 bg-[linear-gradient(135deg,rgba(255,251,235,0.98),rgba(255,255,255,0.96))]',
    mutedPanel: 'border-amber-100 bg-amber-50/70',
    icon: AlertTriangle,
  },
  low: {
    label: t('workspace.validation.severity.notice'),
    eyebrow: t('workspace.validation.severity.noticeEyebrow'),
    description: t('workspace.validation.severity.noticeDesc'),
    badge: 'border-sky-200 bg-sky-50 text-sky-700',
    panel: 'border-sky-200 bg-[linear-gradient(135deg,rgba(240,249,255,0.98),rgba(255,255,255,0.96))]',
    mutedPanel: 'border-sky-100 bg-sky-50/70',
    icon: AlertCircle,
  },
}

const sourceMeta = {
  'import-issue': {
    label: t('workspace.validation.source.importIssue'),
    badge: 'border-violet-200 bg-violet-50 text-violet-700',
  },
  manual: {
    label: t('workspace.validation.source.manual'),
    badge: 'border-slate-200 bg-slate-100 text-slate-700',
  },
  'system-cleanup': {
    label: t('workspace.validation.source.systemCleanup'),
    badge: 'border-rose-200 bg-rose-50 text-rose-700',
  },
}

async function loadValidation() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await api.workspace.getValidation(year.value, month.value)
    issues.value = response?.issues || []
    summary.value = response?.summary || { high: 0, medium: 0, low: 0, total: 0, blocking: 0 }
    topIssue.value = response?.topIssue || null
    selectedIssueIds.value = []
    actionMessage.value = ''
    actionErrorMessage.value = ''
  } catch (error) {
    errorMessage.value = error.message || 'Failed to load validation results.'
  } finally {
    loading.value = false
  }
}

function normalizeIssue(issue) {
  if (!issue) {
    return null
  }

  const severity = severityMeta[issue.severity] ? issue.severity : 'low'
  const resolutionKind = ['import-issue', 'system-cleanup'].includes(issue.resolutionKind) ? issue.resolutionKind : 'manual'
  const remediation = issue.remediation || null

  return {
    ...issue,
    severity,
    blocking: Boolean(issue.blocking),
    domain: issue.domain || 'configuration',
    targetPage: issue.targetPage || '',
    resolutionKind,
    remediation,
    autoFixable: Boolean(issue.resolvable || remediation?.previewable),
    sourceLabel: sourceMeta[resolutionKind].label,
  }
}

const normalizedIssues = computed(() =>
  issues.value.map((issue) => normalizeIssue(issue)),
)

const normalizedTopIssue = computed(() => normalizeIssue(topIssue.value))

const visibleIssues = computed(() => {
  const query = searchTerm.value.trim().toLowerCase()

  return normalizedIssues.value.filter((issue) => {
    if (selectedSeverity.value !== 'all' && issue.severity !== selectedSeverity.value) {
      return false
    }

    if (selectedSource.value !== 'all') {
      if (selectedSource.value === 'resolvable' && !issue.autoFixable) {
        return false
      }

      if (selectedSource.value === 'manual-only' && issue.autoFixable) {
        return false
      }

      if (selectedSource.value === 'import-issue' && issue.resolutionKind !== 'import-issue') {
        return false
      }

      if (selectedSource.value === 'live-data' && issue.resolutionKind === 'import-issue') {
        return false
      }

      if (selectedSource.value === 'system-cleanup' && issue.resolutionKind !== 'system-cleanup') {
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

const totalIssueCount = computed(() => summary.value.total ?? normalizedIssues.value.length)
const blockingIssueCount = computed(() => summary.value.blocking ?? normalizedIssues.value.filter((issue) => issue.blocking).length)
const hasIssues = computed(() => totalIssueCount.value > 0)
const expandedIssueMode = computed(() => totalIssueCount.value >= 4)
const followUpIssueCount = computed(() => Math.max(0, totalIssueCount.value - blockingIssueCount.value))

function canResolveImportIssue(issue) {
  return issue?.resolutionKind === 'import-issue'
    && Boolean(issue?.resolvable)
    && authStore.canEditTeam(issue?.teamId)
}

function canPreviewRemediation(issue) {
  return Boolean(issue?.remediation?.previewable)
    && issue?.remediation?.requiresRole === 'admin'
    && authStore.isAdmin
}

function canFixIssue(issue) {
  return canResolveImportIssue(issue) || canPreviewRemediation(issue)
}

const resolvableSelectedIssueIds = computed(() =>
  selectedIssueIds.value.filter((issueId) => canResolveImportIssue(normalizedIssues.value.find((issue) => issue.id === issueId))),
)

const visibleIssueIds = computed(() => visibleIssues.value.map((issue) => issue.id))
const allVisibleSelected = computed(() =>
  visibleIssueIds.value.length > 0 && visibleIssueIds.value.every((id) => selectedIssueIds.value.includes(id)),
)

function issueSeverityWeight(issue) {
  if (issue.severity === 'high') {
    return 0
  }
  if (issue.severity === 'medium') {
    return 1
  }
  return 2
}

function compareIssues(left, right) {
  if (left.blocking !== right.blocking) {
    return left.blocking ? -1 : 1
  }

  const severityGap = issueSeverityWeight(left) - issueSeverityWeight(right)
  if (severityGap !== 0) {
    return severityGap
  }

  if (left.resolvable !== right.resolvable) {
    return left.resolvable ? -1 : 1
  }

  return String(left.id).localeCompare(String(right.id))
}

const prioritizedIssue = computed(() => {
  if (normalizedTopIssue.value) {
    return normalizedTopIssue.value
  }

  const ordered = [...normalizedIssues.value].sort(compareIssues)

  return ordered[0] ?? null
})

const focusHeadline = computed(() => {
  if (!prioritizedIssue.value) {
    return t('workspace.validation.noIssuesHeadline')
  }

  if (prioritizedIssue.value.severity === 'high') {
    return t('workspace.validation.topBlocker', { type: prioritizedIssue.value.type, monthLabel: monthLabel.value })
  }

  if (prioritizedIssue.value.severity === 'medium') {
    return t('workspace.validation.reviewNext', { type: prioritizedIssue.value.type })
  }

  return t('workspace.validation.noUrgentBlockers', { monthLabel: monthLabel.value })
})

const focusNarrative = computed(() => {
  if (!prioritizedIssue.value) {
    return t('workspace.validation.noIssuesNarrative')
  }

  return prioritizedIssue.value.description
})

const orderedVisibleIssues = computed(() =>
  [...visibleIssues.value].sort(compareIssues),
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
  const resolvableIssueIds = issueIds.filter((issueId) => canResolveImportIssue(normalizedIssues.value.find((issue) => issue.id === issueId)))
  if (!resolvableIssueIds.length || resolvePending.value) {
    return
  }

  resolvePending.value = true
  actionErrorMessage.value = ''
  actionMessage.value = ''
  resolvingIssueIds.value = resolvableIssueIds

  try {
    const response = await api.workspace.resolveValidationIssues({
      year: year.value,
      month: month.value,
      issueIds: resolvableIssueIds,
    })

    summary.value = response?.validation?.summary || { high: 0, medium: 0, low: 0, total: 0, blocking: 0 }
    issues.value = response?.validation?.issues || []
    topIssue.value = response?.validation?.topIssue || null
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
  return resolvingIssueIds.value.includes(issueId) || (remediationApplyPending.value && remediationIssue.value?.id === issueId)
}

function showIssueId(issue) {
  return expandedIssueMode.value || issue?.resolutionKind === 'system-cleanup'
}

function closeRemediationModal() {
  remediationModalOpen.value = false
  remediationPreview.value = null
  remediationIssue.value = null
  remediationPreviewError.value = ''
  remediationPreviewLoading.value = false
  remediationApplyPending.value = false
}

async function openRemediationModal(issue) {
  if (!canPreviewRemediation(issue)) {
    return
  }

  remediationModalOpen.value = true
  remediationIssue.value = issue
  remediationPreview.value = null
  remediationPreviewError.value = ''
  remediationPreviewLoading.value = true

  try {
    remediationPreview.value = await api.workspace.previewValidationRemediation(issue.id, {
      year: year.value,
      month: month.value,
      actionKey: issue.remediation.actionKey,
    })
  } catch (error) {
    remediationPreviewError.value = error.message || 'Failed to load remediation preview.'
  } finally {
    remediationPreviewLoading.value = false
  }
}

async function applyRemediation() {
  const issue = remediationIssue.value
  if (!issue?.remediation || remediationApplyPending.value) {
    return
  }

  remediationApplyPending.value = true
  remediationPreviewError.value = ''
  actionErrorMessage.value = ''
  actionMessage.value = ''

  try {
    const response = await api.workspace.applyValidationRemediation(issue.id, {
      year: year.value,
      month: month.value,
      actionKey: issue.remediation.actionKey,
    })

    summary.value = response?.validation?.summary || { high: 0, medium: 0, low: 0, total: 0, blocking: 0 }
    issues.value = response?.validation?.issues || []
    topIssue.value = response?.validation?.topIssue || null
    selectedIssueIds.value = selectedIssueIds.value.filter((id) => id !== issue.id)
    actionMessage.value = t('workspace.validation.remediationSuccess', { count: response?.appliedCount || 0 })
    closeRemediationModal()
  } catch (error) {
    remediationPreviewError.value = error.message || 'Failed to apply validation remediation.'
    actionErrorMessage.value = remediationPreviewError.value
  } finally {
    remediationApplyPending.value = false
  }
}

function triggerIssueAction(issue) {
  if (canPreviewRemediation(issue)) {
    void openRemediationModal(issue)
    return
  }
  if (canResolveImportIssue(issue)) {
    resolveSingleIssue(issue.id)
  }
}

function remediationCopy(preview) {
  const actionKey = preview?.actionKey || ''
  if (actionKey === 'delete_invalid_team_scope') {
    return {
      title: t('workspace.validation.remediation.deleteInvalidTeamScope.title'),
      summary: t('workspace.validation.remediation.deleteInvalidTeamScope.summary'),
      warning: t('workspace.validation.remediation.deleteInvalidTeamScope.warning'),
    }
  }
  if (actionKey === 'delete_orphan_assignment') {
    return {
      title: t('workspace.validation.remediation.deleteOrphanAssignment.title'),
      summary: t('workspace.validation.remediation.deleteOrphanAssignment.summary'),
      warning: t('workspace.validation.remediation.deleteOrphanAssignment.warning'),
    }
  }
  return {
    title: preview?.title || t('workspace.validation.remediationModalTitle'),
    summary: preview?.summary || '',
    warning: preview?.warning || '',
  }
}

function getIssueTarget(issue) {
  if (issue?.targetPage) {
    return issue.targetPage
  }

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
          :title="t('workspace.validation.title')"
          :description="t('workspace.validation.description', { monthLabel })"
        >
          <template #actions>
            <button
              class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
              @click="loadValidation"
            >
              <RefreshCw class="h-4 w-4" />
              {{ t('workspace.validation.refresh') }}
            </button>
            <button
              v-if="authStore.canWriteWorkspace && expandedIssueMode"
              class="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="resolvableSelectedIssueIds.length === 0 || resolvePending"
              @click="resolveSelectedIssues"
            >
              <CheckSquare class="h-4 w-4" />
              {{ resolvePending ? t('workspace.validation.resolving') : t('workspace.validation.resolveSelected', { count: resolvableSelectedIssueIds.length }) }}
            </button>
          </template>
        </WorkspacePageHeader>

        <WorkspaceSurface v-if="errorMessage" tone="muted" class="border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          <div class="flex items-center justify-between gap-4">
            <span>{{ errorMessage }}</span>
            <button class="rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100" @click="loadValidation">
              {{ t('common.retry') }}
            </button>
          </div>
        </WorkspaceSurface>

        <WorkspaceSurface v-if="actionErrorMessage" tone="muted" class="border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {{ actionErrorMessage }}
        </WorkspaceSurface>

        <WorkspaceSurface v-if="actionMessage" class="border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {{ actionMessage }}
        </WorkspaceSurface>

        <div class="grid gap-6">
          <WorkspaceSurface
            :padded="false"
            class="overflow-hidden border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(248,113,113,0.14),transparent_32%),linear-gradient(180deg,#ffffff,rgba(248,250,252,0.98))]"
          >
            <div
              :class="[
                'grid gap-8 px-6 py-6 lg:px-8 lg:py-8',
                prioritizedIssue ? 'lg:grid-cols-[1.2fr_0.8fr]' : '',
              ]"
            >
              <div class="space-y-5">
                <div class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <Sparkles class="h-3.5 w-3.5 text-amber-500" />
                  {{ t('workspace.validation.issueInbox') }}
                </div>

                <div>
                  <h2 class="max-w-2xl text-3xl font-semibold tracking-tight text-slate-950 lg:text-[2.4rem]">
                    {{ loading ? t('workspace.validation.refreshingSignals') : focusHeadline }}
                  </h2>
                  <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-600 lg:text-[15px]">
                    {{ focusNarrative }}
                  </p>
                </div>

                <div class="grid gap-3 sm:grid-cols-2">
                  <div class="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                     <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{{ t('workspace.validation.totalIssues') }}</div>
                    <div class="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{{ totalIssueCount }}</div>
                     <div class="mt-1 text-xs leading-6 text-slate-500">{{ t('workspace.validation.totalIssuesHint', { monthLabel }) }}</div>
                  </div>
                  <div class="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                     <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{{ t('workspace.validation.blockingRisks') }}</div>
                    <div class="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{{ blockingIssueCount }}</div>
                     <div class="mt-1 text-xs leading-6 text-slate-500">{{ t('workspace.validation.blockingRisksHint') }}</div>
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
                  <span
                    :class="cn(
                      'inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
                      prioritizedIssue.blocking ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-200 bg-slate-100 text-slate-600',
                    )"
                  >
                    {{ prioritizedIssue.blocking ? t('workspace.validation.blockingBadge') : t('workspace.validation.followUpBadge') }}
                  </span>
                </div>

                <div class="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{{ t('workspace.validation.priorityIssue') }}</div>
                <div class="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{{ prioritizedIssue.type }}</div>
                <div class="mt-2 text-sm leading-7 text-slate-600">{{ prioritizedIssue.description }}</div>

                <div class="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div class="rounded-2xl bg-white/85 p-3">
                     <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{{ t('workspace.validation.team') }}</div>
                    <div class="mt-1 font-semibold text-slate-900">{{ prioritizedIssue.team || '-' }}</div>
                  </div>
                  <div class="rounded-2xl bg-white/85 p-3">
                     <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{{ t('workspace.validation.date') }}</div>
                    <div class="mt-1 font-semibold text-slate-900">{{ prioritizedIssue.date || '-' }}</div>
                  </div>
                </div>

                <div class="mt-5 flex flex-wrap gap-2">
                  <button
                    v-if="canFixIssue(prioritizedIssue)"
                    class="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
                    :disabled="resolvePending || remediationPreviewLoading"
                    @click="triggerIssueAction(prioritizedIssue)"
                  >
                    <Wrench class="h-3.5 w-3.5" />
                    {{ isResolving(prioritizedIssue.id) ? t('workspace.validation.fixing') : t('workspace.validation.fixNow') }}
                  </button>
                  <RouterLink
                    :to="getIssueTarget(prioritizedIssue)"
                    class="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-white"
                  >
                    {{ t('workspace.validation.openRelatedArea') }}
                    <ArrowRight class="h-3.5 w-3.5" />
                  </RouterLink>
                </div>
              </div>
            </div>
          </WorkspaceSurface>
        </div>

        <WorkspaceSurface :padded="false" class="overflow-hidden">
          <div class="border-b border-slate-100 bg-slate-50/50 p-4">
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{{ t('workspace.validation.issueList') }}</div>
                  <h2 class="mt-1 text-lg font-semibold tracking-tight text-slate-900">{{ t('workspace.validation.openIssues') }}</h2>
                  <p class="mt-1 text-sm text-slate-500">
                    {{
                      hasIssues
                        ? t('workspace.validation.issueListHint', { blocking: blockingIssueCount, followUp: followUpIssueCount })
                        : t('workspace.validation.emptyListHint')
                    }}
                  </p>
                </div>

                <div v-if="expandedIssueMode" class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span class="rounded-full border border-slate-200 bg-white px-3 py-1.5">
                    {{ t('workspace.validation.visibleCount', { count: visibleIssues.length }) }}
                  </span>
                  <span class="rounded-full border border-slate-200 bg-white px-3 py-1.5">
                    {{ t('workspace.validation.selectedCount', { count: selectedIssueIds.length }) }}
                  </span>
                  <button
                    class="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100"
                    @click="toggleAll"
                  >
                    {{ allVisibleSelected ? t('workspace.validation.clearVisibleSelection') : t('workspace.validation.selectVisible') }}
                  </button>
                </div>
              </div>

              <div v-if="expandedIssueMode" class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div class="relative max-w-md flex-1">
                  <label for="workspace-validation-search" class="sr-only">{{ t('workspace.validation.searchIssues') }}</label>
                  <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="workspace-validation-search"
                    name="workspace-validation-search"
                    v-model="searchTerm"
                    type="text"
                    :placeholder="t('workspace.validation.searchPlaceholder')"
                    class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-700 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <button
                    v-for="option in [
                      { value: 'all', label: t('workspace.validation.allSeverities') },
                      { value: 'high', label: t('workspace.validation.severity.critical') },
                      { value: 'medium', label: t('workspace.validation.warnings') },
                      { value: 'low', label: t('workspace.validation.notices') },
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

              <div v-if="expandedIssueMode" class="flex flex-wrap items-center gap-2">
                <button
                  v-for="option in [
                    { value: 'all', label: t('workspace.validation.allSources') },
                    { value: 'resolvable', label: t('workspace.validation.autoFixable') },
                    { value: 'manual-only', label: t('workspace.validation.manualOnly') },
                    { value: 'import-issue', label: t('workspace.validation.importPipeline') },
                    { value: 'live-data', label: t('workspace.validation.liveData') },
                    { value: 'system-cleanup', label: t('workspace.validation.source.systemCleanup') },
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
            </div>
          </div>

          <div class="space-y-6 p-4">
            <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
               {{ t('workspace.validation.loadingResults') }}
            </div>

            <div
              v-else-if="!visibleIssues.length"
              class="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500"
            >
               {{ t('workspace.validation.empty') }}
            </div>

            <div v-else class="grid gap-4">
              <article
                v-for="issue in orderedVisibleIssues"
                :key="issue.id"
                :class="[
                  'rounded-[26px] border bg-white p-5 shadow-sm transition-all',
                  severityMeta[issue.severity].mutedPanel,
                  selectedIssueIds.includes(issue.id) ? 'ring-2 ring-teal-500/30' : 'hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.06)]',
                ]"
              >
                <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div class="flex items-start gap-4">
                    <input
                      v-if="expandedIssueMode"
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
                          :class="cn(
                            'inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
                            issue.blocking ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-200 bg-slate-100 text-slate-600',
                          )"
                        >
                          {{ issue.blocking ? t('workspace.validation.blockingBadge') : t('workspace.validation.followUpBadge') }}
                        </span>
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
                            issue.autoFixable ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-600',
                          )"
                        >
                          {{ issue.autoFixable ? t('workspace.validation.autoFixableBadge') : t('workspace.validation.manualOnlyBadge') }}
                        </span>
                      </div>

                      <h3 class="mt-3 text-base font-semibold tracking-tight text-slate-950">{{ issue.type }}</h3>
                      <p class="mt-2 max-w-3xl text-sm leading-7 text-slate-600">{{ issue.description }}</p>

                      <div class="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span class="rounded-full border border-slate-200 bg-white px-3 py-1.5">{{ t('workspace.validation.team') }}: {{ issue.team || '-' }}</span>
                        <span class="rounded-full border border-slate-200 bg-white px-3 py-1.5">{{ t('workspace.validation.date') }}: {{ issue.date || '-' }}</span>
                        <span v-if="showIssueId(issue)" class="rounded-full border border-slate-200 bg-white px-3 py-1.5">{{ t('workspace.validation.issueId', { id: issue.id }) }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="flex flex-wrap items-center gap-2 xl:justify-end">
                    <button
                      v-if="canFixIssue(issue)"
                      class="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
                      :disabled="resolvePending || remediationPreviewLoading"
                      @click="triggerIssueAction(issue)"
                    >
                      <Wrench class="h-3.5 w-3.5" />
                      {{ isResolving(issue.id) ? t('workspace.validation.fixing') : t('workspace.validation.fixNow') }}
                    </button>

                    <RouterLink
                      :to="getIssueTarget(issue)"
                      class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100"
                    >
                      {{ t('workspace.validation.openRelatedArea') }}
                      <ArrowRight class="h-3.5 w-3.5" />
                    </RouterLink>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </WorkspaceSurface>
      </div>
    </div>

    <WorkspaceModal v-model="remediationModalOpen" :title="t('workspace.validation.remediationModalTitle')" width="680px">
      <template #subtitle>
        <p class="mt-1 text-sm text-slate-500">
          {{ remediationIssue?.type || t('workspace.validation.fixNow') }}
          <span v-if="remediationIssue"> · {{ t('workspace.validation.issueId', { id: remediationIssue.id }) }}</span>
        </p>
      </template>

      <div class="space-y-4">
        <WorkspaceSurface v-if="remediationPreviewError" tone="muted" class="border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {{ remediationPreviewError }}
        </WorkspaceSurface>

        <WorkspaceSurface v-else-if="remediationPreviewLoading" class="border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          {{ t('workspace.validation.loadingRemediationPreview') }}
        </WorkspaceSurface>

        <template v-else-if="remediationPreview">
          <WorkspaceSurface class="border-slate-200 bg-slate-50 p-4">
            <div class="text-sm font-semibold text-slate-900">{{ remediationCopy(remediationPreview).title }}</div>
            <p class="mt-2 text-sm leading-6 text-slate-600">{{ remediationCopy(remediationPreview).summary }}</p>
            <p v-if="remediationCopy(remediationPreview).warning" class="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {{ remediationCopy(remediationPreview).warning }}
            </p>
          </WorkspaceSurface>

          <WorkspaceSurface class="border-slate-200 bg-white p-4">
            <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{{ t('workspace.validation.remediationImpact') }}</div>
            <div class="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{{ remediationPreview.recordCount }}</div>
            <div class="mt-1 text-sm text-slate-500">{{ t('workspace.validation.remediationImpactHint') }}</div>
            <div class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="recordId in remediationPreview.recordIds || []"
                :key="recordId"
                class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600"
              >
                {{ t('workspace.validation.recordId', { id: recordId }) }}
              </span>
            </div>
          </WorkspaceSurface>
        </template>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <button
            type="button"
            class="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            @click="closeRemediationModal"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            type="button"
            class="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!remediationPreview || remediationPreviewLoading || remediationApplyPending"
            @click="applyRemediation"
          >
            {{ remediationApplyPending ? t('workspace.validation.applyingRemediation') : t('workspace.validation.confirmRemediation') }}
          </button>
        </div>
      </template>
    </WorkspaceModal>
  </div>
</template>
