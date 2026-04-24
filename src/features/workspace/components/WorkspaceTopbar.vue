<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronLeft, ChevronRight, Globe, Search } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { SUPPORTED_LOCALES, currentLocale, setLocale } from '@/i18n'
import { getLocalizedMonthOptions } from '@/i18n/format'
import { useWorkspacePageSearch } from '../composables/useWorkspacePageSearch'
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
const { t } = useI18n()
const searchTerm = useWorkspacePageSearch()

const monthOptions = computed(() => getLocalizedMonthOptions(currentLocale.value))
const localeOptions = computed(() =>
  SUPPORTED_LOCALES.map((locale) => ({
    value: locale,
    label: locale === 'zh-CN' ? t('common.chinese') : t('common.english'),
  })),
)

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

function handleLocaleChange(event) {
  setLocale(event.target.value)
}
</script>

<template>
  <header class="flex h-16 flex-shrink-0 items-center border-b border-slate-200 bg-white px-6 shadow-sm">
    <div class="flex min-w-0 flex-1 items-center gap-4">
      <div class="relative w-full max-w-sm">
        <label for="workspace-topbar-search" class="sr-only">{{ t('workspace.shell.topbar.searchLabel') }}</label>
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id="workspace-topbar-search"
          name="workspace-topbar-search"
          v-model="searchTerm"
          type="text"
          :placeholder="t('workspace.shell.topbar.searchPlaceholder')"
          class="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
        />
      </div>

      <div class="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 shadow-sm xl:flex">
        <button class="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-white hover:text-slate-800" @click="void goToPreviousMonth()">
          <ChevronLeft class="h-4 w-4" />
        </button>
        <div class="min-w-[116px] text-center">
          <div class="text-xs font-semibold uppercase tracking-wide text-slate-400">{{ t('workspace.shell.topbar.month') }}</div>
          <div class="text-sm font-semibold text-slate-800">{{ monthLabel }}</div>
        </div>
        <label for="workspace-topbar-month" class="sr-only">{{ t('workspace.shell.topbar.selectMonth') }}</label>
        <select
          id="workspace-topbar-month"
          name="workspace-topbar-month"
          :value="month"
          class="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 outline-none transition-colors hover:border-slate-300"
          @change="handleMonthChange"
        >
          <option v-for="option in monthOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <label for="workspace-topbar-year" class="sr-only">{{ t('workspace.shell.topbar.selectYear') }}</label>
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
        <label for="workspace-topbar-timezone" class="sr-only">{{ t('workspace.shell.topbar.selectTimezone') }}</label>
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
        <label for="workspace-topbar-locale" class="sr-only">{{ t('locale.switcherLabel') }}</label>
        <div class="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1">
          <select
            id="workspace-topbar-locale"
            name="workspace-topbar-locale"
            :value="currentLocale"
            class="appearance-none bg-transparent py-1 pr-5 text-sm font-medium text-slate-700 outline-none"
            @change="handleLocaleChange"
          >
            <option v-for="localeOption in localeOptions" :key="localeOption.value" :value="localeOption.value">{{ localeOption.label }}</option>
          </select>
        </div>
      </div>

      <RouterLink
        to="/linux-passwords"
        class="ml-auto inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
      >
        {{ t('linuxPasswords.entryLabel') }}
      </RouterLink>

      <RouterLink
        to="/viewer"
        class="hidden items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-700 transition-colors hover:border-teal-300 hover:bg-teal-100 lg:inline-flex"
      >
        {{ t('workspace.shell.openViewer') }}
      </RouterLink>
    </div>
  </header>
</template>
