<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronLeft, ChevronRight, ContactRound, ExternalLink, Globe, KeyRound, Search } from 'lucide-vue-next'
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
const topbarShellClass = 'flex h-16 min-w-[50rem] flex-1 items-center gap-3'
const topbarSearchShellClass = 'group relative w-[16rem] shrink-0 transition-all duration-200 focus-within:w-[22rem] xl:w-[18rem] xl:focus-within:w-[24rem]'
const topbarSearchInputClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15'
const topbarPeriodShellClass = 'flex h-11 w-fit shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-1.5 shadow-sm'
const topbarMonthSelectClass = 'h-8 min-w-[9.5rem] rounded-lg border border-transparent bg-slate-50 px-3 text-center text-sm font-semibold text-slate-900 outline-none transition-colors hover:border-slate-200 focus:border-teal-300 focus:bg-white focus:ring-2 focus:ring-teal-500/15'
const topbarYearSelectClass = 'h-8 w-[4.75rem] rounded-lg border border-transparent bg-slate-50 px-2 text-sm font-semibold text-slate-900 outline-none transition-colors hover:border-slate-200 focus:border-teal-300 focus:bg-white focus:ring-2 focus:ring-teal-500/15'
const topbarMetaControlClass = 'flex h-8 min-w-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2'
const topbarActionClusterClass = 'ml-auto flex h-11 shrink-0 items-center justify-end gap-1.5 rounded-xl border border-slate-200 bg-white px-1.5 shadow-sm'
const topbarActionLinkBaseClass = 'inline-flex h-8 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-2.5 text-sm font-semibold transition-colors'
const topbarActionSecondaryClass = 'border border-transparent bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50'
const topbarActionPrimaryClass = 'border border-teal-200 bg-teal-50 text-teal-700 hover:border-teal-300 hover:bg-teal-100'

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
  <header class="flex flex-shrink-0 overflow-x-auto border-b border-slate-200/80 bg-slate-50/90 px-5 backdrop-blur-sm lg:px-6">
    <div :class="topbarShellClass">
      <div :class="topbarSearchShellClass">
        <label for="workspace-topbar-search" class="sr-only">{{ t('workspace.shell.topbar.searchLabel') }}</label>
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id="workspace-topbar-search"
          name="workspace-topbar-search"
          v-model="searchTerm"
          type="text"
          :placeholder="t('workspace.shell.topbar.searchPlaceholder')"
          :class="topbarSearchInputClass"
        />
      </div>

      <div :class="topbarPeriodShellClass">
        <button
          class="shrink-0 rounded-xl border border-transparent bg-white p-2 text-slate-500 transition-colors hover:border-slate-200 hover:text-slate-800"
          @click="void goToPreviousMonth()"
        >
          <ChevronLeft class="h-4 w-4" />
        </button>

        <label for="workspace-topbar-month" class="sr-only">{{ t('workspace.shell.topbar.selectMonth') }}</label>
        <select
          id="workspace-topbar-month"
          name="workspace-topbar-month"
          :value="month"
          :class="topbarMonthSelectClass"
          @change="handleMonthChange"
        >
          <option v-for="option in monthOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>

        <label for="workspace-topbar-year" class="sr-only">{{ t('workspace.shell.topbar.selectYear') }}</label>
        <select
          id="workspace-topbar-year"
          name="workspace-topbar-year"
          :value="year"
          :class="topbarYearSelectClass"
          @change="handleYearChange"
        >
          <option v-for="option in yearOptions" :key="option" :value="option">{{ option }}</option>
        </select>

        <button
          class="shrink-0 rounded-xl border border-transparent bg-white p-2 text-slate-500 transition-colors hover:border-slate-200 hover:text-slate-800"
          @click="void goToNextMonth()"
        >
          <ChevronRight class="h-4 w-4" />
        </button>

        <div class="mx-1 h-6 w-px bg-slate-200"></div>

        <label for="workspace-topbar-timezone" class="sr-only">{{ t('workspace.shell.topbar.selectTimezone') }}</label>
        <div :class="topbarMetaControlClass">
          <Globe class="h-4 w-4 flex-shrink-0 text-slate-400" />
          <select
            id="workspace-topbar-timezone"
            name="workspace-topbar-timezone"
            :value="timezone"
            class="min-w-[4.5rem] appearance-none bg-transparent pr-3 text-sm font-medium text-slate-700 outline-none"
            @change="handleTimezoneChange"
          >
            <option v-for="timezoneOption in WORKSPACE_TIMEZONE_OPTIONS" :key="timezoneOption.value" :value="timezoneOption.value">{{ timezoneOption.label }}</option>
          </select>
        </div>
        <label for="workspace-topbar-locale" class="sr-only">{{ t('locale.switcherLabel') }}</label>
        <div :class="topbarMetaControlClass">
          <select
            id="workspace-topbar-locale"
            name="workspace-topbar-locale"
            :value="currentLocale"
            class="min-w-[3.5rem] appearance-none bg-transparent pr-3 text-sm font-medium text-slate-700 outline-none"
            @change="handleLocaleChange"
          >
            <option v-for="localeOption in localeOptions" :key="localeOption.value" :value="localeOption.value">{{ localeOption.label }}</option>
          </select>
        </div>
      </div>

      <div :class="topbarActionClusterClass">
        <RouterLink
          to="/linux-passwords"
          :class="[topbarActionLinkBaseClass, topbarActionSecondaryClass]"
          :aria-label="t('linuxPasswords.entryLabel')"
          :title="t('linuxPasswords.entryLabel')"
        >
          <KeyRound class="h-4 w-4 text-slate-500" />
          <span class="hidden min-[1800px]:inline">{{ t('linuxPasswords.entryLabel') }}</span>
        </RouterLink>

        <RouterLink
          to="/contact-information"
          :class="[topbarActionLinkBaseClass, topbarActionSecondaryClass]"
          :aria-label="t('common.contactInformation')"
          :title="t('common.contactInformation')"
        >
          <ContactRound class="h-4 w-4 text-slate-500" />
          <span class="hidden min-[1800px]:inline">{{ t('common.contactInformation') }}</span>
        </RouterLink>

        <div class="mx-1 h-6 w-px bg-slate-200"></div>

        <RouterLink
          to="/viewer"
          :class="[topbarActionLinkBaseClass, topbarActionPrimaryClass]"
          :aria-label="t('workspace.shell.openViewer')"
          :title="t('workspace.shell.openViewer')"
        >
          <ExternalLink class="h-4 w-4 text-teal-600" />
          <span class="hidden min-[1800px]:inline">{{ t('workspace.shell.openViewer') }}</span>
        </RouterLink>
      </div>
    </div>
  </header>
</template>
