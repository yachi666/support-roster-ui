<script setup>
import { onMounted, onUnmounted } from 'vue'
import { ExternalLink, X } from 'lucide-vue-next'

const props = defineProps({
  open: { type: Boolean, required: true },
  systems: { type: Array, required: true },
})

const emit = defineEmits(['close'])

const closeDrawer = () => emit('close')

const handleKeydown = (event) => {
  if (props.open && event.key === 'Escape') {
    closeDrawer()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="external-systems-fade">
      <div v-if="open" class="fixed inset-0 z-50" role="presentation">
        <button
          type="button"
          class="absolute inset-0 h-full w-full cursor-default bg-slate-950/35"
          aria-label="Close external systems drawer"
          @click="closeDrawer"
        ></button>

        <aside
          class="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="external-systems-title"
        >
          <div class="flex items-start justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 id="external-systems-title" class="text-base font-semibold text-slate-950">
                External systems
              </h2>
              <p class="mt-1 text-sm text-slate-500">Open support tools and reference systems.</p>
            </div>
            <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:ring-offset-2"
              aria-label="Close external systems drawer"
              @click="closeDrawer"
            >
              <X class="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div class="flex-1 space-y-3 overflow-y-auto px-5 py-5">
            <a
              v-for="system in systems"
              :key="system.id"
              :href="system.url"
              target="_blank"
              rel="noreferrer"
              class="group flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-sky-200 hover:bg-sky-50/60 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:ring-offset-2"
            >
              <span
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50"
              >
                <img
                  :src="system.iconUrl"
                  :alt="`${system.name} icon`"
                  class="h-8 w-8 object-contain"
                />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block text-sm font-semibold text-slate-900">{{ system.name }}</span>
                <span class="mt-1 block text-xs leading-5 text-slate-500">{{
                  system.description
                }}</span>
              </span>
              <ExternalLink
                class="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-sky-600"
                aria-hidden="true"
              />
            </a>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.external-systems-fade-enter-active,
.external-systems-fade-leave-active {
  transition: opacity 160ms ease;
}

.external-systems-fade-enter-from,
.external-systems-fade-leave-to {
  opacity: 0;
}
</style>
