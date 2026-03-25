<script setup>
import { onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: String, default: '720px' },
})

const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

function closeModal() {
  emit('update:modelValue', false)
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    closeModal()
  }
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeydown)
      return
    }

    window.removeEventListener('keydown', handleKeydown)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Transition name="workspace-fade">
    <div v-if="props.modelValue" class="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[1px]" @click="closeModal"></div>
  </Transition>

  <Transition name="workspace-modal">
    <div
      v-if="props.modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      :aria-label="title || t('workspace.shell.drawer.fallbackTitle')"
    >
      <section
        class="flex max-h-[85vh] w-full max-w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
        :style="{ width: props.width }"
        @click.stop
      >
        <header class="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div>
            <h3 class="text-base font-semibold text-slate-800">{{ title }}</h3>
            <slot name="subtitle" />
          </div>
          <button
            type="button"
            class="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            @click="closeModal"
          >
            <span class="sr-only">{{ t('workspace.shell.drawer.close') }}</span>
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div class="flex-1 overflow-y-auto px-6 py-6">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="border-t border-slate-100 bg-slate-50/80 px-6 py-4">
          <slot name="footer" />
        </footer>
      </section>
    </div>
  </Transition>
</template>

<style scoped>
.workspace-fade-enter-active,
.workspace-fade-leave-active {
  transition: opacity 0.2s ease;
}

.workspace-fade-enter-from,
.workspace-fade-leave-to {
  opacity: 0;
}

.workspace-modal-enter-active,
.workspace-modal-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.workspace-modal-enter-from,
.workspace-modal-leave-to {
  opacity: 0;
  transform: scale(0.97);
}
</style>
