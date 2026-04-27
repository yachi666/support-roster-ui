<script setup>
import { Search, RotateCcw } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  filters: {
    type: Object,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  hasActiveFilters: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['search', 'reset'])
const { t } = useI18n()

const inputClass = 'h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
</script>

<template>
  <form class="border-b border-slate-200 bg-white px-6 py-4" @submit.prevent="emit('search')">
    <div class="grid gap-3 lg:grid-cols-[minmax(220px,1.2fr)_repeat(4,minmax(140px,1fr))_auto]">
      <label class="block">
        <span class="mb-1 block text-xs font-medium text-slate-500">{{ t('linuxPasswords.audit.filters.keyword') }}</span>
        <input v-model="props.filters.keyword" :class="inputClass" type="search" :placeholder="t('linuxPasswords.audit.filters.keywordPlaceholder')" />
      </label>

      <label class="block">
        <span class="mb-1 block text-xs font-medium text-slate-500">{{ t('linuxPasswords.audit.filters.staffId') }}</span>
        <input v-model="props.filters.staffId" :class="inputClass" type="text" />
      </label>

      <label class="block">
        <span class="mb-1 block text-xs font-medium text-slate-500">{{ t('linuxPasswords.audit.filters.hostname') }}</span>
        <input v-model="props.filters.hostname" :class="inputClass" type="text" />
      </label>

      <label class="block">
        <span class="mb-1 block text-xs font-medium text-slate-500">{{ t('linuxPasswords.audit.filters.username') }}</span>
        <input v-model="props.filters.username" :class="inputClass" type="text" />
      </label>

      <label class="block">
        <span class="mb-1 block text-xs font-medium text-slate-500">{{ t('linuxPasswords.audit.filters.action') }}</span>
        <select v-model="props.filters.action" :class="inputClass">
          <option value="">{{ t('linuxPasswords.audit.filters.allActions') }}</option>
          <option value="VIEW">{{ t('linuxPasswords.audit.actions.VIEW') }}</option>
          <option value="COPY">{{ t('linuxPasswords.audit.actions.COPY') }}</option>
        </select>
      </label>

      <div class="flex items-end gap-2">
        <button
          type="submit"
          class="inline-flex h-9 items-center gap-1.5 rounded-md bg-blue-600 px-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="props.isLoading"
        >
          <Search class="h-4 w-4" />
          {{ t('common.search') }}
        </button>
        <button
          type="button"
          class="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="props.isLoading || !props.hasActiveFilters"
          @click="emit('reset')"
        >
          <RotateCcw class="h-4 w-4" />
          {{ t('common.reset') }}
        </button>
      </div>
    </div>

    <div class="mt-3 grid gap-3 md:grid-cols-5">
      <label class="block">
        <span class="mb-1 block text-xs font-medium text-slate-500">{{ t('linuxPasswords.audit.filters.staffName') }}</span>
        <input v-model="props.filters.staffName" :class="inputClass" type="text" />
      </label>
      <label class="block">
        <span class="mb-1 block text-xs font-medium text-slate-500">{{ t('linuxPasswords.audit.filters.ip') }}</span>
        <input v-model="props.filters.ip" :class="inputClass" type="text" />
      </label>
      <label class="block">
        <span class="mb-1 block text-xs font-medium text-slate-500">{{ t('linuxPasswords.audit.filters.result') }}</span>
        <select v-model="props.filters.result" :class="inputClass">
          <option value="">{{ t('linuxPasswords.audit.filters.allResults') }}</option>
          <option value="SUCCESS">{{ t('linuxPasswords.audit.results.SUCCESS') }}</option>
          <option value="FAILED">{{ t('linuxPasswords.audit.results.FAILED') }}</option>
        </select>
      </label>
      <label class="block">
        <span class="mb-1 block text-xs font-medium text-slate-500">{{ t('linuxPasswords.audit.filters.from') }}</span>
        <input v-model="props.filters.from" :class="inputClass" type="date" />
      </label>
      <label class="block">
        <span class="mb-1 block text-xs font-medium text-slate-500">{{ t('linuxPasswords.audit.filters.to') }}</span>
        <input v-model="props.filters.to" :class="inputClass" type="date" />
      </label>
    </div>
  </form>
</template>
