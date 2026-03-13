<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: String, default: '420px' },
})

const emit = defineEmits(['update:modelValue'])

function closeDrawer() {
  emit('update:modelValue', false)
}
</script>

<template>
  <Transition name="workspace-fade">
    <div v-if="props.modelValue" class="fixed inset-0 z-40 bg-slate-950/15 backdrop-blur-[1px]" @click="closeDrawer"></div>
  </Transition>

  <Transition name="workspace-slide">
    <aside
      v-if="props.modelValue"
      class="fixed right-0 top-0 z-50 flex h-screen max-w-full flex-col border-l border-slate-200 bg-white shadow-[-16px_0_48px_rgba(15,23,42,0.08)]"
      :style="{ width: props.width }"
    >
      <header class="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
        <div>
          <h3 class="text-base font-semibold text-slate-800">{{ title }}</h3>
          <slot name="subtitle" />
        </div>
        <button
          type="button"
          class="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          @click="closeDrawer"
        >
          <span class="sr-only">Close drawer</span>
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>
      <div class="flex-1 overflow-y-auto px-6 py-6">
        <slot />
      </div>
      <footer v-if="$slots.footer" class="border-t border-slate-100 bg-slate-50/70 px-4 py-4">
        <slot name="footer" />
      </footer>
    </aside>
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

.workspace-slide-enter-active,
.workspace-slide-leave-active {
  transition: transform 0.28s ease;
}

.workspace-slide-enter-from,
.workspace-slide-leave-to {
  transform: translateX(100%);
}
</style>
