<script setup>
import { computed, ref, watch } from 'vue'
import { AlertCircle, Check } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { currentLocale } from '@/i18n'
import { formatLocalizedDate } from '@/i18n/format'
import AvatarImage from '../AvatarImage.vue'
import WorkspaceDrawer from '../WorkspaceDrawer.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  assignment: { type: Object, default: null },
  selectedRange: { type: Object, default: null },
  selectedShiftCode: { type: String, default: '' },
  shiftCodeOptions: { type: Array, required: true },
  validationWarning: { type: String, default: '' },
  readonly: { type: Boolean, default: false },
  year: { type: Number, required: true },
  month: { type: Number, required: true },
})

const emit = defineEmits(['update:modelValue', 'select-code', 'apply', 'apply-and-next', 'copy-week', 'apply-range', 'clear-range'])
const { t } = useI18n()

const normalizedCurrentCode = computed(() => props.assignment?.currentCode || t('workspace.roster.assignmentDrawer.unassigned'))
const normalizedNextCode = computed(() =>
  props.selectedShiftCode === 'Clear' || !props.selectedShiftCode
    ? t('workspace.roster.assignmentDrawer.unassigned')
    : props.selectedShiftCode,
)
const hasSelectionChanged = computed(() => normalizedCurrentCode.value !== normalizedNextCode.value)
const weekCopySummary = computed(() => {
  if (!props.assignment) {
    return null
  }

  const totalDays = props.assignment.staff?.schedule?.length || 0
  const currentDate = new Date(props.year, props.month - 1, props.assignment.day)
  const dayOfWeek = currentDate.getDay()
  const mondayOffset = (dayOfWeek + 6) % 7
  const sourceWeekStart = Math.max(1, props.assignment.day - mondayOffset)
  const sourceWeekEnd = Math.min(totalDays, sourceWeekStart + 6)
  const targetWeekStart = sourceWeekStart + 7
  const targetWeekEnd = Math.min(totalDays, sourceWeekEnd + 7)

  if (targetWeekStart > totalDays) {
    return null
  }

  return {
    sourceWeekStart,
    sourceWeekEnd,
    targetWeekStart,
    targetWeekEnd,
  }
})
const totalDays = computed(() => props.assignment?.staff?.schedule?.length || 0)
const rangeEndDay = ref(null)
const rangeEndOptions = computed(() => {
  if (!props.assignment) {
    return []
  }

  return Array.from(
    { length: totalDays.value - props.assignment.day + 1 },
    (_, index) => props.assignment.day + index,
  )
})
const quickReuseOptions = computed(() => {
  if (!props.assignment?.staff?.schedule?.length) {
    return []
  }

  const options = []
  const seenLabels = new Set()
  const schedule = props.assignment.staff.schedule
  const previousDayCode = schedule[props.assignment.day - 2] ?? null
  const previousWeekCode = schedule[props.assignment.day - 8] ?? null

  if (previousDayCode !== null) {
    seenLabels.add('Previous Day')
    options.push({
      label: t('workspace.roster.assignmentDrawer.previousDay'),
      code: previousDayCode,
      displayCode: previousDayCode || t('workspace.roster.assignmentDrawer.clearCode'),
    })
  }

  if (previousWeekCode !== null && !seenLabels.has('Previous Week')) {
    options.push({
      label: t('workspace.roster.assignmentDrawer.previousWeek'),
      code: previousWeekCode,
      displayCode: previousWeekCode || t('workspace.roster.assignmentDrawer.clearCode'),
    })
  }

  return options
})

watch(
  () => [props.assignment?.day, props.selectedRange?.endDay, props.selectedRange?.staffId, props.assignment?.staff?.id],
  ([day, selectedRangeEndDay, selectedRangeStaffId, assignmentStaffId]) => {
    if (
      day != null &&
      assignmentStaffId != null &&
      selectedRangeStaffId === assignmentStaffId &&
      Number.isInteger(selectedRangeEndDay) &&
      selectedRangeEndDay >= day
    ) {
      rangeEndDay.value = selectedRangeEndDay
      return
    }

    rangeEndDay.value = day ?? null
  },
  { immediate: true },
)

function formatAssignmentDate(day) {
  return formatLocalizedDate(new Date(props.year, props.month - 1, day), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }, currentLocale.value)
}

function formatDayRange(startDay, endDay) {
  const start = formatAssignmentDate(startDay)
  const end = formatAssignmentDate(endDay)
  return start === end ? start : `${start} -> ${end}`
}
</script>

<template>
  <WorkspaceDrawer
    :model-value="modelValue"
    :title="t('workspace.roster.assignmentDrawer.title')"
    width="400px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template v-if="assignment">
      <div class="space-y-6">
        <div class="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
          <AvatarImage
            :name="assignment.staff.name"
            :src="assignment.staff.avatar"
            size-class="h-10 w-10"
            fallback-class="bg-slate-200 text-sm font-semibold text-slate-600"
          />
          <div>
            <div class="text-sm font-semibold text-slate-800">{{ assignment.staff.name }}</div>
            <div class="text-xs text-slate-500">{{ assignment.group.team }} • {{ assignment.staff.role }}</div>
          </div>
        </div>

        <div>
          <div class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">{{ t('workspace.roster.assignmentDrawer.assignmentDate') }}</div>
          <div class="flex items-center gap-2">
            <label for="assignment-date" class="sr-only">{{ t('workspace.roster.assignmentDrawer.assignmentDate') }}</label>
            <input
              id="assignment-date"
              name="assignment-date"
              type="text"
              :value="formatAssignmentDate(assignment.day)"
              class="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700"
              readonly
            />
          </div>
        </div>

        <div class="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
          <div>
            <div class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{{ t('workspace.roster.assignmentDrawer.currentAssignment') }}</div>
            <div class="mt-1 text-sm font-semibold text-slate-800">{{ normalizedCurrentCode }}</div>
          </div>
          <div>
            <div class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{{ t('workspace.roster.assignmentDrawer.pendingAssignment') }}</div>
            <div class="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <span>{{ normalizedNextCode }}</span>
              <span v-if="hasSelectionChanged" class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-700">
                {{ t('workspace.roster.assignmentDrawer.unsaved') }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="readonly" class="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-800">
          {{ t('workspace.roster.assignmentDrawer.readonlyMessage') }}
        </div>

        <div>
          <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">{{ t('workspace.roster.assignmentDrawer.shiftCode') }}</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="code in shiftCodeOptions"
              :key="code"
              type="button"
              :class="[
                'rounded-md border px-3 py-2 text-center font-mono text-sm transition-colors',
                selectedShiftCode === code
                  ? 'border-indigo-200 bg-indigo-50 font-semibold text-indigo-700 shadow-[0_0_0_2px_rgba(99,102,241,0.2)]'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              ]"
              :disabled="readonly"
              @click="emit('select-code', code)"
            >
              {{ code }}
            </button>
          </div>
        </div>

        <div v-if="rangeEndOptions.length > 1" class="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div class="flex items-center justify-between gap-3">
            <div class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{{ t('workspace.roster.assignmentDrawer.rangeFill') }}</div>
            <button
              v-if="selectedRange && selectedRange.endDay > assignment.day"
              type="button"
              class="text-[11px] font-medium text-slate-500 transition-colors hover:text-slate-700"
              :disabled="readonly"
              @click="emit('clear-range')"
            >
              {{ t('workspace.roster.assignmentDrawer.resetSingleDay') }}
            </button>
          </div>
          <div v-if="selectedRange && selectedRange.endDay > assignment.day" class="mt-2 text-xs text-sky-700">
            {{ t('workspace.roster.assignmentDrawer.dragDetected', { startDay: assignment.day, endDay: selectedRange.endDay }) }}
          </div>
          <div class="mt-2 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label class="space-y-1.5 text-sm text-slate-700">
              <span class="block text-xs font-medium text-slate-500">
                {{ t('workspace.roster.assignmentDrawer.applyThrough', { day: assignment.day }) }}
              </span>
              <select
                v-model="rangeEndDay"
                class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                :disabled="readonly"
              >
                <option v-for="day in rangeEndOptions" :key="day" :value="day">
                  {{ t('workspace.roster.assignmentDrawer.dayLabel', { day }) }}
                </option>
              </select>
            </label>
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
              :disabled="readonly"
              @click="emit('apply-range', rangeEndDay)"
            >
              {{ t('workspace.roster.assignmentDrawer.applyRange') }}
            </button>
          </div>
        </div>

        <div v-if="quickReuseOptions.length">
          <div class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">{{ t('workspace.roster.assignmentDrawer.quickReuse') }}</div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in quickReuseOptions"
              :key="option.label"
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
              :disabled="readonly"
              @click="emit('select-code', option.code || 'Clear')"
            >
              <span>{{ option.label }}</span>
              <span class="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-600">
                {{ option.displayCode }}
              </span>
            </button>
          </div>
        </div>

        <div v-if="weekCopySummary" class="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{{ t('workspace.roster.assignmentDrawer.weekCopy') }}</div>
          <div class="mt-2 text-sm text-slate-700">
            {{ t('workspace.roster.assignmentDrawer.copyInto', {
              source: formatDayRange(weekCopySummary.sourceWeekStart, weekCopySummary.sourceWeekEnd),
              target: formatDayRange(weekCopySummary.targetWeekStart, weekCopySummary.targetWeekEnd),
            }) }}
          </div>
          <button
            type="button"
            class="mt-3 inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
             :disabled="readonly"
             @click="emit('copy-week')"
            >
             {{ t('workspace.roster.assignmentDrawer.copyWeek') }}
           </button>
        </div>

        <div v-if="validationWarning" class="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div class="flex gap-3">
            <AlertCircle class="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
            <div>
              <div class="text-sm font-medium text-amber-800">{{ t('workspace.roster.assignmentDrawer.validationWarning') }}</div>
              <div class="mt-0.5 text-xs leading-relaxed text-amber-700">{{ validationWarning }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex gap-3">
        <button
          type="button"
          class="flex-1 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          @click="emit('update:modelValue', false)"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="button"
          class="flex flex-1 items-center justify-center gap-2 rounded-md border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 shadow-sm transition-colors hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="readonly || !hasSelectionChanged"
          @click="emit('apply-and-next')"
        >
          <Check class="h-4 w-4" />
          {{ t('workspace.roster.assignmentDrawer.applyNext') }}
        </button>
        <button
          type="button"
          class="flex flex-1 items-center justify-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="readonly || !hasSelectionChanged"
          @click="emit('apply')"
        >
          <Check class="h-4 w-4" />
          {{ readonly ? t('common.readonlyMode') : hasSelectionChanged ? t('workspace.roster.assignmentDrawer.applyChange') : t('workspace.roster.assignmentDrawer.noChanges') }}
        </button>
      </div>
    </template>
  </WorkspaceDrawer>
</template>
