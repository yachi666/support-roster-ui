<script setup>
import { RouterLink } from 'vue-router'
import { Folder, FolderOpen, ChevronRight, HardDrive, LayoutGrid } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  units: {
    type: Array,
    required: true,
  },
  selectedUnit: {
    type: String,
    required: true,
  },
  modulesExpanded: {
    type: Boolean,
    required: true,
  },
  canViewAudits: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggle-modules', 'select-unit'])
const { t } = useI18n()

function selectUnit(unit) {
  emit('select-unit', unit)
}
</script>

<template>
  <aside class="flex w-64 shrink-0 flex-col border-r border-[#e5e7eb] bg-white">
    <div class="border-b border-[#e5e7eb] p-4">
      <h2 class="flex items-center gap-2 text-[15px] font-semibold text-slate-800">
        <LayoutGrid class="h-4 w-4 text-blue-600" />
        {{ t('linuxPasswords.systemDirectory') }}
      </h2>
    </div>

    <div class="flex-1 overflow-y-auto p-3 text-sm">
      <button
        type="button"
        class="flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-left transition-colors hover:bg-[#f3f4f6]"
        @click="$emit('toggle-modules')"
      >
        <ChevronRight class="h-3.5 w-3.5 text-gray-400 transition-transform" :class="modulesExpanded ? 'rotate-90' : ''" />
        <FolderOpen v-if="modulesExpanded" class="h-4 w-4 text-blue-500" />
        <Folder v-else class="h-4 w-4 text-blue-500" />
        <span class="font-medium text-gray-700">{{ t('linuxPasswords.businessModules') }}</span>
      </button>

      <div v-if="modulesExpanded" class="ml-5 mt-1 flex flex-col gap-0.5 border-l border-gray-200 pl-2">
        <button
          type="button"
          class="flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors"
          :class="selectedUnit === 'All' ? 'bg-blue-50 font-medium text-blue-600' : 'text-gray-600 hover:bg-gray-100'"
          @click="selectUnit('All')"
        >
          <HardDrive class="h-3.5 w-3.5" />
          {{ t('linuxPasswords.allServers') }}
        </button>

        <button
          v-for="unit in props.units"
          :key="unit"
          type="button"
          class="flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors"
          :class="selectedUnit === unit ? 'bg-blue-50 font-medium text-blue-600' : 'text-gray-600 hover:bg-gray-100'"
          @click="selectUnit(unit)"
        >
          <Folder class="h-3.5 w-3.5" />
          {{ unit }}
        </button>
      </div>
    </div>

    <div v-if="props.canViewAudits" class="border-t border-[#e5e7eb] px-3 py-2">
      <RouterLink
        to="/linux-passwords/audits"
        class="group flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-blue-600"
      >
        <svg
          class="h-3.5 w-3.5 shrink-0 text-slate-400 transition group-hover:text-blue-500"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path d="M4.5 2.5h4.7l2.3 2.3v6.7a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round" />
          <path d="M9.1 2.7v2.4h2.4" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M5.25 7h4.1M5.25 9.25h2.15" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" />
          <circle cx="9.6" cy="10.2" r="1.45" stroke="currentColor" stroke-width="1.25" />
          <path d="m10.7 11.3 1.55 1.55" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" />
        </svg>
        <span class="truncate">{{ t('linuxPasswords.audit.sidebarEntry') }}</span>
        <ChevronRight class="ml-auto h-3.5 w-3.5 shrink-0 text-slate-300 transition group-hover:text-blue-400" />
      </RouterLink>
    </div>
  </aside>
</template>
