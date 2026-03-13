<script setup>
import { computed, shallowRef, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  AlertTriangle,
  CalendarDays,
  Clock3,
  LayoutDashboard,
  Network,
  UploadCloud,
  Users,
} from 'lucide-vue-next'
import { api } from '@/api'
import { cn } from '@/lib/utils'
import { workspaceNavigation } from '../config/navigation'
import { useWorkspacePeriod } from '../composables/useWorkspacePeriod'

const route = useRoute()
const validationIssueCount = shallowRef(null)
const { year, month } = useWorkspacePeriod()

const iconMap = {
  AlertTriangle,
  CalendarDays,
  Clock3,
  LayoutDashboard,
  Network,
  UploadCloud,
  Users,
}

async function loadValidationIssueCount() {
  try {
    const response = await api.workspace.getValidation(year.value, month.value)
    validationIssueCount.value = response?.issues?.length ?? 0
  } catch {
    validationIssueCount.value = null
  }
}

const navigation = computed(() =>
  workspaceNavigation.map((item) => ({
    ...item,
    count: item.to === '/workspace/validation' ? validationIssueCount.value : undefined,
    active: item.to === '/workspace' ? route.path === '/workspace' : route.path.startsWith(item.to),
  })),
)

watch([year, month], () => {
  void loadValidationIssueCount()
}, { immediate: true })
</script>

<template>
  <aside class="flex h-screen w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-white shadow-[1px_0_4px_rgba(15,23,42,0.03)]">
    <div class="flex h-16 items-center border-b border-slate-100 px-6">
      <div class="flex items-center gap-2 text-slate-800">
        <div class="flex h-7 w-7 items-center justify-center rounded bg-teal-600 text-white shadow-sm">
          <CalendarDays class="h-4 w-4" />
        </div>
        <div>
          <div class="text-sm font-semibold tracking-tight">Roster Workspace</div>
          <div class="text-[11px] text-slate-400">Admin control center</div>
        </div>
      </div>
    </div>

    <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-6">
      <div class="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Menu</div>
      <RouterLink
        v-for="item in navigation"
        :key="item.label"
        :to="item.to"
        :class="cn(
          'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
          item.active
            ? 'bg-teal-50 text-teal-700 shadow-sm shadow-teal-100/50'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        )"
      >
        <component
          :is="iconMap[item.icon]"
          :class="cn(
            'h-4 w-4 flex-shrink-0 transition-colors',
            item.active ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'
          )"
        />
        <span class="flex-1">{{ item.label }}</span>
        <span
          v-if="item.count"
          :class="cn(
            'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold',
            item.active ? 'bg-teal-100 text-teal-700' : 'bg-rose-100 text-rose-600'
          )"
        >
          {{ item.count }}
        </span>
      </RouterLink>
    </nav>

    <div class="border-t border-slate-100 p-4">
      <div class="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-slate-50">
        <div class="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-slate-200 text-xs font-semibold text-slate-600">
          SA
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-medium text-slate-700">Sarah Admin</span>
          <span class="text-[11px] text-slate-500">Super Admin</span>
        </div>
      </div>
    </div>
  </aside>
</template>
