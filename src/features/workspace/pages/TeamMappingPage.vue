<script setup>
import { computed, onMounted, reactive, shallowRef } from 'vue'
import { Eye, GripVertical, HelpCircle, Plus, Settings2, Trash2 } from 'lucide-vue-next'
import { api } from '@/api'
import { applyApiFieldErrors, clearFieldErrors, getApiErrorMessage } from '../lib/formErrors'
import WorkspaceDrawer from '../components/WorkspaceDrawer.vue'
import WorkspacePageHeader from '../components/WorkspacePageHeader.vue'
import WorkspaceSurface from '../components/WorkspaceSurface.vue'

const EMPTY_FORM = {
  teamCode: '',
  name: '',
  color: '#14b8a6',
  displayOrder: 0,
  visible: true,
  description: '',
}

const teams = shallowRef([])
const selectedTeamId = shallowRef(null)
const loading = shallowRef(false)
const errorMessage = shallowRef('')
const formVisible = shallowRef(false)
const submitPending = shallowRef(false)
const deletePending = shallowRef(false)
const formErrorMessage = shallowRef('')
const confirmDeleteVisible = shallowRef(false)
const fieldErrors = reactive({})
const formState = reactive({ ...EMPTY_FORM })

const teamErrorRules = [
  {
    match: /team\s*code|teamcode/i,
    field: 'teamCode',
  },
  {
    match: /team\s*name|\bname\b/i,
    field: 'name',
  },
  {
    match: /color/i,
    field: 'color',
  },
  {
    match: /display\s*order|displayorder/i,
    field: 'displayOrder',
  },
]

const sortedTeams = computed(() =>
  [...teams.value].sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0)),
)

const visibleTeams = computed(() => sortedTeams.value.filter((team) => team.visible))
const selectedTeam = computed(() => teams.value.find((team) => team.id === selectedTeamId.value) || null)
const drawerOpen = computed(() => Boolean(selectedTeam.value) || formVisible.value)

async function loadTeams() {
  loading.value = true
  errorMessage.value = ''

  try {
    teams.value = await api.workspace.getTeams()
  } catch (error) {
    errorMessage.value = error.message || 'Failed to load team mappings.'
  } finally {
    loading.value = false
  }
}

function teamColorStyle(team) {
  return { backgroundColor: team.color || '#94a3b8' }
}

function resetForm() {
  Object.assign(formState, EMPTY_FORM)
  formErrorMessage.value = ''
  confirmDeleteVisible.value = false
  clearFieldErrors(fieldErrors)
}

function fillForm(team) {
  Object.assign(formState, {
    teamCode: team?.teamCode || '',
    name: team?.name || '',
    color: team?.color || '#14b8a6',
    displayOrder: team?.displayOrder ?? 0,
    visible: team?.visible !== false,
    description: team?.description || '',
  })
}

function openCreateDrawer() {
  selectedTeamId.value = null
  resetForm()
  formVisible.value = true
}

function openTeamDrawer(team) {
  selectedTeamId.value = team.id
  fillForm(team)
  formVisible.value = true
}

function validateForm() {
  clearFieldErrors(fieldErrors)

  if (!formState.teamCode.trim()) fieldErrors.teamCode = 'Team code is required.'
  if (!/^[A-Za-z0-9_-]{1,24}$/.test(formState.teamCode.trim())) fieldErrors.teamCode = 'Use 1-24 letters, numbers, _ or -.'
  if (!formState.name.trim()) fieldErrors.name = 'Team name is required.'
  if (!/^#([0-9a-fA-F]{6})$/.test(formState.color.trim())) fieldErrors.color = 'Use a 6-digit hex color.'
  if (!Number.isInteger(Number(formState.displayOrder)) || Number(formState.displayOrder) < 0) fieldErrors.displayOrder = 'Display order must be a non-negative integer.'
  if (formState.description.trim().length > 500) fieldErrors.description = 'Description must be 500 characters or fewer.'

  return Object.keys(fieldErrors).length === 0
}

async function saveTeam() {
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
      teamCode: formState.teamCode.trim(),
      name: formState.name.trim(),
      color: formState.color.trim(),
      displayOrder: Number(formState.displayOrder),
      visible: formState.visible,
      description: formState.description.trim(),
    }

    if (selectedTeam.value) {
      await api.workspace.updateTeam(selectedTeam.value.id, payload)
    } else {
      await api.workspace.createTeam(payload)
    }

    await loadTeams()
    closeDrawer()
  } catch (error) {
    const hasFieldErrors = applyApiFieldErrors(error, fieldErrors, teamErrorRules)
    formErrorMessage.value = hasFieldErrors ? 'Please correct the highlighted fields before saving.' : getApiErrorMessage(error, 'Failed to save team mapping.')
  } finally {
    submitPending.value = false
  }
}

function promptDeleteTeam() {
  confirmDeleteVisible.value = true
  formErrorMessage.value = ''
}

async function confirmDeleteTeam() {
  if (!selectedTeam.value || deletePending.value) {
    return
  }

  deletePending.value = true
  formErrorMessage.value = ''

  try {
    await api.workspace.deleteTeam(selectedTeam.value.id)
    await loadTeams()
    closeDrawer()
  } catch (error) {
    formErrorMessage.value = getApiErrorMessage(error, 'Failed to delete team mapping.')
  } finally {
    deletePending.value = false
  }
}

function cancelDeleteTeam() {
  confirmDeleteVisible.value = false
}

function closeDrawer() {
  selectedTeamId.value = null
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
})
</script>

<template>
  <div class="flex h-full flex-col bg-slate-50">
    <div class="flex-1 overflow-auto p-8">
      <div class="mx-auto flex max-w-6xl flex-col gap-8">
        <WorkspacePageHeader
          title="Team Management"
          description="Configure team groupings, display orders, and downstream dashboard visibility."
        >
          <template #actions>
            <button class="inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700" @click="openCreateDrawer">
              <Plus class="h-4 w-4" />
              Create Team
            </button>
          </template>
        </WorkspacePageHeader>

        <WorkspaceSurface v-if="errorMessage" tone="muted" class="border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          <div class="flex items-center justify-between gap-4">
            <span>{{ errorMessage }}</span>
            <button class="rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100" @click="loadTeams">
              Retry
            </button>
          </div>
        </WorkspaceSurface>

        <WorkspaceSurface tone="muted" class="flex gap-4 border-blue-200 bg-blue-50 p-5 text-blue-900">
          <HelpCircle class="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div>
            <h3 class="text-sm font-semibold">How mapping works</h3>
            <p class="mt-1 text-sm leading-relaxed text-blue-800/80">
              These rules control how staff members are grouped on the public On-Call Dashboard.
              Teams marked as hidden remain schedulable here but stay out of downstream read-only views.
            </p>
          </div>
        </WorkspaceSurface>

        <div class="grid gap-8 lg:grid-cols-3">
          <div class="space-y-4 lg:col-span-2">
            <h2 class="px-2 text-sm font-semibold uppercase tracking-wide text-slate-700">Active Teams</h2>
            <WorkspaceSurface v-if="loading" class="p-6 text-sm text-slate-500">Loading team mappings...</WorkspaceSurface>
            <WorkspaceSurface
              v-for="team in sortedTeams"
              :key="team.id"
              class="group cursor-pointer flex items-center gap-4 p-4 transition-colors hover:border-slate-300"
              @click="openTeamDrawer(team)"
            >
              <div class="cursor-grab text-slate-300 transition-colors hover:text-slate-500">
                <GripVertical class="h-5 w-5" />
              </div>
              <div class="h-10 w-3 rounded-full" :style="teamColorStyle(team)"></div>
              <div class="flex-1">
                <div class="flex items-center gap-3">
                  <h3 class="text-base font-semibold text-slate-800">{{ team.name }}</h3>
                  <span v-if="!team.visible" class="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Hidden</span>
                </div>
                <div class="mt-1 text-[11px] text-slate-400">{{ team.teamCode }} · Order {{ team.displayOrder ?? '-' }}</div>
              </div>
              <div class="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button class="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                  <Settings2 class="h-4 w-4" />
                </button>
                <button class="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                  <Eye class="h-4 w-4" />
                </button>
              </div>
            </WorkspaceSurface>
            <WorkspaceSurface v-if="!loading && !sortedTeams.length" class="p-6 text-sm text-slate-500">
              No teams returned by the server.
            </WorkspaceSurface>
            <button class="w-full rounded-2xl border-2 border-dashed border-slate-200 py-4 text-sm font-medium text-slate-500 transition-colors hover:border-teal-400 hover:bg-teal-50/50 hover:text-teal-600" @click="openCreateDrawer">
              + Create New Team
            </button>
          </div>

          <div>
            <div class="sticky top-8 space-y-4">
              <h2 class="px-2 text-sm font-semibold uppercase tracking-wide text-slate-700">Dashboard Preview</h2>
              <WorkspaceSurface :padded="false" class="overflow-hidden">
                <div class="flex items-center justify-between bg-slate-800 px-4 py-3">
                  <span class="text-xs font-semibold text-white">Public On-Call Viewer</span>
                  <div class="flex gap-1.5">
                    <div class="h-2 w-2 rounded-full bg-slate-600"></div>
                    <div class="h-2 w-2 rounded-full bg-slate-600"></div>
                    <div class="h-2 w-2 rounded-full bg-slate-600"></div>
                  </div>
                </div>
                <div class="space-y-4 bg-slate-50 p-4">
                  <div v-for="team in visibleTeams" :key="team.id" class="space-y-2">
                    <div class="flex items-center gap-2">
                      <div class="h-2 w-2 rounded-full" :style="teamColorStyle(team)"></div>
                      <span class="text-xs font-semibold uppercase tracking-wide text-slate-700">{{ team.name }}</span>
                    </div>
                    <div class="flex gap-2 rounded border border-slate-200 bg-white p-2 text-[11px] text-slate-500">
                      <div class="h-6 w-6 flex-shrink-0 rounded-full bg-slate-100"></div>
                      <div>
                        <div class="mb-1 h-2 w-16 rounded bg-slate-200"></div>
                        <div class="h-1.5 w-12 rounded bg-slate-100"></div>
                      </div>
                    </div>
                  </div>
                  <div v-if="!loading && !visibleTeams.length" class="text-xs text-slate-500">No visible teams available for preview.</div>
                </div>
              </WorkspaceSurface>
            </div>
          </div>
        </div>
      </div>
    </div>

    <WorkspaceDrawer :model-value="drawerOpen" :title="selectedTeam ? 'Edit Team' : 'Create Team'" width="460px" @update:model-value="closeDrawer">
      <template #subtitle>
        <p class="mt-1 text-xs text-slate-500">Team definitions are persisted directly to the workspace team service.</p>
      </template>

      <form class="space-y-5" @submit.prevent="saveTeam">
        <WorkspaceSurface v-if="formErrorMessage" tone="muted" class="border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {{ formErrorMessage }}
        </WorkspaceSurface>

        <WorkspaceSurface v-if="confirmDeleteVisible && selectedTeam" tone="muted" class="space-y-3 border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p>Delete team {{ selectedTeam.name }}?</p>
          <p class="text-xs text-amber-800">This affects downstream grouping and dashboard visibility immediately.</p>
          <div class="flex items-center justify-end gap-2">
            <button type="button" class="rounded-md border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 transition-colors hover:bg-amber-100" @click="cancelDeleteTeam">
              Keep Team
            </button>
            <button type="button" class="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60" :disabled="deletePending" @click="confirmDeleteTeam">
              {{ deletePending ? 'Deleting...' : 'Confirm Delete' }}
            </button>
          </div>
        </WorkspaceSurface>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="space-y-2 text-sm text-slate-700">
            <span class="font-medium">Team Code</span>
            <input id="team-teamCode" v-model="formState.teamCode" name="teamCode" type="text" :class="inputClass('teamCode')" />
            <p v-if="fieldErrors.teamCode" class="text-xs text-rose-600">{{ fieldErrors.teamCode }}</p>
          </label>
          <label class="space-y-2 text-sm text-slate-700">
            <span class="font-medium">Team Name</span>
            <input id="team-name" v-model="formState.name" name="name" type="text" :class="inputClass('name')" />
            <p v-if="fieldErrors.name" class="text-xs text-rose-600">{{ fieldErrors.name }}</p>
          </label>
          <label class="space-y-2 text-sm text-slate-700">
            <span class="font-medium">Color</span>
            <input id="team-color" v-model="formState.color" name="color" type="color" :class="['h-10 bg-white px-2 py-1', ...inputClass('color')]" />
            <p v-if="fieldErrors.color" class="text-xs text-rose-600">{{ fieldErrors.color }}</p>
          </label>
          <label class="space-y-2 text-sm text-slate-700">
            <span class="font-medium">Display Order</span>
            <input id="team-displayOrder" v-model="formState.displayOrder" name="displayOrder" type="number" min="0" :class="inputClass('displayOrder')" />
            <p v-if="fieldErrors.displayOrder" class="text-xs text-rose-600">{{ fieldErrors.displayOrder }}</p>
          </label>
          <label class="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-700 md:col-span-2">
            <input id="team-visible" v-model="formState.visible" name="visible" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
            <span>Visible in downstream dashboards</span>
          </label>
          <label class="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span class="font-medium">Description</span>
            <textarea id="team-description" v-model="formState.description" name="description" rows="4" :class="inputClass('description')"></textarea>
            <p v-if="fieldErrors.description" class="text-xs text-rose-600">{{ fieldErrors.description }}</p>
          </label>
        </div>
      </form>

      <template #footer>
        <div class="flex items-center justify-between gap-3">
          <button
            v-if="selectedTeam"
            type="button"
            class="inline-flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="deletePending"
            @click="promptDeleteTeam"
          >
            <Trash2 class="h-4 w-4" />
            Delete
          </button>
          <div v-else></div>
          <div class="flex items-center gap-3">
            <button type="button" class="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50" @click="closeDrawer">Cancel</button>
            <button type="button" class="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60" :disabled="submitPending" @click="saveTeam">
              {{ submitPending ? 'Saving...' : selectedTeam ? 'Save Changes' : 'Create Team' }}
            </button>
          </div>
        </div>
      </template>
    </WorkspaceDrawer>
  </div>
</template>
