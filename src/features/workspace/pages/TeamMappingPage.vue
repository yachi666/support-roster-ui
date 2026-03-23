<script setup>
import { computed, onMounted, reactive, shallowRef } from 'vue'
import { GripVertical, HelpCircle, Plus, Trash2 } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { api } from '@/api'
import { applyApiFieldErrors, clearFieldErrors, getApiErrorMessage } from '../lib/formErrors'
import WorkspaceDrawer from '../components/WorkspaceDrawer.vue'
import WorkspacePageHeader from '../components/WorkspacePageHeader.vue'
import WorkspaceSurface from '../components/WorkspaceSurface.vue'

const EMPTY_FORM = {
  name: '',
  color: '#14b8a6',
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
const reorderPending = shallowRef(false)
const draggingTeamId = shallowRef(null)
const dragOverTeamId = shallowRef(null)
const fieldErrors = reactive({})
const formState = reactive({ ...EMPTY_FORM })
const { t } = useI18n()

const teamErrorRules = [
  {
    match: /team\s*name|\bname\b/i,
    field: 'name',
  },
  {
    match: /color/i,
    field: 'color',
  },
]

const sortedTeams = computed(() =>
  [...teams.value].sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0)),
)

const visibleTeams = computed(() => sortedTeams.value.filter((team) => team.visible))
const hiddenTeams = computed(() => sortedTeams.value.filter((team) => !team.visible))
const totalTeamsCount = computed(() => sortedTeams.value.length)
const selectedTeam = computed(
  () => teams.value.find((team) => team.id === selectedTeamId.value) || null,
)
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

async function persistTeamOrder(orderedTeams, fallbackTeams) {
  reorderPending.value = true
  errorMessage.value = ''

  try {
    reorderLocalTeams(orderedTeams)
    await api.workspace.reorderTeams(orderedTeams.map((team) => team.id))
    await loadTeams()
  } catch (error) {
    teams.value = fallbackTeams
    errorMessage.value = error.message || 'Failed to reorder team mappings.'
  } finally {
    reorderPending.value = false
    draggingTeamId.value = null
    dragOverTeamId.value = null
  }
}

function handleDragStart(teamId) {
  if (reorderPending.value) {
    return
  }

  draggingTeamId.value = teamId
}

function handleDragEnd() {
  draggingTeamId.value = null
  dragOverTeamId.value = null
}

function handleDragEnter(teamId) {
  if (draggingTeamId.value == null || draggingTeamId.value === teamId) {
    return
  }

  dragOverTeamId.value = teamId
}

function handleDrop(targetTeamId) {
  if (
    draggingTeamId.value == null ||
    draggingTeamId.value === targetTeamId ||
    reorderPending.value
  ) {
    handleDragEnd()
    return
  }

  const currentTeams = [...sortedTeams.value]
  const sourceIndex = currentTeams.findIndex((team) => team.id === draggingTeamId.value)
  const targetIndex = currentTeams.findIndex((team) => team.id === targetTeamId)

  if (sourceIndex === -1 || targetIndex === -1) {
    handleDragEnd()
    return
  }

  const [movedTeam] = currentTeams.splice(sourceIndex, 1)
  currentTeams.splice(targetIndex, 0, movedTeam)

  void persistTeamOrder(currentTeams, [...teams.value])
}

function teamColorStyle(team) {
  return { backgroundColor: team.color || '#94a3b8' }
}

function reorderLocalTeams(orderedTeams) {
  teams.value = orderedTeams.map((team, index) => ({
    ...team,
    displayOrder: index,
  }))
}

function resetForm() {
  Object.assign(formState, EMPTY_FORM)
  formErrorMessage.value = ''
  confirmDeleteVisible.value = false
  clearFieldErrors(fieldErrors)
}

function fillForm(team) {
  Object.assign(formState, {
    name: team?.name || '',
    color: team?.color || '#14b8a6',
    visible: team?.visible !== false,
    description: team?.description || '',
  })
}

function getNextDisplayOrder() {
  return (
    sortedTeams.value.reduce(
      (maxOrder, team) => Math.max(maxOrder, Number(team.displayOrder ?? -1)),
      -1,
    ) + 1
  )
}

function openCreateDrawer() {
  selectedTeamId.value = null
  resetForm()
  formVisible.value = true
}

function openTeamDrawer(team) {
  if (draggingTeamId.value != null || reorderPending.value) {
    return
  }

  selectedTeamId.value = team.id
  fillForm(team)
  formVisible.value = true
}

function validateForm() {
  clearFieldErrors(fieldErrors)

  if (!formState.name.trim()) fieldErrors.name = 'Team name is required.'
  if (!/^#([0-9a-fA-F]{6})$/.test(formState.color.trim()))
    fieldErrors.color = 'Use a 6-digit hex color.'
  if (formState.description.trim().length > 500)
    fieldErrors.description = 'Description must be 500 characters or fewer.'

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
      name: formState.name.trim(),
      color: formState.color.trim(),
      displayOrder: selectedTeam.value?.displayOrder ?? getNextDisplayOrder(),
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
    formErrorMessage.value = hasFieldErrors
      ? 'Please correct the highlighted fields before saving.'
      : getApiErrorMessage(error, 'Failed to save team mapping.')
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
    fieldErrors[fieldName]
      ? 'border-rose-300 focus:border-rose-400'
      : 'border-slate-200 focus:border-teal-500',
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
          :title="t('workspace.teams.title')"
          :description="t('workspace.teams.description')"
        >
          <template #actions>
            <button
              class="inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700"
              @click="openCreateDrawer"
            >
              <Plus class="h-4 w-4" />
              {{ t('workspace.teams.createAction') }}
            </button>
          </template>
        </WorkspacePageHeader>

        <WorkspaceSurface
          v-if="errorMessage"
          tone="muted"
          class="border-rose-200 bg-rose-50 p-5 text-sm text-rose-700"
        >
          <div class="flex items-center justify-between gap-4">
            <span>{{ errorMessage }}</span>
            <button
              class="rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100"
              @click="loadTeams"
            >
              {{ t('common.retry') }}
            </button>
          </div>
        </WorkspaceSurface>

        <WorkspaceSurface
          tone="muted"
          class="flex gap-4 border-blue-200 bg-blue-50 p-5 text-blue-900"
        >
          <HelpCircle class="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div>
            <h3 class="text-sm font-semibold">{{ t('workspace.teams.mappingTitle') }}</h3>
            <p class="mt-1 text-sm leading-relaxed text-blue-800/80">
              {{ t('workspace.teams.mappingBody') }}
            </p>
            <p class="mt-2 text-xs text-blue-800/70">
              {{ t('workspace.teams.mappingHint') }}
            </p>
          </div>
        </WorkspaceSurface>

        <div class="grid gap-8 lg:grid-cols-3">
          <div class="space-y-4 lg:col-span-2">
            <div class="grid gap-3 sm:grid-cols-3">
              <WorkspaceSurface class="border-slate-200/80 bg-white/90 p-4">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {{ t('workspace.teams.totalTeams') }}
                </p>
                <p class="mt-2 text-2xl font-semibold text-slate-900">{{ totalTeamsCount }}</p>
                <p class="mt-1 text-sm text-slate-500">{{ t('workspace.teams.totalTeamsBody') }}</p>
              </WorkspaceSurface>
              <WorkspaceSurface class="border-emerald-100 bg-emerald-50/80 p-4">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                  {{ t('common.visible') }}
                </p>
                <p class="mt-2 text-2xl font-semibold text-emerald-900">
                  {{ visibleTeams.length }}
                </p>
                <p class="mt-1 text-sm text-emerald-800/75">{{ t('workspace.teams.visibleBody') }}</p>
              </WorkspaceSurface>
              <WorkspaceSurface class="border-slate-200 bg-slate-100/80 p-4">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {{ t('common.hidden') }}
                </p>
                <p class="mt-2 text-2xl font-semibold text-slate-800">{{ hiddenTeams.length }}</p>
                <p class="mt-1 text-sm text-slate-600">
                  {{ t('workspace.teams.hiddenBody') }}
                </p>
              </WorkspaceSurface>
            </div>

            <div class="flex items-end justify-between gap-4 px-2">
              <div>
                <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-700">
                  {{ t('workspace.teams.activeTeams') }}
                </h2>
                <p class="mt-1 text-sm text-slate-500">
                  {{ t('workspace.teams.activeTeamsBody') }}
                </p>
              </div>
            </div>
            <WorkspaceSurface v-if="loading" class="p-6 text-sm text-slate-500"
              >{{ t('workspace.teams.loading') }}</WorkspaceSurface
            >
            <WorkspaceSurface
              v-for="team in sortedTeams"
              :key="team.id"
              :class="[
                'group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md',
                reorderPending ? 'cursor-wait' : 'cursor-pointer',
                dragOverTeamId === team.id ? 'border-teal-300 bg-teal-50/70 shadow-teal-100' : '',
              ]"
              draggable="true"
              @dragstart="handleDragStart(team.id)"
              @dragend="handleDragEnd"
              @dragenter.prevent="handleDragEnter(team.id)"
              @dragover.prevent
              @drop.prevent="handleDrop(team.id)"
              @click="openTeamDrawer(team)"
            >
              <div
                class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-300 transition-colors group-hover:text-slate-500"
              >
                <GripVertical class="h-5 w-5" />
              </div>
              <div
                class="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-2xl border border-white/70 shadow-sm"
                :style="teamColorStyle(team)"
              >
                <div class="absolute inset-0 bg-white/15"></div>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-3">
                  <h3 class="text-base font-semibold text-slate-800">{{ team.name }}</h3>
                  <span
                    class="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
                    :class="
                      team.visible
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    "
                  >
                      {{ team.visible ? t('workspace.teams.visible') : t('workspace.teams.hidden') }}
                  </span>
                </div>
                <p
                  v-if="team.description"
                  class="mt-1 line-clamp-2 text-sm leading-5 text-slate-500"
                >
                  {{ team.description }}
                </p>
                <p v-else class="mt-1 text-sm text-slate-400">
                  {{ t('workspace.teams.dragFallback') }}
                </p>
                <div class="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span
                    class="rounded-full border px-2.5 py-1 font-medium"
                    :class="
                      team.visible
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-slate-50 text-slate-500'
                    "
                  >
                     {{ team.visible ? t('workspace.teams.shownPublic') : t('workspace.teams.internalOnly') }}
                   </span>
                  <span
                    class="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-500"
                  >
                     {{ t('workspace.teams.clickToEdit') }}
                   </span>
                 </div>
               </div>
               <div class="hidden text-right md:block">
                 <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">{{ t('workspace.teams.drag') }}</p>
                 <p class="mt-1 text-xs text-slate-400">{{ t('workspace.teams.moveInList') }}</p>
               </div>
             </WorkspaceSurface>
            <WorkspaceSurface
              v-if="!loading && !sortedTeams.length"
              class="p-6 text-sm text-slate-500"
            >
              <div
                class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center"
              >
                 <p class="text-base font-medium text-slate-700">{{ t('workspace.teams.emptyTitle') }}</p>
                 <p class="mt-2 text-sm text-slate-500">
                   {{ t('workspace.teams.emptyBody') }}
                 </p>
              </div>
            </WorkspaceSurface>
            <button
              class="w-full rounded-2xl border-2 border-dashed border-slate-200 py-4 text-sm font-medium text-slate-500 transition-colors hover:border-teal-400 hover:bg-teal-50/50 hover:text-teal-600"
              @click="openCreateDrawer"
            >
              {{ t('workspace.teams.createNew') }}
            </button>
          </div>

          <div>
            <div class="sticky top-8 space-y-4">
              <WorkspaceSurface class="border-slate-200/80 bg-white/90 p-4">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-700">
                       {{ t('workspace.teams.previewTitle') }}
                     </h2>
                     <p class="mt-1 text-sm text-slate-500">
                       {{ t('workspace.teams.previewBody') }}
                     </p>
                  </div>
                  <span
                    class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                  >
                     {{ t('workspace.teams.visibleCount', { count: visibleTeams.length }) }}
                   </span>
                 </div>
                 <div v-if="hiddenTeams.length" class="mt-4 border-t border-slate-100 pt-4">
                   <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                     {{ t('workspace.teams.hiddenFromDashboard') }}
                   </p>
                  <div class="mt-2 flex flex-wrap gap-2">
                    <span
                      v-for="team in hiddenTeams"
                      :key="team.id"
                      class="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
                    >
                      {{ team.name }}
                    </span>
                  </div>
                </div>
              </WorkspaceSurface>

              <WorkspaceSurface
                :padded="false"
                class="overflow-hidden border-slate-200/80 shadow-sm"
              >
                <div class="flex items-center justify-between bg-slate-900 px-4 py-3">
                  <span class="text-xs font-semibold text-white">{{ t('workspace.teams.viewerTitle') }}</span>
                  <div class="flex gap-1.5">
                    <div class="h-2 w-2 rounded-full bg-slate-600"></div>
                    <div class="h-2 w-2 rounded-full bg-slate-600"></div>
                    <div class="h-2 w-2 rounded-full bg-slate-600"></div>
                  </div>
                </div>
                <div class="space-y-4 bg-gradient-to-b from-slate-50 to-white p-4">
                  <div
                    v-for="team in visibleTeams"
                    :key="team.id"
                    class="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm"
                  >
                    <div class="flex items-start gap-3">
                      <div class="mt-0.5 h-3 w-3 rounded-full" :style="teamColorStyle(team)"></div>
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center justify-between gap-3">
                          <span
                            class="truncate text-xs font-semibold uppercase tracking-wide text-slate-700"
                          >
                            {{ team.name }}
                          </span>
                          <span
                            class="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400"
                          >
                             {{ t('workspace.teams.live') }}
                          </span>
                        </div>
                        <p
                          v-if="team.description"
                          class="mt-1 line-clamp-2 text-xs leading-5 text-slate-500"
                        >
                          {{ team.description }}
                        </p>
                        <div
                          class="mt-3 flex gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-slate-500"
                        >
                          <div class="h-7 w-7 flex-shrink-0 rounded-full bg-white shadow-sm"></div>
                          <div class="flex-1">
                            <div class="mb-1 h-2 w-20 rounded bg-slate-200"></div>
                            <div class="h-1.5 w-14 rounded bg-slate-100"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="!loading && !visibleTeams.length" class="text-xs text-slate-500">
                    {{ t('workspace.teams.previewEmpty') }}
                  </div>
                </div>
              </WorkspaceSurface>
            </div>
          </div>
        </div>
      </div>
    </div>

    <WorkspaceDrawer
      :model-value="drawerOpen"
      :title="selectedTeam ? t('workspace.teams.editTitle') : t('workspace.teams.createTitle')"
      width="460px"
      @update:model-value="closeDrawer"
    >
      <template #subtitle>
        <p class="mt-1 text-xs text-slate-500">
          {{ t('workspace.teams.subtitle') }}
        </p>
      </template>

      <form class="space-y-5" @submit.prevent="saveTeam">
        <WorkspaceSurface
          v-if="formErrorMessage"
          tone="muted"
          class="border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          {{ formErrorMessage }}
        </WorkspaceSurface>

        <WorkspaceSurface
          v-if="confirmDeleteVisible && selectedTeam"
          tone="muted"
          class="space-y-3 border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          <p>{{ t('workspace.teams.deleteConfirm', { name: selectedTeam.name }) }}</p>
          <p class="text-xs text-amber-800">
            {{ t('workspace.teams.deleteWarning') }}
          </p>
          <div class="flex items-center justify-end gap-2">
            <button
              type="button"
              class="rounded-md border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 transition-colors hover:bg-amber-100"
              @click="cancelDeleteTeam"
            >
              {{ t('workspace.teams.keepTeam') }}
            </button>
            <button
              type="button"
              class="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="deletePending"
              @click="confirmDeleteTeam"
            >
              {{ deletePending ? t('common.deleting') : t('workspace.teams.confirmDelete') }}
            </button>
          </div>
        </WorkspaceSurface>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="space-y-2 text-sm text-slate-700">
            <span class="font-medium">Team Name</span>
            <input
              id="team-name"
              v-model="formState.name"
              name="name"
              type="text"
              :class="inputClass('name')"
            />
            <p v-if="fieldErrors.name" class="text-xs text-rose-600">{{ fieldErrors.name }}</p>
          </label>
          <label class="space-y-2 text-sm text-slate-700">
            <span class="font-medium">Color</span>
            <input
              id="team-color"
              v-model="formState.color"
              name="color"
              type="color"
              :class="['h-10 bg-white px-2 py-1', ...inputClass('color')]"
            />
            <p v-if="fieldErrors.color" class="text-xs text-rose-600">{{ fieldErrors.color }}</p>
          </label>
          <label
            class="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-700 md:col-span-2"
          >
            <input
              id="team-visible"
              v-model="formState.visible"
              name="visible"
              type="checkbox"
              class="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span>Visible in downstream dashboards</span>
          </label>
          <label class="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span class="font-medium">Description</span>
            <textarea
              id="team-description"
              v-model="formState.description"
              name="description"
              rows="4"
              :class="inputClass('description')"
            ></textarea>
            <p v-if="fieldErrors.description" class="text-xs text-rose-600">
              {{ fieldErrors.description }}
            </p>
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
            <button
              type="button"
              class="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              @click="closeDrawer"
            >
              Cancel
            </button>
            <button
              type="button"
              class="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="submitPending"
              @click="saveTeam"
            >
              {{ submitPending ? 'Saving...' : selectedTeam ? 'Save Changes' : 'Create Team' }}
            </button>
          </div>
        </div>
      </template>
    </WorkspaceDrawer>
  </div>
</template>
