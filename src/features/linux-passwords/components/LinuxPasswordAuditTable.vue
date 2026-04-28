<script setup>
import { ChevronLeft, ChevronRight, FileSearch } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  page: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  resultSummary: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['previous-page', 'next-page'])
const { t, locale } = useI18n()

function formatTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function badgeClass(value) {
  if (value === 'SUCCESS' || value === 'VIEW') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (value === 'FAILED') {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }
  return 'border-blue-200 bg-blue-50 text-blue-700'
}
</script>

<template>
  <section class="flex min-h-0 flex-1 flex-col overflow-hidden p-6">
    <div class="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <span class="text-sm text-slate-500">{{ resultSummary }}</span>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="props.isLoading || props.page <= 1"
            :title="t('common.previous')"
            @click="emit('previous-page')"
          >
            <ChevronLeft class="h-4 w-4" />
          </button>
          <span class="min-w-20 text-center text-xs text-slate-500">{{ props.page }} / {{ props.totalPages }}</span>
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="props.isLoading || props.page >= props.totalPages"
            :title="t('common.next')"
            @click="emit('next-page')"
          >
            <ChevronRight class="h-4 w-4" />
          </button>
        </div>
      </div>

      <div class="overflow-auto">
        <table class="w-full min-w-[1080px] border-collapse text-left text-sm">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th class="px-4 py-3">{{ t('linuxPasswords.audit.columns.time') }}</th>
              <th class="px-4 py-3">{{ t('linuxPasswords.audit.columns.staff') }}</th>
              <th class="px-4 py-3">{{ t('linuxPasswords.audit.columns.machine') }}</th>
              <th class="px-4 py-3">{{ t('linuxPasswords.audit.columns.account') }}</th>
              <th class="px-4 py-3">{{ t('linuxPasswords.audit.columns.action') }}</th>
              <th class="px-4 py-3">{{ t('linuxPasswords.audit.columns.result') }}</th>
              <th class="px-4 py-3">{{ t('linuxPasswords.audit.columns.source') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in props.items" :key="item.id" class="hover:bg-slate-50">
              <td class="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-600">{{ formatTime(item.createTime) }}</td>
              <td class="px-4 py-3">
                <div class="font-medium text-slate-800">{{ item.staffName || '-' }}</div>
                <div class="font-mono text-xs text-slate-500">{{ item.staffId || '-' }}</div>
              </td>
              <td class="px-4 py-3">
                <div class="font-medium text-slate-800">{{ item.hostname || '-' }}</div>
                <div class="font-mono text-xs text-slate-500">{{ item.ip || '-' }}</div>
              </td>
              <td class="px-4 py-3 font-mono text-sm text-slate-700">{{ item.username || '-' }}</td>
              <td class="px-4 py-3">
                <span class="inline-flex rounded-full border px-2 py-0.5 text-xs font-medium" :class="badgeClass(item.action)">
                  {{ t(`linuxPasswords.audit.actions.${item.action || 'UNKNOWN'}`) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex rounded-full border px-2 py-0.5 text-xs font-medium" :class="badgeClass(item.result)">
                  {{ t(`linuxPasswords.audit.results.${item.result || 'UNKNOWN'}`) }}
                </span>
              </td>
              <td class="max-w-[260px] px-4 py-3">
                <div class="font-mono text-xs text-slate-600">{{ item.clientIp || '-' }}</div>
                <div class="truncate text-xs text-slate-400" :title="item.userAgent || ''">{{ item.userAgent || '-' }}</div>
              </td>
            </tr>
            <tr v-if="!props.items.length">
              <td colspan="7" class="px-4 py-14 text-center text-slate-500">
                <div class="flex flex-col items-center gap-2">
                  <FileSearch class="h-8 w-8 text-slate-300" />
                  <span>{{ props.isLoading ? t('linuxPasswords.audit.loading') : t('linuxPasswords.audit.empty') }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
