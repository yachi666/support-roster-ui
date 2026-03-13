<script setup>
import { computed, onMounted, shallowRef } from 'vue'
import { AlertTriangle, ArrowRight, FileSpreadsheet, MoreHorizontal } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { api } from '@/api'
import OverviewStatCard from '../components/OverviewStatCard.vue'
import WorkspacePageHeader from '../components/WorkspacePageHeader.vue'
import WorkspaceSurface from '../components/WorkspaceSurface.vue'
import { getWorkspaceQuickActionTarget } from '../config/navigation'

const overviewStats = shallowRef([])
const activityEntries = shallowRef([])
const rawQuickActions = shallowRef([])
const loading = shallowRef(false)
const errorMessage = shallowRef('')

const quickActions = computed(() =>
  rawQuickActions.value.map((action) => ({
    ...action,
    to: getWorkspaceQuickActionTarget(action.actionKey),
  })),
)

async function loadOverview() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await api.workspace.getOverview()
    overviewStats.value = response?.stats || []
    activityEntries.value = response?.activity || []
    rawQuickActions.value = response?.quickActions || []
  } catch (error) {
    errorMessage.value = error.message || 'Failed to load workspace overview.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadOverview()
})
</script>

<template>
  <div class="mx-auto max-w-[1200px] space-y-8 p-8">
    <WorkspacePageHeader
      title="Overview Dashboard"
      description="Operational view of current roster health and recent admin activity."
    >
      <template #actions>
        <button class="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
          Generate Report
        </button>
        <RouterLink
          to="/workspace/import-export"
          class="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700"
        >
          Import Data
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

    <div v-if="overviewStats.length" class="grid gap-6 lg:grid-cols-4">
      <OverviewStatCard v-for="stat in overviewStats" :key="stat.label" :stat="stat" />
    </div>
    <WorkspaceSurface v-else class="p-6 text-sm text-slate-500">
      {{ loading ? 'Loading overview metrics...' : 'No overview metrics returned by the server.' }}
    </WorkspaceSurface>

    <div class="grid gap-6 lg:grid-cols-3">
      <WorkspaceSurface class="lg:col-span-2" :padded="false">
        <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 class="text-sm font-semibold text-slate-800">Recent Roster Activity</h2>
          <button class="text-xs font-medium text-teal-600 transition-colors hover:text-teal-700">View All</button>
        </div>
        <div class="space-y-6 p-6">
          <div v-if="loading && !activityEntries.length" class="text-sm text-slate-500">Loading recent activity...</div>
          <div v-else-if="!activityEntries.length" class="text-sm text-slate-500">No recent activity returned by the server.</div>
          <div v-for="entry in activityEntries" :key="`${entry.user}-${entry.time}`" class="flex items-start gap-4">
            <div class="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600">
              {{ entry.user?.[0] || '?' }}
            </div>
            <div>
              <p class="text-sm text-slate-700">
                <span class="font-medium">{{ entry.user }}</span>
                <span class="text-slate-500"> {{ entry.action }}</span>
              </p>
              <p class="mt-1 text-xs text-slate-400">{{ entry.time }}</p>
            </div>
          </div>
        </div>
      </WorkspaceSurface>

      <WorkspaceSurface :padded="false">
        <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 class="text-sm font-semibold text-slate-800">Quick Actions</h2>
          <MoreHorizontal class="h-4 w-4 text-slate-400" />
        </div>
        <div class="space-y-2 p-4">
          <div v-if="loading && !quickActions.length" class="px-2 py-3 text-sm text-slate-500">Loading quick actions...</div>
          <div v-else-if="!quickActions.length" class="px-2 py-3 text-sm text-slate-500">No quick actions returned by the server.</div>
          <RouterLink
            v-for="action in quickActions"
            :key="action.title"
            :to="action.to"
            class="group flex items-center justify-between rounded-lg border border-transparent p-3 text-left transition-all hover:border-slate-100 hover:bg-slate-50"
          >
            <div class="flex items-center gap-3">
              <div
                :class="[
                  'flex h-8 w-8 items-center justify-center rounded transition-colors',
                  action.variant === 'rose' ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-100' : 'bg-teal-50 text-teal-600 group-hover:bg-teal-100'
                ]"
              >
                <AlertTriangle v-if="action.icon === 'AlertTriangle'" class="h-4 w-4" />
                <FileSpreadsheet v-else class="h-4 w-4" />
              </div>
              <div>
                <div class="text-sm font-medium text-slate-700">{{ action.title }}</div>
                <div class="mt-0.5 text-xs text-slate-500">{{ action.subtitle }}</div>
              </div>
            </div>
            <ArrowRight class="h-4 w-4 text-slate-300 transition-colors group-hover:text-teal-500" />
          </RouterLink>
        </div>
      </WorkspaceSurface>
    </div>
  </div>
</template>
