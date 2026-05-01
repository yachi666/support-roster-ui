<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  visible: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  shiftCodeOptions: { type: Array, default: () => [] },
})

const emit = defineEmits(['select-code'])
const { t } = useI18n()

const actionShiftCodes = computed(() =>
  props.shiftCodeOptions.filter((code) => code && code !== 'Clear'),
)
</script>

<template>
  <div
    v-if="visible"
    class="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-4 py-3"
  >
    <button
      v-for="code in actionShiftCodes"
      :key="code"
      type="button"
      class="rounded-md border border-slate-200 bg-white px-3 py-1.5 font-mono text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="readonly"
      @click="emit('select-code', code)"
    >
      {{ code }}
    </button>
    <button
      type="button"
      class="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="readonly"
      @click="emit('select-code', 'Clear')"
    >
      {{ t('workspace.roster.clear') }}
    </button>
  </div>
</template>
