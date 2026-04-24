<script setup>
import { ArrowLeft, Plus, Search } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

defineProps({
  canManageServers: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  search: {
    type: String,
    required: true,
  },
  view: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:search', 'show-add', 'show-list'])
const { t } = useI18n()
</script>

<template>
  <div class="flex h-14 items-center justify-between border-b border-[#e5e7eb] bg-white px-6">
    <div class="min-w-0">
      <h1 class="text-lg font-semibold text-gray-800">{{ title }}</h1>
      <p v-if="subtitle" class="truncate text-xs text-gray-500">{{ subtitle }}</p>
    </div>

    <div v-if="view === 'list'" class="flex items-center gap-3">
      <label class="relative block">
        <span class="sr-only">{{ t('linuxPasswords.searchPlaceholder') }}</span>
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          :value="search"
          type="text"
          :placeholder="t('linuxPasswords.searchPlaceholder')"
          class="w-64 rounded-md border border-gray-300 py-1.5 pl-9 pr-4 text-sm text-gray-700 transition-shadow focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @input="emit('update:search', $event.target.value)"
        />
      </label>
      <button
        v-if="canManageServers"
        type="button"
        class="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        @click="$emit('show-add')"
      >
        <Plus class="h-4 w-4" />
        {{ t('linuxPasswords.addAction') }}
      </button>
    </div>

    <button
      v-else
      type="button"
      class="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900"
      @click="$emit('show-list')"
    >
      <ArrowLeft class="h-4 w-4" />
      {{ t('linuxPasswords.backToList') }}
    </button>
  </div>
</template>
