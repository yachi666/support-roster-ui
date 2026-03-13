<script setup>
import { computed, shallowRef, watch } from 'vue'
import { AlertCircle, AlertTriangle, ArrowRight, CheckSquare, Filter, PlayCircle, Search } from 'lucide-vue-next'
import { api } from '@/api'
import { cn } from '@/lib/utils'
import WorkspacePageHeader from '../components/WorkspacePageHeader.vue'
import WorkspaceSurface from '../components/WorkspaceSurface.vue'
import { useWorkspacePeriod } from '../composables/useWorkspacePeriod'

const searchTerm = shallowRef('')
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

const visibleIssues = computed(() => {
  const query = searchTerm.value.trim().toLowerCase()
  if (!query) {
    return issues.value
  }

  return issues.value.filter((issue) => {
    return [issue.type, issue.description, issue.team, issue.date].join(' ').toLowerCase().includes(query)
  })
})

const severityCounts = computed(() => summary.value)
const resolvableSelectedIssueIds = computed(() =>
  selectedIssueIds.value.filter((issueId) => issues.value.find((issue) => issue.id === issueId)?.resolvable),
)

function toggleIssue(issueId) {
  selectedIssueIds.value = selectedIssueIds.value.includes(issueId)
    ? selectedIssueIds.value.filter((id) => id !== issueId)
    : [...selectedIssueIds.value, issueId]
}

function toggleAll() {
  const currentIds = visibleIssues.value.map((issue) => issue.id)
  const allSelected = currentIds.length > 0 && currentIds.every((id) => selectedIssueIds.value.includes(id))

  selectedIssueIds.value = allSelected
    ? selectedIssueIds.value.filter((id) => !currentIds.includes(id))
    : Array.from(new Set([...selectedIssueIds.value, ...currentIds]))
}

async function resolveIssues(issueIds) {
  if (!issueIds.length || resolvePending.value) {
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

watch([year, month], () => {
  void loadValidation()
}, { immediate: true })
</script>

<template>
  <div class="flex h-full flex-col bg-slate-50">
    <div class="flex-1 overflow-auto p-8">
      <div class="mx-auto flex max-w-6xl flex-col gap-8">
        <WorkspacePageHeader
          title="Validation Center"
          :description="`Resolve scheduling conflicts and data integrity problems for ${monthLabel}.`"
        >
          <template #actions>
            <button class="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
              <Filter class="h-4 w-4" />
              All Severities
            </button>
            <button
              class="flex items-center gap-2 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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

        <div class="grid gap-6 md:grid-cols-3">
          <WorkspaceSurface class="relative overflow-hidden border-rose-200 p-5">
            <div class="absolute inset-y-0 left-0 w-1 bg-rose-500"></div>
            <div class="flex items-center gap-4 pl-2">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <AlertCircle class="h-6 w-6" />
              </div>
              <div>
                <div class="text-2xl font-semibold text-slate-800">{{ severityCounts.high }}</div>
                <div class="text-sm font-medium text-slate-500">Critical Errors</div>
              </div>
            </div>
          </WorkspaceSurface>

          <WorkspaceSurface class="relative overflow-hidden border-amber-200 p-5">
            <div class="absolute inset-y-0 left-0 w-1 bg-amber-500"></div>
            <div class="flex items-center gap-4 pl-2">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <AlertTriangle class="h-6 w-6" />
              </div>
              <div>
                <div class="text-2xl font-semibold text-slate-800">{{ severityCounts.medium }}</div>
                <div class="text-sm font-medium text-slate-500">Warnings</div>
              </div>
            </div>
          </WorkspaceSurface>

          <WorkspaceSurface class="relative overflow-hidden border-sky-200 p-5">
            <div class="absolute inset-y-0 left-0 w-1 bg-sky-500"></div>
            <div class="flex items-center gap-4 pl-2">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                <PlayCircle class="h-6 w-6" />
              </div>
              <div>
                <div class="text-2xl font-semibold text-slate-800">{{ severityCounts.low }}</div>
                <div class="text-sm font-medium text-slate-500">Notices</div>
              </div>
            </div>
          </WorkspaceSurface>
        </div>

        <WorkspaceSurface :padded="false" class="overflow-hidden">
          <div class="flex items-center gap-4 border-b border-slate-100 bg-slate-50/50 p-4">
            <div class="relative max-w-md flex-1">
              <label for="workspace-validation-search" class="sr-only">Search validation issues</label>
              <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="workspace-validation-search"
                name="workspace-validation-search"
                v-model="searchTerm"
                type="text"
                placeholder="Search issues..."
                class="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-700 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full text-left text-sm text-slate-600">
              <thead class="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th class="w-12 px-6 py-3">
                    <input
                      id="workspace-validation-select-all"
                      name="workspace-validation-select-all"
                      type="checkbox"
                      aria-label="Select all visible validation issues"
                      class="h-4 w-4 cursor-pointer rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      :checked="visibleIssues.length > 0 && visibleIssues.every((issue) => selectedIssueIds.includes(issue.id))"
                      @change="toggleAll"
                    />
                  </th>
                  <th class="w-24 px-6 py-3">Severity</th>
                  <th class="px-6 py-3">Issue Type & Description</th>
                  <th class="w-32 px-6 py-3">Team</th>
                  <th class="w-24 px-6 py-3">Date</th>
                  <th class="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="issue in visibleIssues"
                  :key="issue.id"
                  :class="cn('transition-colors hover:bg-slate-50/80', selectedIssueIds.includes(issue.id) && 'bg-teal-50/30')"
                >
                  <td class="px-6 py-4">
                    <input
                      :id="`workspace-validation-issue-${issue.id}`"
                      :name="`workspace-validation-issue-${issue.id}`"
                      type="checkbox"
                      :aria-label="`Select validation issue ${issue.type}`"
                      class="h-4 w-4 cursor-pointer rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      :checked="selectedIssueIds.includes(issue.id)"
                      @change="toggleIssue(issue.id)"
                    />
                  </td>
                  <td class="px-6 py-4">
                    <span
                      :class="[
                        'inline-flex rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider',
                        issue.severity === 'high' ? 'bg-rose-100 text-rose-700' : issue.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'
                      ]"
                    >
                      {{ issue.severity === 'medium' ? 'Med' : issue.severity }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="font-medium text-slate-800">{{ issue.type }}</div>
                    <div class="mt-0.5 text-slate-500">{{ issue.description }}</div>
                  </td>
                  <td class="px-6 py-4 text-slate-500">{{ issue.team }}</td>
                  <td class="px-6 py-4 font-mono text-xs text-slate-600">{{ issue.date }}</td>
                  <td class="px-6 py-4 text-right">
                    <button
                      v-if="issue.resolvable"
                      class="inline-flex items-center gap-1.5 rounded bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-600 transition-colors hover:bg-teal-100 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                      :disabled="resolvePending"
                      @click="resolveSingleIssue(issue.id)"
                    >
                      {{ isResolving(issue.id) ? 'Fixing...' : 'Fix' }}
                      <ArrowRight class="h-3 w-3" />
                    </button>
                    <span v-else class="inline-flex items-center rounded bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
                      Manual Only
                    </span>
                  </td>
                </tr>
                <tr v-if="loading">
                  <td colspan="6" class="px-6 py-10 text-center text-sm text-slate-500">Loading validation results...</td>
                </tr>
                <tr v-else-if="!visibleIssues.length">
                  <td colspan="6" class="px-6 py-10 text-center text-sm text-slate-500">No validation issues matched the current filter.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </WorkspaceSurface>
      </div>
    </div>
  </div>
</template>
