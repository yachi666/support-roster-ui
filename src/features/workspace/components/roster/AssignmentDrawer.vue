<script setup>
import { computed, ref, watch } from 'vue'
import { AlertCircle, Check } from 'lucide-vue-next'
import AvatarImage from '../AvatarImage.vue'
import WorkspaceDrawer from '../WorkspaceDrawer.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  assignment: { type: Object, default: null },
  selectedRange: { type: Object, default: null },
  selectedShiftCode: { type: String, default: '' },
  shiftCodeOptions: { type: Array, required: true },
  validationWarning: { type: String, default: '' },
  year: { type: Number, required: true },
  month: { type: Number, required: true },
})

const emit = defineEmits(['update:modelValue', 'select-code', 'apply', 'apply-and-next', 'copy-week', 'apply-range', 'clear-range'])

const normalizedCurrentCode = computed(() => props.assignment?.currentCode || 'Unassigned')
const normalizedNextCode = computed(() => props.selectedShiftCode === 'Clear' || !props.selectedShiftCode ? 'Unassigned' : props.selectedShiftCode)
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
      label: 'Previous Day',
      code: previousDayCode,
      displayCode: previousDayCode || 'Clear',
    })
  }

  if (previousWeekCode !== null && !seenLabels.has('Previous Week')) {
    options.push({
      label: 'Previous Week',
      code: previousWeekCode,
      displayCode: previousWeekCode || 'Clear',
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
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(props.year, props.month - 1, day))
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
    title="Edit Assignment"
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
          <div class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Assignment Date</div>
          <div class="flex items-center gap-2">
            <label for="assignment-date" class="sr-only">Assignment date</label>
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
            <div class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Current Assignment</div>
            <div class="mt-1 text-sm font-semibold text-slate-800">{{ normalizedCurrentCode }}</div>
          </div>
          <div>
            <div class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Pending Assignment</div>
            <div class="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <span>{{ normalizedNextCode }}</span>
              <span v-if="hasSelectionChanged" class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-700">
                Unsaved
              </span>
            </div>
          </div>
        </div>

        <div>
          <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Shift Code</label>
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
              @click="emit('select-code', code)"
            >
              {{ code }}
            </button>
          </div>
        </div>

        <div v-if="rangeEndOptions.length > 1" class="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div class="flex items-center justify-between gap-3">
            <div class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Range Fill</div>
            <button
              v-if="selectedRange && selectedRange.endDay > assignment.day"
              type="button"
              class="text-[11px] font-medium text-slate-500 transition-colors hover:text-slate-700"
              @click="emit('clear-range')"
            >
              Reset to single day
            </button>
          </div>
          <div v-if="selectedRange && selectedRange.endDay > assignment.day" class="mt-2 text-xs text-sky-700">
            Drag selection detected: days {{ assignment.day }} - {{ selectedRange.endDay }}
          </div>
          <div class="mt-2 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label class="space-y-1.5 text-sm text-slate-700">
              <span class="block text-xs font-medium text-slate-500">
                Apply from day {{ assignment.day }} through:
              </span>
              <select
                v-model="rangeEndDay"
                class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              >
                <option v-for="day in rangeEndOptions" :key="day" :value="day">
                  Day {{ day }}
                </option>
              </select>
            </label>
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
              @click="emit('apply-range', rangeEndDay)"
            >
              Apply to Range
            </button>
          </div>
        </div>

        <div v-if="quickReuseOptions.length">
          <div class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Quick Reuse</div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in quickReuseOptions"
              :key="option.label"
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
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
          <div class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Week Copy</div>
          <div class="mt-2 text-sm text-slate-700">
            Copy {{ formatDayRange(weekCopySummary.sourceWeekStart, weekCopySummary.sourceWeekEnd) }}
            into {{ formatDayRange(weekCopySummary.targetWeekStart, weekCopySummary.targetWeekEnd) }}.
          </div>
          <button
            type="button"
            class="mt-3 inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
            @click="emit('copy-week')"
          >
            Copy Week to Next Week
          </button>
        </div>

        <div v-if="validationWarning" class="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div class="flex gap-3">
            <AlertCircle class="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
            <div>
              <div class="text-sm font-medium text-amber-800">Validation Warning</div>
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
          Cancel
        </button>
        <button
          type="button"
          class="flex flex-1 items-center justify-center gap-2 rounded-md border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 shadow-sm transition-colors hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="!hasSelectionChanged"
          @click="emit('apply-and-next')"
        >
          <Check class="h-4 w-4" />
          Apply & Next Day
        </button>
        <button
          type="button"
          class="flex flex-1 items-center justify-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="!hasSelectionChanged"
          @click="emit('apply')"
        >
          <Check class="h-4 w-4" />
          {{ hasSelectionChanged ? 'Apply Change' : 'No Changes Yet' }}
        </button>
      </div>
    </template>
  </WorkspaceDrawer>
</template>
