<script setup>
import { AlertCircle, Check } from 'lucide-vue-next'
import WorkspaceDrawer from '../WorkspaceDrawer.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  assignment: { type: Object, default: null },
  selectedShiftCode: { type: String, default: '' },
  shiftCodeOptions: { type: Array, required: true },
  validationWarning: { type: String, default: '' },
  year: { type: Number, required: true },
  month: { type: Number, required: true },
})

const emit = defineEmits(['update:modelValue', 'select-code', 'apply'])

function formatAssignmentDate(day) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(props.year, props.month - 1, day))
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
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
            {{ assignment.staff.name.split(' ').map((part) => part[0]).join('') }}
          </div>
          <div>
            <div class="text-sm font-semibold text-slate-800">{{ assignment.staff.name }}</div>
            <div class="text-xs text-slate-500">{{ assignment.group.team }} • {{ assignment.staff.role }}</div>
          </div>
        </div>

        <div>
          <div class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Date Range</div>
          <div class="flex items-center gap-2">
            <label for="assignment-date-start" class="sr-only">Assignment start date</label>
            <input
              id="assignment-date-start"
              name="assignment-date-start"
              type="text"
              :value="formatAssignmentDate(assignment.day)"
              class="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700"
              readonly
            />
            <span class="text-sm text-slate-400">to</span>
            <label for="assignment-date-end" class="sr-only">Assignment end date</label>
            <input
              id="assignment-date-end"
              name="assignment-date-end"
              type="text"
              :value="formatAssignmentDate(assignment.day)"
              class="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700"
              readonly
            />
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
          class="flex flex-1 items-center justify-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700"
          @click="emit('apply')"
        >
          <Check class="h-4 w-4" />
          Apply
        </button>
      </div>
    </template>
  </WorkspaceDrawer>
</template>
