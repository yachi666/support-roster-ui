<script setup>
import { computed, onMounted, reactive, shallowRef } from 'vue'
import { Clock3, Pencil, Plus, Search, Trash2 } from 'lucide-vue-next'
import { api } from '@/api'
import { applyApiFieldErrors, clearFieldErrors, getApiErrorMessage } from '../lib/formErrors'
import { addMinutesToTime, createTimeOptions, describeShiftWindow, normalizeTimeValue, toMinutes } from '../lib/shiftTime'
import WorkspaceDrawer from '../components/WorkspaceDrawer.vue'
import WorkspacePageHeader from '../components/WorkspacePageHeader.vue'
import WorkspaceSurface from '../components/WorkspaceSurface.vue'
import { normalizeWorkspaceStaffTimezone, WORKSPACE_STAFF_TIMEZONE_OPTIONS } from '../config/timezones'

const EMPTY_FORM = {
  teamIds: [],
  code: '',
  meaning: '',
  startTime: '09:00',
  endTime: '17:00',
  timezone: 'UTC',
  primaryShift: false,
  visible: true,
  colorHex: '#14b8a6',
  remark: '',
}

const TIME_OPTIONS = createTimeOptions(30)

const searchTerm = shallowRef('')
const selectedTeamFilter = shallowRef('')
const shiftDefinitions = shallowRef([])
const teams = shallowRef([])
const selectedShiftId = shallowRef(null)
const loading = shallowRef(false)
const errorMessage = shallowRef('')
const formVisible = shallowRef(false)
const deletePending = shallowRef(false)
const submitPending = shallowRef(false)
const formErrorMessage = shallowRef('')
const confirmDeleteVisible = shallowRef(false)
const fieldErrors = reactive({})
const formState = reactive({ ...EMPTY_FORM })

const shiftErrorRules = [
  {
    match: /team/i,
    field: 'teamIds',
    message: 'Select a valid team.',
  },
  {
    match: /\bcode\b/i,
    field: 'code',
  },
  {
    match: /meaning/i,
    field: 'meaning',
  },
  {
    match: /start\s*time|starttime/i,
    field: 'startTime',
  },
  {
    match: /end\s*time|endtime/i,
    field: 'endTime',
  },
  {
    match: /timezone/i,
    field: 'timezone',
  },
  {
    match: /color/i,
    field: 'colorHex',
  },
]

async function loadShiftDefinitions() {
  loading.value = true
  errorMessage.value = ''

  try {
    shiftDefinitions.value = await api.workspace.getShiftDefinitions(searchTerm.value)
  } catch (error) {
    errorMessage.value = error.message || 'Failed to load shift definitions.'
  } finally {
    loading.value = false
  }
}

async function loadTeams() {
  try {
    teams.value = await api.workspace.getTeams()
  } catch {
    teams.value = []
  }
}

const visibleShifts = computed(() => {
  const query = searchTerm.value.trim().toLowerCase()
  const teamId = selectedTeamFilter.value

  return shiftDefinitions.value.filter((shift) => {
    const shiftTeams = getShiftTeams(shift)
    const teamNames = shiftTeams.map((team) => team.name).join(' ')
    const matchesSearch = !query || [shift.code, shift.meaning, shift.teamName, shift.teamCode, teamNames].join(' ').toLowerCase().includes(query)
    const matchesTeam = !teamId || shiftTeams.some((team) => String(team.id) === teamId)
    return matchesSearch && matchesTeam
  })
})

const selectedShift = computed(() => shiftDefinitions.value.find((shift) => shift.id === selectedShiftId.value) || null)
const drawerOpen = computed(() => Boolean(selectedShift.value) || formVisible.value)

function previewStyle(shift) {
  const start = (toMinutes(shift.startTime) / 1440) * 100
  let end = (toMinutes(shift.endTime) / 1440) * 100

  if (end <= start) {
    end = 100
  }

  return {
    left: `${start}%`,
    right: `${Math.max(0, 100 - end)}%`,
    backgroundColor: shift.colorHex || '#94a3b8',
  }
}

function codeIconStyle(shift) {
  if (!shift.colorHex) {
    return {}
  }
  return {
    backgroundColor: shift.colorHex,
    borderColor: shift.colorHex,
    color: '#ffffff',
  }
}

const timeSummary = computed(() => describeShiftWindow(formState.startTime, formState.endTime))

function getShiftTeams(shift) {
  if (shift.teams?.length) {
    return shift.teams
  }
  if (shift.teamId || shift.teamName) {
    return [{ id: shift.teamId, name: shift.teamName || 'Unknown Team' }]
  }
  return []
}

function toggleFormTeam(teamId) {
  const normalizedId = String(teamId)
  if (formState.teamIds.includes(normalizedId)) {
    formState.teamIds = formState.teamIds.filter((currentId) => currentId !== normalizedId)
    return
  }

  formState.teamIds = [...formState.teamIds, normalizedId]
}

function applyDurationPreset(durationMinutes) {
  formState.endTime = addMinutesToTime(formState.startTime, durationMinutes)
}

function handleStartTimeChange() {
  formState.startTime = normalizeTimeValue(formState.startTime)
  if (!formState.endTime || normalizeTimeValue(formState.endTime) === formState.startTime) {
    applyDurationPreset(8 * 60)
  }
}

function handleEndTimeChange() {
  formState.endTime = normalizeTimeValue(formState.endTime)
}

function resetForm() {
  Object.assign(formState, { ...EMPTY_FORM, teamIds: [] })
  formErrorMessage.value = ''
  confirmDeleteVisible.value = false
  clearFieldErrors(fieldErrors)
}

function fillForm(shift) {
  const shiftTeams = shift?.teams?.length ? shift.teams : shift?.teamId ? [{ id: shift.teamId }] : []

  Object.assign(formState, {
    teamIds: shiftTeams.map((team) => String(team.id)),
    code: shift?.code || '',
    meaning: shift?.meaning || '',
    startTime: normalizeTimeValue(shift?.startTime) || '09:00',
    endTime: normalizeTimeValue(shift?.endTime) || '17:00',
    timezone: normalizeWorkspaceStaffTimezone(shift?.timezone),
    primaryShift: Boolean(shift?.primaryShift),
    visible: shift?.visible !== false,
    colorHex: shift?.colorHex || '#14b8a6',
    remark: shift?.remark || '',
  })
}

function openCreateDrawer() {
  selectedShiftId.value = null
  resetForm()
  formVisible.value = true
}

function openShiftDrawer(shift) {
  selectedShiftId.value = shift.id
  fillForm(shift)
  formVisible.value = true
}

function validateForm() {
  clearFieldErrors(fieldErrors)

  if (!formState.teamIds.length) fieldErrors.teamIds = 'Select at least one team.'
  if (!formState.code.trim()) fieldErrors.code = 'Shift code is required.'
  if (!/^[A-Za-z0-9_+-]{1,16}$/.test(formState.code.trim())) fieldErrors.code = 'Use 1-16 letters, numbers, _, + or -.'
  if (!formState.meaning.trim()) fieldErrors.meaning = 'Meaning is required.'
  if (!formState.startTime) fieldErrors.startTime = 'Start time is required.'
  if (!formState.endTime) fieldErrors.endTime = 'End time is required.'
  if (formState.startTime && formState.endTime && formState.startTime === formState.endTime) fieldErrors.endTime = 'End time must differ from start time.'
  if (formState.colorHex.trim() && !/^#([0-9a-fA-F]{6})$/.test(formState.colorHex.trim())) fieldErrors.colorHex = 'Use a 6-digit hex color.'
  if (!formState.timezone.trim()) fieldErrors.timezone = 'Timezone is required.'
  if (formState.timezone.trim().length > 64) fieldErrors.timezone = 'Timezone must be 64 characters or fewer.'
  if (formState.remark.trim().length > 500) fieldErrors.remark = 'Remark must be 500 characters or fewer.'

  return Object.keys(fieldErrors).length === 0
}

async function saveShift() {
  if (submitPending.value) {
    return
  }

  formErrorMessage.value = ''
  confirmDeleteVisible.value = false

  if (!validateForm()) {
    formErrorMessage.value = 'Please correct the highlighted fields before saving.'
    return
  }

  submitPending.value = true

  try {
    const payload = {
      teamIds: formState.teamIds,
      code: formState.code.trim(),
      meaning: formState.meaning.trim(),
      startTime: formState.startTime,
      endTime: formState.endTime,
      timezone: formState.timezone.trim(),
      primaryShift: formState.primaryShift,
      visible: formState.visible,
      colorHex: formState.colorHex.trim(),
      remark: formState.remark.trim(),
    }

    if (selectedShift.value) {
      await api.workspace.updateShiftDefinition(selectedShift.value.id, payload)
    } else {
      await api.workspace.createShiftDefinition(payload)
    }

    await loadShiftDefinitions()
    closeDrawer()
  } catch (error) {
    const hasFieldErrors = applyApiFieldErrors(error, fieldErrors, shiftErrorRules)
    formErrorMessage.value = hasFieldErrors ? 'Please correct the highlighted fields before saving.' : getApiErrorMessage(error, 'Failed to save shift definition.')
  } finally {
    submitPending.value = false
  }
}

function promptDeleteShift() {
  confirmDeleteVisible.value = true
  formErrorMessage.value = ''
}

async function confirmDeleteShift() {
  if (!selectedShift.value || deletePending.value) {
    return
  }

  deletePending.value = true
  formErrorMessage.value = ''

  try {
    await api.workspace.deleteShiftDefinition(selectedShift.value.id)
    await loadShiftDefinitions()
    closeDrawer()
  } catch (error) {
    formErrorMessage.value = getApiErrorMessage(error, 'Failed to delete shift definition.')
  } finally {
    deletePending.value = false
  }
}

function cancelDeleteShift() {
  confirmDeleteVisible.value = false
}

function closeDrawer() {
  selectedShiftId.value = null
  formVisible.value = false
  resetForm()
}

function inputClass(fieldName) {
  return [
    'w-full rounded-md border px-3 py-2 outline-none transition focus:ring-2 focus:ring-teal-500/20',
    fieldErrors[fieldName] ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-teal-500',
  ]
}

onMounted(() => {
  void loadTeams()
  void loadShiftDefinitions()
})
</script>

<template>
  <div class="flex h-full flex-col bg-slate-50">
    <div class="flex-1 overflow-auto p-8">
      <div class="mx-auto flex max-w-7xl flex-col gap-8">
        <WorkspacePageHeader
          title="Shift Definitions"
          description="Manage shift codes, timelines, and primary status."
        >
          <template #actions>
            <div class="relative">
              <label for="workspace-shift-search" class="sr-only">Search shift definitions</label>
              <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="workspace-shift-search"
                name="workspace-shift-search"
                v-model="searchTerm"
                type="text"
                placeholder="Search codes..."
                class="w-64 rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <select
              v-model="selectedTeamFilter"
              class="w-44 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="">All Teams</option>
              <option v-for="team in teams" :key="team.id" :value="String(team.id)">{{ team.name }}</option>
            </select>
            <button class="flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700" @click="openCreateDrawer">
              <Plus class="h-4 w-4" />
              New Shift Code
            </button>
          </template>
        </WorkspacePageHeader>

        <WorkspaceSurface v-if="errorMessage" tone="muted" class="border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          <div class="flex items-center justify-between gap-4">
            <span>{{ errorMessage }}</span>
            <button class="rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100" @click="loadShiftDefinitions">
              Retry
            </button>
          </div>
        </WorkspaceSurface>

        <WorkspaceSurface :padded="false">
          <div class="overflow-x-auto">
            <table class="min-w-full text-left text-sm text-slate-600">
              <thead class="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th class="w-20 px-6 py-3">Code</th>
                  <th class="px-6 py-3">Meaning</th>
                  <th class="px-6 py-3">TEAM</th>
                  <th class="px-6 py-3">Time (24h)</th>
                  <th class="w-48 px-6 py-3">Timeline Preview</th>
                  <th class="px-6 py-3 text-center">Type</th>
                  <th class="px-6 py-3 text-center">Visible</th>
                  <th class="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="shift in visibleShifts" :key="shift.id || shift.code" class="group cursor-pointer transition-colors hover:bg-slate-50/80" @click="openShiftDrawer(shift)">
                  <td class="px-6 py-4">
                    <span class="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-200 bg-slate-100 font-mono text-sm font-semibold text-slate-800 shadow-sm" :style="codeIconStyle(shift)">
                      {{ shift.code }}
                    </span>
                  </td>
                  <td class="px-6 py-4 font-medium text-slate-800">{{ shift.meaning }}</td>
                  <td class="px-6 py-4">
                    <div v-if="getShiftTeams(shift).length" class="flex flex-wrap gap-1.5">
                      <span v-for="team in getShiftTeams(shift)" :key="team.id" class="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600">
                        {{ team.name }}
                      </span>
                    </div>
                    <span v-else class="text-xs text-slate-500">-</span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2 font-mono text-xs text-slate-600">
                      <Clock3 class="h-3.5 w-3.5 text-slate-400" />
                      <span>{{ normalizeTimeValue(shift.startTime) }} - {{ normalizeTimeValue(shift.endTime) }}</span>
                      <span class="rounded bg-slate-100 px-1 text-[10px] text-slate-400">{{ normalizeWorkspaceStaffTimezone(shift.timezone) }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="relative h-1.5 w-full overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                      <div class="absolute inset-y-0 rounded-full" :style="previewStyle(shift)"></div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span :class="['inline-flex rounded border px-2 py-0.5 text-[11px] font-medium', shift.primaryShift ? 'border-indigo-100 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-slate-100 text-slate-600']">
                      {{ shift.primaryShift ? 'Primary' : 'Secondary' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <div class="flex justify-center">
                      <div :class="['h-2.5 w-2.5 rounded-full', shift.visible ? 'bg-emerald-500 shadow-[0_0_0_2px_#d1fae5]' : 'bg-slate-300']"></div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right text-xs text-slate-400">
                    <span class="opacity-0 transition-opacity group-hover:opacity-100">Edit</span>
                  </td>
                </tr>
                <tr v-if="loading">
                  <td colspan="8" class="px-6 py-10 text-center text-sm text-slate-500">Loading shift definitions...</td>
                </tr>
                <tr v-else-if="!visibleShifts.length">
                  <td colspan="8" class="px-6 py-10 text-center text-sm text-slate-500">No shift definitions matched the current filter.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </WorkspaceSurface>
      </div>
    </div>

    <WorkspaceDrawer :model-value="drawerOpen" :title="selectedShift ? 'Edit Shift Definition' : 'Create Shift Definition'" width="460px" @update:model-value="closeDrawer">
      <template #subtitle>
        <p class="mt-1 text-xs text-slate-500">The drawer saves directly to the workspace shift definition registry.</p>
      </template>

      <form class="space-y-5" @submit.prevent="saveShift">
        <WorkspaceSurface v-if="formErrorMessage" tone="muted" class="border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {{ formErrorMessage }}
        </WorkspaceSurface>

        <WorkspaceSurface v-if="confirmDeleteVisible && selectedShift" tone="muted" class="space-y-3 border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p>Delete shift code {{ selectedShift.code }}?</p>
          <p class="text-xs text-amber-800">This removes the definition from planners and future roster edits immediately.</p>
          <div class="flex items-center justify-end gap-2">
            <button type="button" class="rounded-md border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 transition-colors hover:bg-amber-100" @click="cancelDeleteShift">
              Keep Shift
            </button>
            <button type="button" class="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60" :disabled="deletePending" @click="confirmDeleteShift">
              {{ deletePending ? 'Deleting...' : 'Confirm Delete' }}
            </button>
          </div>
        </WorkspaceSurface>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span class="font-medium">TEAMS</span>
            <div :class="['rounded-lg border bg-white p-3', fieldErrors.teamIds ? 'border-rose-300' : 'border-slate-200']">
              <div class="mb-2 flex items-center justify-between text-xs text-slate-500">
                <span>Choose one or more teams to share this shift definition.</span>
                <span>{{ formState.teamIds.length }} selected</span>
              </div>
              <div class="grid gap-2 md:grid-cols-2">
                <label v-for="team in teams" :key="team.id" class="flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 transition-colors hover:border-teal-300 hover:bg-teal-50/40">
                  <input :checked="formState.teamIds.includes(String(team.id))" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" @change="toggleFormTeam(team.id)" />
                  <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: team.color || '#94a3b8' }"></span>
                  <span>{{ team.name }}</span>
                </label>
              </div>
            </div>
            <p v-if="fieldErrors.teamIds" class="text-xs text-rose-600">{{ fieldErrors.teamIds }}</p>
          </label>
          <label class="space-y-2 text-sm text-slate-700">
            <span class="font-medium">Shift Code</span>
            <input id="shift-code" v-model="formState.code" name="code" type="text" :class="inputClass('code')" />
            <p v-if="fieldErrors.code" class="text-xs text-rose-600">{{ fieldErrors.code }}</p>
          </label>
          <label class="space-y-2 text-sm text-slate-700">
            <span class="font-medium">Meaning</span>
            <input id="shift-meaning" v-model="formState.meaning" name="meaning" type="text" :class="inputClass('meaning')" />
            <p v-if="fieldErrors.meaning" class="text-xs text-rose-600">{{ fieldErrors.meaning }}</p>
          </label>
          <label class="space-y-2 text-sm text-slate-700">
            <span class="font-medium">Start Time</span>
            <select id="shift-startTime" v-model="formState.startTime" name="startTime" :class="['bg-white', ...inputClass('startTime')]" @change="handleStartTimeChange">
              <option v-for="timeOption in TIME_OPTIONS" :key="timeOption.value" :value="timeOption.value">{{ timeOption.label }}</option>
            </select>
            <p v-if="fieldErrors.startTime" class="text-xs text-rose-600">{{ fieldErrors.startTime }}</p>
          </label>
          <label class="space-y-2 text-sm text-slate-700">
            <span class="font-medium">End Time</span>
            <select id="shift-endTime" v-model="formState.endTime" name="endTime" :class="['bg-white', ...inputClass('endTime')]" @change="handleEndTimeChange">
              <option v-for="timeOption in TIME_OPTIONS" :key="timeOption.value" :value="timeOption.value">{{ timeOption.label }}</option>
            </select>
            <p v-if="fieldErrors.endTime" class="text-xs text-rose-600">{{ fieldErrors.endTime }}</p>
          </label>
          <div class="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span class="font-medium">Quick Duration</span>
            <div class="flex flex-wrap gap-2">
              <button type="button" class="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700" @click="applyDurationPreset(8 * 60)">+8h</button>
              <button type="button" class="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700" @click="applyDurationPreset(9 * 60)">+9h</button>
              <button type="button" class="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700" @click="applyDurationPreset(12 * 60)">+12h</button>
            </div>
            <p class="text-xs text-slate-500">{{ timeSummary || 'Select a start and end time.' }}</p>
          </div>
          <label class="space-y-2 text-sm text-slate-700">
            <span class="font-medium">Timezone</span>
            <select id="shift-timezone" v-model="formState.timezone" name="timezone" :class="['bg-white', ...inputClass('timezone')]">
              <option v-for="timezoneOption in WORKSPACE_STAFF_TIMEZONE_OPTIONS" :key="timezoneOption.value" :value="timezoneOption.value">
                {{ timezoneOption.label }}
              </option>
            </select>
            <p v-if="fieldErrors.timezone" class="text-xs text-rose-600">{{ fieldErrors.timezone }}</p>
          </label>
          <label class="space-y-2 text-sm text-slate-700">
            <span class="font-medium">Color</span>
            <input id="shift-colorHex" v-model="formState.colorHex" name="colorHex" type="color" :class="['h-10 bg-white px-2 py-1', ...inputClass('colorHex')]" />
            <p v-if="fieldErrors.colorHex" class="text-xs text-rose-600">{{ fieldErrors.colorHex }}</p>
          </label>
          <label class="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-700">
            <input id="shift-primaryShift" v-model="formState.primaryShift" name="primaryShift" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
            <span>Primary shift</span>
          </label>
          <label class="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-700">
            <input id="shift-visible" v-model="formState.visible" name="visible" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
            <span>Visible in planners</span>
          </label>
          <label class="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span class="font-medium">Remark</span>
            <textarea id="shift-remark" v-model="formState.remark" name="remark" rows="4" :class="inputClass('remark')"></textarea>
            <p v-if="fieldErrors.remark" class="text-xs text-rose-600">{{ fieldErrors.remark }}</p>
          </label>
        </div>
      </form>

      <template #footer>
        <div class="flex items-center justify-between gap-3">
          <button
            v-if="selectedShift"
            type="button"
            class="inline-flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="deletePending"
            @click="promptDeleteShift"
          >
            <Trash2 class="h-4 w-4" />
            Delete
          </button>
          <div v-else></div>
          <div class="flex items-center gap-3">
            <button type="button" class="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50" @click="closeDrawer">Cancel</button>
            <button type="button" class="inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60" :disabled="submitPending" @click="saveShift">
              <Pencil class="h-4 w-4" />
              {{ submitPending ? 'Saving...' : selectedShift ? 'Save Changes' : 'Create Shift' }}
            </button>
          </div>
        </div>
      </template>
    </WorkspaceDrawer>
  </div>
</template>
