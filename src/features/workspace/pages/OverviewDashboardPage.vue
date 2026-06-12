<script setup>
import { computed, shallowRef, watch } from 'vue'
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Clock3,
  FileSpreadsheet,
  History,
  RefreshCw,
  SearchX,
  ShieldCheck,
  UploadCloud,
  UserRound,
  Users,
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import WorkspacePageHeader from '../components/WorkspacePageHeader.vue'
import WorkspaceSurface from '../components/WorkspaceSurface.vue'
import { matchesWorkspaceSearch } from '../lib/workspaceSearch'
import { useWorkspacePageSearch } from '../composables/useWorkspacePageSearch'
import { useWorkspacePeriod } from '../composables/useWorkspacePeriod'

const activityEntries = shallowRef([])
const loading = shallowRef(false)
const errorMessage = shallowRef('')
const refreshedAt = shallowRef(null)
const selectedModule = shallowRef('all')
let overviewRequestId = 0

const { year, month, monthLabel, timezone } = useWorkspacePeriod()
const { t, locale } = useI18n()
const authStore = useAuthStore()
const searchTerm = useWorkspacePageSearch()

const moduleOptions = computed(() => [
  { key: 'all', label: t('workspace.overview.modules.all') },
  { key: 'roster', label: t('workspace.nav.roster') },
  { key: 'import', label: t('workspace.nav.importExport') },
  { key: 'validation', label: t('workspace.nav.validation') },
  { key: 'staff', label: t('workspace.nav.staff') },
  { key: 'shifts', label: t('workspace.nav.shifts') },
  { key: 'teams', label: t('workspace.nav.teams') },
  { key: 'accounts', label: t('workspace.nav.accounts') },
])

const continueLinks = computed(() => [
  {
    key: 'roster',
    title: t('workspace.nav.roster'),
    description: t('workspace.overview.continue.roster'),
    to: '/workspace/roster',
    icon: CalendarDays,
  },
  {
    key: 'import',
    title: t('workspace.nav.importExport'),
    description: t('workspace.overview.continue.importExport'),
    to: '/workspace/import-export',
    icon: UploadCloud,
  },
  {
    key: 'validation',
    title: t('workspace.nav.validation'),
    description: t('workspace.overview.continue.validation'),
    to: '/workspace/validation',
    icon: ShieldCheck,
  },
  {
    key: 'staff',
    title: t('workspace.nav.staff'),
    description: t('workspace.overview.continue.staff'),
    to: '/workspace/staff',
    icon: Users,
  },
])

const currentRoleLabel = computed(() => {
  if (!authStore.isAuthenticated) return t('workspace.roles.guest')
  if (authStore.isAdmin) return t('workspace.roles.admin')
  if (authStore.isEditor) return t('workspace.roles.editor')
  if (authStore.isReadonly) return t('workspace.roles.readonly')
  return t('workspace.roles.workspace')
})

const currentUserLabel = computed(() => authStore.workspaceUser?.staffName || t('workspace.roles.userFallback'))

const contextItems = computed(() => [
  {
    key: 'month',
    icon: CalendarDays,
    label: t('workspace.overview.context.month'),
    value: monthLabel.value,
  },
  {
    key: 'timezone',
    icon: Clock3,
    label: t('workspace.overview.context.timezone'),
    value: timezone.value,
  },
  {
    key: 'role',
    icon: UserRound,
    label: t('workspace.overview.context.signedInAs'),
    value: currentUserLabel.value,
    meta: currentRoleLabel.value,
  },
])

const activityTargetMap = {
  accounts: { to: '/workspace/accounts', pageCode: 'accounts', roles: ['admin'] },
  import: { to: '/workspace/import-export', pageCode: 'import-export' },
  roster: { to: '/workspace/roster', pageCode: 'roster' },
  shifts: { to: '/workspace/shifts', pageCode: 'shifts' },
  staff: { to: '/workspace/staff', pageCode: 'staff' },
  teams: { to: '/workspace/teams', pageCode: 'teams', roles: ['admin'] },
  validation: { to: '/workspace/validation', pageCode: 'validation' },
  workspace: { to: '/workspace/overview', pageCode: 'overview' },
}

function getActivityModule(entry) {
  const text = String(entry?.action || '').toLowerCase()

  if (/import|export|workbook|excel|file/.test(text)) return 'import'
  if (/validation|issue|resolve|remediation|cleanup/.test(text)) return 'validation'
  if (/staff|person|contact/.test(text)) return 'staff'
  if (/shift|definition/.test(text)) return 'shifts'
  if (/team|scope/.test(text)) return 'teams'
  if (/account|user|role|password/.test(text)) return 'accounts'
  if (/roster|assignment|schedule|save/.test(text)) return 'roster'
  return 'workspace'
}

function getActivityTarget(module) {
  const target = activityTargetMap[module] || activityTargetMap.workspace
  const roleAllowed = !target.roles || authStore.hasAnyRole(target.roles)

  if (!authStore.canAccessWorkspacePage(target.pageCode) || !roleAllowed) {
    return activityTargetMap.workspace.to
  }

  return target.to
}

function getActivityIcon(module) {
  if (module === 'import') return FileSpreadsheet
  if (module === 'validation') return AlertTriangle
  if (module === 'staff' || module === 'teams' || module === 'accounts') return Users
  if (module === 'shifts') return Clock3
  if (module === 'roster') return CalendarDays
  return History
}

function getModuleLabel(module) {
  return moduleOptions.value.find((item) => item.key === module)?.label || t('workspace.overview.modules.workspace')
}

function getModuleBadgeClass(module) {
  if (module === 'validation') return 'border-amber-200 bg-amber-50 text-amber-700'
  if (module === 'import') return 'border-sky-200 bg-sky-50 text-sky-700'
  if (module === 'staff' || module === 'teams' || module === 'accounts') return 'border-violet-200 bg-violet-50 text-violet-700'
  if (module === 'shifts') return 'border-slate-200 bg-slate-100 text-slate-700'
  if (module === 'roster') return 'border-teal-200 bg-teal-50 text-teal-700'
  return 'border-slate-200 bg-white text-slate-600'
}

const visibleActivity = computed(() =>
  activityEntries.value
    .map((entry, index) => {
      const module = getActivityModule(entry)

      return {
        ...entry,
        id: `${entry.user || 'user'}-${entry.time || 'time'}-${entry.action || 'action'}-${index}`,
        module,
        moduleLabel: getModuleLabel(module),
        icon: getActivityIcon(module),
        to: getActivityTarget(module),
      }
    })
    .filter((entry) => selectedModule.value === 'all' || entry.module === selectedModule.value)
    .filter((entry) =>
      matchesWorkspaceSearch([
        entry.user,
        entry.action,
        entry.time,
        entry.moduleLabel,
      ], searchTerm.value),
    ),
)

const activitySummary = computed(() => {
  const count = activityEntries.value.length
  const refreshed = refreshedAt.value
    ? new Intl.DateTimeFormat(locale.value, {
        hour: '2-digit',
        minute: '2-digit',
      }).format(refreshedAt.value)
    : t('workspace.overview.notLoaded')

  return t('workspace.overview.summary', { count, refreshed })
})

async function loadOverview() {
  const requestId = overviewRequestId + 1
  overviewRequestId = requestId
  const requestedYear = year.value
  const requestedMonth = month.value

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await api.workspace.getOverview(requestedYear, requestedMonth)

    if (requestId !== overviewRequestId) {
      return
    }

    activityEntries.value = response?.activity || []
    refreshedAt.value = new Date()
  } catch (error) {
    if (requestId !== overviewRequestId) {
      return
    }

    activityEntries.value = []
    refreshedAt.value = null
    errorMessage.value = error.message || t('workspace.overview.loadFailed')
  } finally {
    if (requestId === overviewRequestId) {
      loading.value = false
    }
  }
}

watch([year, month], () => {
  void loadOverview()
}, { immediate: true })
</script>

<template>
  <div class="min-h-full bg-[#fafafa]">
    <div class="mx-auto max-w-[1440px] space-y-5 p-6 xl:p-8">
      <WorkspacePageHeader
        :title="t('workspace.overview.title')"
        :description="t('workspace.overview.description')"
      >
        <template #actions>
          <div class="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500">
            {{ activitySummary }}
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            @click="loadOverview"
          >
            <RefreshCw :class="['h-4 w-4 text-slate-500', loading ? 'animate-spin' : '']" />
            {{ t('workspace.overview.refresh') }}
          </button>
        </template>
      </WorkspacePageHeader>

      <WorkspaceSurface
        v-if="errorMessage"
        tone="muted"
        class="border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span>{{ errorMessage }}</span>
          <button
            class="rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100"
            @click="loadOverview"
          >
            {{ t('common.retry') }}
          </button>
        </div>
      </WorkspaceSurface>

      <div class="grid gap-5 xl:grid-cols-[1fr_0.78fr]">
        <WorkspaceSurface :padded="false" class="overflow-hidden">
          <div class="border-b border-slate-100 px-6 py-5">
            <h2 class="text-base font-semibold text-slate-900">{{ t('workspace.overview.continueTitle') }}</h2>
          </div>
          <div class="divide-y divide-slate-100 px-5">
            <RouterLink
              v-for="item in continueLinks"
              :key="item.key"
              :to="item.to"
              class="group flex items-center gap-4 py-4 transition-colors hover:bg-slate-50/80"
            >
              <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100">
                <component :is="item.icon" class="h-5 w-5" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-sm font-semibold text-slate-900">{{ item.title }}</div>
                <div class="mt-1 text-sm text-slate-500">{{ item.description }}</div>
              </div>
              <ArrowRight class="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-slate-500" />
            </RouterLink>
          </div>
        </WorkspaceSurface>

        <WorkspaceSurface :padded="false" class="overflow-hidden">
          <div class="border-b border-slate-100 px-6 py-5">
            <h2 class="text-base font-semibold text-slate-900">{{ t('workspace.overview.contextTitle') }}</h2>
          </div>
          <div class="divide-y divide-slate-100 px-6">
            <div
              v-for="item in contextItems"
              :key="item.key"
              class="flex items-center gap-4 py-5"
            >
              <component :is="item.icon" class="h-5 w-5 flex-shrink-0 text-slate-500" />
              <div class="min-w-0">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-400">{{ item.label }}</div>
                <div class="mt-1 flex flex-wrap items-center gap-2 text-base font-semibold text-slate-900">
                  <span>{{ item.value }}</span>
                  <span
                    v-if="item.meta"
                    class="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700"
                  >
                    {{ item.meta }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </WorkspaceSurface>
      </div>

      <WorkspaceSurface :padded="false" class="overflow-hidden">
        <div class="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 class="text-base font-semibold text-slate-900">{{ t('workspace.overview.recentOperations') }}</h2>
            <p class="mt-1 text-sm text-slate-500">{{ t('workspace.overview.activityDescription') }}</p>
          </div>
          <div
            class="flex flex-wrap items-center gap-2"
            role="group"
            :aria-label="t('workspace.overview.moduleFilterLabel')"
          >
            <button
              v-for="item in moduleOptions"
              :key="item.key"
              type="button"
              :aria-pressed="selectedModule === item.key"
              :class="[
                'rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors',
                selectedModule === item.key
                  ? 'border-teal-600 bg-teal-50 text-teal-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
              ]"
              @click="selectedModule = item.key"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th class="w-44 px-6 py-3">{{ t('workspace.overview.table.when') }}</th>
                <th class="w-48 px-4 py-3">{{ t('workspace.overview.table.who') }}</th>
                <th class="w-44 px-4 py-3">{{ t('workspace.overview.table.module') }}</th>
                <th class="px-4 py-3">{{ t('workspace.overview.table.action') }}</th>
                <th class="w-16 px-6 py-3 text-right">{{ t('workspace.overview.table.open') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              <tr v-if="loading && !visibleActivity.length">
                <td colspan="5" class="px-6 py-10 text-sm text-slate-500">
                  {{ t('workspace.overview.loadingActivity') }}
                </td>
              </tr>
              <tr
                v-for="entry in visibleActivity"
                v-else
                :key="entry.id"
                class="transition-colors hover:bg-slate-50"
              >
                <td class="whitespace-nowrap px-6 py-3 font-mono text-xs text-slate-500">{{ entry.time }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      {{ entry.user?.[0] || '?' }}
                    </div>
                    <span class="font-medium text-slate-700">{{ entry.user || t('workspace.overview.unknownUser') }}</span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span :class="['inline-flex rounded-md border px-2 py-1 text-xs font-semibold', getModuleBadgeClass(entry.module)]">
                    {{ entry.moduleLabel }}
                  </span>
                </td>
                <td class="px-4 py-3 text-slate-700">
                  <div class="flex items-center gap-2">
                    <component :is="entry.icon" class="h-4 w-4 flex-shrink-0 text-slate-400" />
                    <span>{{ entry.action }}</span>
                  </div>
                </td>
                <td class="px-6 py-3 text-right">
                  <RouterLink
                    :to="entry.to"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                    :aria-label="t('workspace.overview.openActivity', { module: entry.moduleLabel, action: entry.action })"
                  >
                    <ArrowRight class="h-4 w-4" />
                  </RouterLink>
                </td>
              </tr>
              <tr v-if="!loading && !visibleActivity.length">
                <td colspan="5" class="px-6 py-8">
                  <div class="flex items-center gap-3 rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    <SearchX class="h-4 w-4 text-slate-400" />
                    <span>{{ activityEntries.length ? t('workspace.overview.noMatchingActivity') : t('workspace.overview.emptyActivity') }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </WorkspaceSurface>
    </div>
  </div>
</template>
