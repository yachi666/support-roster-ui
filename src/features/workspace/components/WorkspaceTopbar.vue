<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronLeft, ChevronRight, Globe, Search } from 'lucide-vue-next'
import { useWorkspacePeriod } from '../composables/useWorkspacePeriod'
import { WORKSPACE_TIMEZONE_OPTIONS } from '../config/timezones'

const {
  timezone,
  year,
  month,
  monthLabel,
  setWorkspaceTimezone,
  setWorkspaceYear,
  setWorkspaceMonth,
  goToPreviousMonth,
  goToNextMonth,
} = useWorkspacePeriod()

const monthOptions = [
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Feb' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' },
  { value: 5, label: 'May' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Aug' },
  { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dec' },
]

const yearOptions = computed(() => {
  const baseYear = new Date().getFullYear()
  const startYear = Math.min(baseYear, year.value) - 2

  return Array.from({ length: 7 }, (_, index) => startYear + index)
})

function handleYearChange(event) {
  void setWorkspaceYear(event.target.value)
}

function handleMonthChange(event) {
  void setWorkspaceMonth(event.target.value)
}

function handleTimezoneChange(event) {
  setWorkspaceTimezone(event.target.value)
}
</script>

<template>
  <header class="flex h-16 flex-shrink-0 items-center border-b border-slate-200 bg-white px-6 shadow-sm">
    <div class="flex min-w-0 flex-1 items-center gap-4">
      <div class="relative w-full max-w-sm">
        <label for="workspace-topbar-search" class="sr-only">Search staff, shifts, or codes</label>
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id="workspace-topbar-search"
          name="workspace-topbar-search"
          type="text"
          placeholder="Search staff, shifts, or codes (CMD+K)"
          class="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
        />
      </div>

      <div class="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 shadow-sm xl:flex">
        <button class="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-white hover:text-slate-800" @click="void goToPreviousMonth()">
          <ChevronLeft class="h-4 w-4" />
        </button>
        <div class="min-w-[116px] text-center">
          <div class="text-xs font-semibold uppercase tracking-wide text-slate-400">Workspace Month</div>
          <div class="text-sm font-semibold text-slate-800">{{ monthLabel }}</div>
        </div>
        <label for="workspace-topbar-month" class="sr-only">Select workspace month</label>
        <select
          id="workspace-topbar-month"
          name="workspace-topbar-month"
          :value="month"
          class="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 outline-none transition-colors hover:border-slate-300"
          @change="handleMonthChange"
        >
          <option v-for="option in monthOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <label for="workspace-topbar-year" class="sr-only">Select workspace year</label>
        <select
          id="workspace-topbar-year"
          name="workspace-topbar-year"
          :value="year"
          class="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 outline-none transition-colors hover:border-slate-300"
          @change="handleYearChange"
        >
          <option v-for="option in yearOptions" :key="option" :value="option">{{ option }}</option>
        </select>
        <button class="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-white hover:text-slate-800" @click="void goToNextMonth()">
          <ChevronRight class="h-4 w-4" />
        </button>
        <div class="mx-1 h-6 w-px bg-slate-200"></div>
        <label for="workspace-topbar-timezone" class="sr-only">Select workspace timezone</label>
        <div class="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1">
          <Globe class="h-4 w-4 flex-shrink-0 text-slate-400" />
          <select
            id="workspace-topbar-timezone"
            name="workspace-topbar-timezone"
            :value="timezone"
            class="min-w-[4.5rem] appearance-none bg-transparent py-1 pr-5 text-sm font-medium text-slate-700 outline-none"
            @change="handleTimezoneChange"
          >
            <option v-for="timezoneOption in WORKSPACE_TIMEZONE_OPTIONS" :key="timezoneOption.value" :value="timezoneOption.value">{{ timezoneOption.label }}</option>
          </select>
        </div>
      </div>

      <RouterLink
        to="/viewer"
        class="ml-auto hidden items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-700 transition-colors hover:border-teal-300 hover:bg-teal-100 lg:inline-flex"
      >
        Open Public Viewer
      </RouterLink>
    </div>
  </header>
</template>
