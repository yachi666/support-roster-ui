<script setup>
import {
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from 'radix-vue'
import { Users } from 'lucide-vue-next'

defineProps({
  member: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <TooltipProvider :delay-duration="180">
    <TooltipRoot>
      <TooltipTrigger as-child>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
        >
          <Users class="h-3 w-3 text-slate-500" />
          {{ member.id }}
        </button>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          side="top"
          :side-offset="8"
          class="z-50 w-72 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-xl"
        >
          <div class="flex gap-4">
            <img
              :src="member.avatar"
              :alt="member.name"
              class="h-12 w-12 rounded-full border border-slate-200 object-cover"
            >
            <div class="min-w-0 space-y-1">
              <div class="text-sm font-semibold text-slate-900">{{ member.name }}</div>
              <div class="inline-flex rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-500">
                {{ member.id }}
              </div>
              <a
                :href="`mailto:${member.email}`"
                class="block truncate text-xs text-blue-600 transition-colors hover:text-blue-700 hover:underline"
              >
                {{ member.email }}
              </a>
            </div>
          </div>
          <TooltipArrow class="fill-white stroke-slate-200 stroke-1" />
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>
