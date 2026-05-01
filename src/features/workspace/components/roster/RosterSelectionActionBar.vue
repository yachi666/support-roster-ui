<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Clock3, Globe2, Star } from 'lucide-vue-next'
import {
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from 'radix-vue'
import { getShiftPresentation as resolveShiftPresentation } from '../../lib/shiftPresentation'

const props = defineProps({
  visible: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  shiftCodeOptions: { type: Array, default: () => [] },
  selectedTeamId: { type: [String, Number], default: '' },
  shiftPresentationByTeam: { type: Object, default: () => ({}) },
  fallbackShiftPresentationByCode: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['select-code'])
const { t } = useI18n()

const actionShiftCodes = computed(() =>
  props.shiftCodeOptions.filter((code) => code && code !== 'Clear'),
)

function getShiftPresentation(code) {
  return resolveShiftPresentation({
    shiftPresentationByTeam: props.shiftPresentationByTeam,
    fallbackShiftPresentationByCode: props.fallbackShiftPresentationByCode,
    teamId: props.selectedTeamId,
    code,
  })
}

function getShiftChipStyle(code) {
  return getShiftPresentation(code)?.cellStyle || null
}

function getShiftCardStyle(code) {
  return getShiftPresentation(code)?.cardStyle || null
}

function getShiftBadgeStyle(code) {
  return getShiftPresentation(code)?.badgeStyle || null
}

function getShiftMeta(code) {
  return getShiftPresentation(code)?.meta || null
}

function getShiftMeaning(code) {
  return getShiftMeta(code)?.meaning || ''
}

function getShiftWindowLabel(code) {
  return getShiftPresentation(code)?.windowLabel || ''
}

function handleActionClick(code) {
  if (props.readonly) {
    return
  }

  emit('select-code', code)
}
</script>

<template>
  <TooltipProvider :delay-duration="120">
    <div
      v-if="visible"
      class="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-4 py-3"
    >
      <TooltipRoot v-for="code in actionShiftCodes" :key="code">
        <TooltipTrigger as-child>
          <button
            type="button"
            :aria-disabled="readonly ? 'true' : 'false'"
            :tabindex="readonly ? -1 : 0"
            :class="[
              'roster-shift-chip-motion flex min-h-[32px] items-center justify-center rounded-[3px] border px-3 py-1.5 font-mono text-sm font-medium shadow-sm outline-none transition hover:-translate-y-0.5 focus-visible:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-teal-500/30',
              getShiftChipStyle(code)
                ? ''
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
              readonly ? 'cursor-not-allowed opacity-60' : '',
            ]"
            :style="getShiftChipStyle(code)"
            @click="handleActionClick(code)"
          >
            {{ code }}
          </button>
        </TooltipTrigger>

        <TooltipPortal>
          <TooltipContent
            class="z-50 w-64 rounded-2xl border border-slate-200 bg-white/98 p-3.5 text-left shadow-[0_18px_50px_rgba(15,23,42,0.18)] backdrop-blur"
            :style="getShiftCardStyle(code)"
            side="top"
            align="center"
            :side-offset="8"
          >
            <div class="space-y-3">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span
                      class="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]"
                      :class="
                        !getShiftBadgeStyle(code) &&
                        'border-slate-200 bg-slate-100 text-slate-700'
                      "
                      :style="getShiftBadgeStyle(code)"
                    >
                      {{ code }}
                    </span>
                    <span
                      v-if="getShiftMeta(code)?.primaryShift"
                      class="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-600"
                    >
                      <Star class="h-3 w-3 fill-current" />
                      {{ t('workspace.grid.primary') }}
                    </span>
                  </div>
                  <p class="text-sm font-semibold leading-5 text-slate-900">
                    {{ getShiftMeaning(code) || t('workspace.grid.shiftDefinition') }}
                  </p>
                </div>
              </div>

              <div class="rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2.5">
                <div class="flex items-start gap-2 text-slate-700">
                  <Clock3 class="mt-0.5 h-3.5 w-3.5 flex-none text-slate-400" />
                  <div>
                    <div class="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {{ t('workspace.grid.timeWindow') }}
                    </div>
                    <div class="mt-1 font-mono text-[12px] leading-5 text-slate-800">
                      {{ getShiftWindowLabel(code) || t('workspace.grid.timeUnavailable') }}
                    </div>
                  </div>
                </div>
              </div>

              <div
                class="flex items-center justify-between gap-3 rounded-xl border border-dashed border-slate-200 px-3 py-2 text-[11px] text-slate-600"
              >
                <div class="flex items-center gap-2">
                  <Globe2 class="h-3.5 w-3.5 text-slate-400" />
                  <span class="uppercase tracking-[0.14em] text-slate-400">{{
                    t('workspace.grid.timezone')
                  }}</span>
                </div>
                <span class="font-semibold text-slate-800">
                  {{ getShiftMeta(code)?.timezone || t('workspace.grid.notAvailable') }}
                </span>
              </div>
            </div>

            <TooltipArrow class="fill-white" />
          </TooltipContent>
        </TooltipPortal>
      </TooltipRoot>

      <button
        type="button"
        class="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        :class="readonly ? 'cursor-not-allowed opacity-60' : ''"
        :aria-disabled="readonly ? 'true' : 'false'"
        :tabindex="readonly ? -1 : 0"
        @click="handleActionClick('Clear')"
      >
        {{ t('workspace.roster.clear') }}
      </button>
    </div>
  </TooltipProvider>
</template>
