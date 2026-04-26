<script setup>
import { computed, reactive } from 'vue'
import { X } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps({
  presetRoles: {
    type: Array,
    default: () => [],
  },
  availableStaffIds: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['submit', 'cancel'])

const fieldErrors = reactive({
  teamName: '',
  teamEmail: '',
  selectedTags: '',
  selectedStaff: '',
})

const formState = reactive({
  teamName: '',
  teamEmail: '',
  eimId: '',
  xMatter: '',
  gsd: '',
  tagInput: '',
  selectedTags: [],
  staffInput: '',
  otherInfo: '',
})

const availableTagSuggestions = computed(() =>
  props.presetRoles.filter((tag) => !formState.selectedTags.includes(tag)),
)

const staffIdPreview = computed(() => parseCommaSeparatedTokens(formState.staffInput))

function parseCommaSeparatedTokens(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, collection) => collection.indexOf(item) === index)
}

function resetFieldError(key) {
  fieldErrors[key] = ''
}

function pushUniqueToken(collection, value) {
  const normalizedValue = value.trim()
  if (!normalizedValue || collection.includes(normalizedValue)) {
    return false
  }

  collection.push(normalizedValue)
  return true
}

function removeToken(collection, value) {
  const index = collection.indexOf(value)
  if (index >= 0) {
    collection.splice(index, 1)
  }
}

function handleTagKeydown(event) {
  if ((event.key === 'Enter' || event.key === ',') && formState.tagInput.trim()) {
    event.preventDefault()
    if (pushUniqueToken(formState.selectedTags, formState.tagInput.replace(/,$/, ''))) {
      resetFieldError('selectedTags')
    }
    formState.tagInput = ''
  } else if (event.key === 'Backspace' && !formState.tagInput && formState.selectedTags.length) {
    formState.selectedTags.pop()
  }
}

function validateForm() {
  fieldErrors.teamName = formState.teamName.trim() ? '' : 'Team name is required.'
  fieldErrors.teamEmail = /\S+@\S+\.\S+/.test(formState.teamEmail.trim()) ? '' : 'A valid team email is required.'
  fieldErrors.selectedTags = formState.selectedTags.length ? '' : 'Add at least one tag.'
  fieldErrors.selectedStaff = staffIdPreview.value.length ? '' : 'Add at least one staff ID.'

  return !fieldErrors.teamName && !fieldErrors.teamEmail && !fieldErrors.selectedTags && !fieldErrors.selectedStaff
}

function submitForm() {
  if (!validateForm()) {
    return
  }

  const otherInfo = formState.otherInfo.trim()

  emit('submit', {
    name: formState.teamName.trim(),
    email: formState.teamEmail.trim(),
    eim: formState.eimId.trim(),
    xMatter: formState.xMatter.trim(),
    gsd: formState.gsd.trim(),
    roles: [...formState.selectedTags],
    staffIds: [...staffIdPreview.value],
    links: otherInfo ? [{ label: 'Other', url: otherInfo }] : [],
  })
}
</script>

<template>
  <form class="w-full max-w-6xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" @submit.prevent="submitForm">
    <div class="border-b border-slate-100 bg-white px-5 py-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-slate-950">Team contact profile</h2>
          <p class="mt-0.5 text-xs text-slate-500">Create one compact record for service contacts, tags, and owning staff.</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
            @click="emit('cancel')"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="rounded-lg border border-transparent bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
          >
            Save Team
          </button>
        </div>
      </div>
    </div>

    <div class="grid gap-5 p-5 lg:grid-cols-[1fr_1.05fr]">
      <section class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5 sm:col-span-2">
            <label class="block text-xs font-semibold uppercase tracking-wide text-slate-500" for="teamName">Team Name</label>
            <input
              id="teamName"
              v-model="formState.teamName"
              type="text"
              placeholder="e.g. Payments Core"
              :aria-invalid="Boolean(fieldErrors.teamName)"
              :aria-describedby="fieldErrors.teamName ? 'teamName-error' : undefined"
              class="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
              @input="resetFieldError('teamName')"
            >
            <p v-if="fieldErrors.teamName" id="teamName-error" role="alert" aria-live="polite" class="text-xs text-red-600">{{ fieldErrors.teamName }}</p>
          </div>

          <div class="space-y-1.5 sm:col-span-2">
            <label class="block text-xs font-semibold uppercase tracking-wide text-slate-500" for="teamEmail">Team Email</label>
            <input
              id="teamEmail"
              v-model="formState.teamEmail"
              type="email"
              placeholder="team@company.com"
              :aria-invalid="Boolean(fieldErrors.teamEmail)"
              :aria-describedby="fieldErrors.teamEmail ? 'teamEmail-error' : undefined"
              class="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
              @input="resetFieldError('teamEmail')"
            >
            <p v-if="fieldErrors.teamEmail" id="teamEmail-error" role="alert" aria-live="polite" class="text-xs text-red-600">{{ fieldErrors.teamEmail }}</p>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold uppercase tracking-wide text-slate-500" for="eimId">EIM ID</label>
            <input
              id="eimId"
              v-model="formState.eimId"
              type="text"
              placeholder="EIM-1234"
              class="h-10 w-full rounded-lg border border-slate-300 px-3 font-mono text-sm shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
            >
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold uppercase tracking-wide text-slate-500" for="xMatter">xMatter Group</label>
            <input
              id="xMatter"
              v-model="formState.xMatter"
              type="text"
              placeholder="XM-PAY-01"
              class="h-10 w-full rounded-lg border border-slate-300 px-3 font-mono text-sm shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
            >
          </div>

          <div class="space-y-1.5 sm:col-span-2">
            <label class="block text-xs font-semibold uppercase tracking-wide text-slate-500" for="gsdGroup">GSD Group</label>
            <input
              id="gsdGroup"
              v-model="formState.gsd"
              type="text"
              placeholder="GSD-PAY-882"
              class="h-10 w-full rounded-lg border border-slate-300 px-3 font-mono text-sm shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
            >
          </div>
        </div>
      </section>

      <section class="space-y-4">
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold uppercase tracking-wide text-slate-500" for="tagInput">Tag</label>
          <div
            class="min-h-10 cursor-text rounded-lg border border-slate-300 bg-white p-1.5 shadow-sm transition-all focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/15"
            @click="$refs.tagInput?.focus()"
          >
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="tag in formState.selectedTags"
                :key="tag"
                :class="cn(
                  'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold',
                  tag === 'Upstream'
                    ? 'border-teal-200 bg-teal-50 text-teal-700'
                    : tag === 'Downstream'
                      ? 'border-sky-200 bg-sky-50 text-sky-700'
                      : 'border-slate-200 bg-slate-100 text-slate-700',
                )"
              >
                {{ tag }}
                <button
                  type="button"
                  class="rounded-full p-0.5 text-slate-400 transition-colors hover:bg-black/5 hover:text-slate-600"
                  @click.stop="removeToken(formState.selectedTags, tag)"
                >
                  <X class="h-3 w-3" />
                </button>
              </span>
              <input
                id="tagInput"
                ref="tagInput"
                v-model="formState.tagInput"
                type="text"
                :placeholder="formState.selectedTags.length ? '' : 'Type tag and press Enter'"
                :aria-invalid="Boolean(fieldErrors.selectedTags)"
                :aria-describedby="fieldErrors.selectedTags ? 'tagInput-error' : undefined"
                class="min-w-[10rem] flex-1 bg-transparent px-1 py-1 text-sm outline-none"
                @keydown="handleTagKeydown"
              >
            </div>
          </div>
          <div v-if="availableTagSuggestions.length" class="flex flex-wrap gap-2">
            <button
              v-for="preset in availableTagSuggestions"
              :key="preset"
              type="button"
              class="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
              @click="pushUniqueToken(formState.selectedTags, preset); resetFieldError('selectedTags')"
            >
              + {{ preset }}
            </button>
          </div>
          <p v-if="fieldErrors.selectedTags" id="tagInput-error" role="alert" aria-live="polite" class="text-xs text-red-600">{{ fieldErrors.selectedTags }}</p>
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-semibold uppercase tracking-wide text-slate-500" for="staffIds">Staff IDs</label>
          <input
            id="staffIds"
            v-model="formState.staffInput"
            type="text"
            placeholder="S-10492, S-94281, S-55219"
            :aria-invalid="Boolean(fieldErrors.selectedStaff)"
            :aria-describedby="fieldErrors.selectedStaff ? 'staffIds-error' : undefined"
            class="h-10 w-full rounded-lg border border-slate-300 px-3 font-mono text-sm shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
            @input="resetFieldError('selectedStaff')"
          >
          <div class="flex min-h-6 flex-wrap gap-1.5">
            <span
              v-for="staffId in staffIdPreview"
              :key="staffId"
              class="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs font-medium text-slate-600"
            >
              {{ staffId }}
            </span>
          </div>
          <p v-if="fieldErrors.selectedStaff" id="staffIds-error" role="alert" aria-live="polite" class="text-xs text-red-600">{{ fieldErrors.selectedStaff }}</p>
        </div>

        <div class="space-y-1.5">
            <label class="block text-xs font-semibold uppercase tracking-wide text-slate-500" for="otherInfo">Other Information</label>
          <input
            id="otherInfo"
            v-model="formState.otherInfo"
            type="text"
            placeholder="Optional notes, wiki, dashboard, or escalation link"
            class="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
          >
        </div>

        <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-500">
          Staff IDs support comma-separated input. Tags can be added with Enter or comma.
        </div>
      </section>
    </div>
  </form>
</template>
