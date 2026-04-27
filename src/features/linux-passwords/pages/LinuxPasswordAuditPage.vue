<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { ArrowLeft, ShieldCheck } from 'lucide-vue-next'
import { api } from '@/api'
import LinuxPasswordAuditFilters from '../components/LinuxPasswordAuditFilters.vue'
import LinuxPasswordAuditTable from '../components/LinuxPasswordAuditTable.vue'
import { createLinuxPasswordAuditsModel } from '../lib/useLinuxPasswordAudits'

const { t } = useI18n()
const model = createLinuxPasswordAuditsModel({ api, t })

onMounted(async () => {
  try {
    await model.loadAudits()
  } catch {
  }
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-[#f0f2f5] text-slate-800">
    <header class="border-b border-slate-200 bg-white">
      <div class="flex min-h-16 items-center justify-between gap-4 px-6 py-3">
        <div class="min-w-0">
          <div class="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-blue-600">
            <ShieldCheck class="h-4 w-4" />
            {{ t('linuxPasswords.audit.badge') }}
          </div>
          <h1 class="mt-1 text-xl font-semibold text-slate-900">{{ t('linuxPasswords.audit.title') }}</h1>
          <p class="mt-1 text-sm text-slate-500">{{ t('linuxPasswords.audit.subtitle') }}</p>
        </div>

        <RouterLink
          to="/linux-passwords"
          class="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <ArrowLeft class="h-4 w-4" />
          {{ t('linuxPasswords.audit.backToVault') }}
        </RouterLink>
      </div>
    </header>

    <div v-if="model.statusMessage" class="mx-6 mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
      {{ model.statusMessage }}
    </div>

    <LinuxPasswordAuditFilters
      :filters="model.filters"
      :is-loading="model.isLoading"
      :has-active-filters="model.hasActiveFilters"
      @search="model.searchAudits"
      @reset="model.resetFilters"
    />

    <LinuxPasswordAuditTable
      :items="model.items"
      :is-loading="model.isLoading"
      :page="model.page"
      :total-pages="model.totalPages"
      :result-summary="model.resultSummary"
      @previous-page="model.goToPage(model.page - 1)"
      @next-page="model.goToPage(model.page + 1)"
    />
  </div>
</template>
