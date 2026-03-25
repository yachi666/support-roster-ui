<script setup>
import { computed, onMounted, reactive, shallowRef } from 'vue'
import { CheckCircle2, Clock3, Globe, Mail, Pencil, Phone, Plus, Search, Trash2, XCircle } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { applyApiFieldErrors, clearFieldErrors, getApiErrorMessage } from '../lib/formErrors'
import AvatarImage from '../components/AvatarImage.vue'
import WorkspaceDrawer from '../components/WorkspaceDrawer.vue'
import WorkspacePageHeader from '../components/WorkspacePageHeader.vue'
import WorkspaceSurface from '../components/WorkspaceSurface.vue'
import { normalizeWorkspaceStaffTimezone, WORKSPACE_STAFF_TIMEZONE_OPTIONS } from '../config/timezones'

const EMPTY_FORM = {
  staffCodesText: '',
  staffCode: '',
  name: '',
  email: '',
  phone: '',
  slack: '',
  region: '',
  timezone: 'UTC',
  roleName: '',
  teamId: '',
  status: 'ACTIVE',
  notes: '',
}

const searchTerm = shallowRef('')
const staffIdFilter = shallowRef('')
const selectedTeamFilter = shallowRef('')
const selectedStaffId = shallowRef(null)
const staffList = shallowRef([])
const teams = shallowRef([])
const loading = shallowRef(false)
const errorMessage = shallowRef('')
const drawerMode = shallowRef('detail')
const formVisible = shallowRef(false)
const deletePending = shallowRef(false)
const submitPending = shallowRef(false)
const formErrorMessage = shallowRef('')
const confirmDeleteVisible = shallowRef(false)
const fieldErrors = reactive({})
const formState = reactive({ ...EMPTY_FORM })
const authStore = useAuthStore()
const { t } = useI18n()

const createStaffErrorRules = [
  {
    match: /staff\s*id|staff\s*code/i,
    field: 'staffCodesText',
  },
  {
    match: /team/i,
    field: 'teamId',
    message: 'Select a valid team.',
  },
  {
    match: ['timezone'],
    field: 'timezone',
  },
]

const updateStaffErrorRules = [
  {
    match: /staff\s*code/i,
    field: 'staffCode',
    message: 'Staff ID is required.',
  },
  {
    match: /full\s*name|\bname\b/i,
    field: 'name',
    message: 'Full name is required.',
  },
  {
    match: /team/i,
    field: 'teamId',
    message: 'Select a valid team.',
  },
  {
    match: ['email'],
    field: 'email',
  },
  {
    match: ['timezone'],
    field: 'timezone',
  },
]

async function loadStaff() {
  loading.value = true
  errorMessage.value = ''

  try {
    staffList.value = await api.workspace.getStaff(searchTerm.value)
  } catch (error) {
    errorMessage.value = error.message || 'Failed to load workspace staff.'
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

const filteredStaff = computed(() => {
  const query = searchTerm.value.trim().toLowerCase()
  const exactStaffId = staffIdFilter.value.trim().toLowerCase()
  const teamId = selectedTeamFilter.value

  return staffList.value.filter((staff) => {
    const matchesSearch = !query || [staff.name, staff.email, staff.teamName, staff.roleName, staff.staffCode, staff.id]
      .join(' ')
      .toLowerCase()
      .includes(query)
    const visibleStaffId = String(staff.staffCode || staff.id || '').toLowerCase()
    const matchesStaffId = !exactStaffId || visibleStaffId === exactStaffId
    const matchesTeam = !teamId || String(staff.teamId || '') === teamId
    return matchesSearch && matchesStaffId && matchesTeam
  })
})

const selectedStaff = computed(() => {
  return staffList.value.find((staff) => staff.id === selectedStaffId.value) || null
})

const teamOptions = computed(() => teams.value.filter((team) => team.visible !== false))
const editableTeamOptions = computed(() =>
  teamOptions.value.filter((team) => authStore.isAdmin || authStore.canEditTeam(team.id)),
)
const canCreateStaff = computed(() => authStore.canWriteWorkspace)
const canEditSelectedStaff = computed(() => Boolean(selectedStaff.value) && authStore.canEditTeam(selectedStaff.value.teamId))
const isCreateDrawer = computed(() => drawerMode.value === 'create')

const drawerOpen = computed(() => Boolean(selectedStaff.value) || formVisible.value)

const drawerTitle = computed(() => {
  if (drawerMode.value === 'create') {
    return t('workspace.staff.addTitle')
  }

  if (drawerMode.value === 'edit') {
    return t('workspace.staff.editTitle')
  }

  return t('workspace.staff.profileTitle')
})

const drawerSubtitle = computed(() => {
  if (drawerMode.value === 'create') {
    return t('workspace.staff.createSubtitle')
  }

  if (drawerMode.value === 'detail') {
    return t('workspace.staff.detailSubtitle')
  }

  return t('workspace.staff.formSubtitle')
})

function isActiveStatus(status) {
  return (status || '').toUpperCase() === 'ACTIVE'
}

function resetForm() {
  Object.assign(formState, EMPTY_FORM)
  formErrorMessage.value = ''
  confirmDeleteVisible.value = false
  clearFieldErrors(fieldErrors)
}

function fillForm(staff) {
  Object.assign(formState, {
    staffCodesText: '',
    staffCode: staff?.staffCode || '',
    name: staff?.name || '',
    email: staff?.email || '',
    phone: staff?.phone || '',
    slack: staff?.slack || '',
    region: staff?.region || '',
    timezone: normalizeWorkspaceStaffTimezone(staff?.timezone),
    roleName: staff?.roleName || '',
    teamId: staff?.teamId ? String(staff.teamId) : '',
    status: staff?.status || 'ACTIVE',
    notes: staff?.notes || '',
  })
}

function buildPayload() {
  return {
    staffCode: formState.staffCode.trim(),
    name: formState.name.trim(),
    email: formState.email.trim(),
    phone: formState.phone.trim(),
    slack: formState.slack.trim(),
    region: formState.region.trim(),
    timezone: formState.timezone.trim(),
    roleName: formState.roleName.trim(),
    teamId: formState.teamId,
    status: formState.status,
    notes: formState.notes.trim(),
  }
}

function buildCreatePayload() {
  return {
    staffCodes: parseStaffCodes(),
    teamId: formState.teamId,
    timezone: formState.timezone.trim(),
    status: formState.status,
    notes: formState.notes.trim(),
  }
}

function parseStaffCodes() {
  return formState.staffCodesText
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean)
}

function findDuplicateValues(values) {
  const seen = new Set()
  const duplicates = new Set()

  values.forEach((value) => {
    if (seen.has(value)) {
      duplicates.add(value)
      return
    }

    seen.add(value)
  })

  return [...duplicates]
}

function validateCreateForm() {
  clearFieldErrors(fieldErrors)

  const staffCodes = parseStaffCodes()
  const duplicateStaffCodes = findDuplicateValues(staffCodes)

  if (!staffCodes.length) fieldErrors.staffCodesText = 'Enter at least one Staff ID.'
  if (duplicateStaffCodes.length) fieldErrors.staffCodesText = `Duplicate Staff ID: ${duplicateStaffCodes.join(', ')}.`
  if (!formState.teamId) fieldErrors.teamId = 'Team is required.'
  if (!formState.timezone.trim()) fieldErrors.timezone = 'Timezone is required.'
  if (formState.timezone.trim().length > 64) fieldErrors.timezone = 'Timezone must be 64 characters or fewer.'
  if (formState.notes.trim().length > 500) fieldErrors.notes = 'Notes must be 500 characters or fewer.'

  return Object.keys(fieldErrors).length === 0
}

function validateUpdateForm() {
  clearFieldErrors(fieldErrors)

  if (!formState.staffCode.trim()) fieldErrors.staffCode = 'Staff ID is required.'
  if (!formState.name.trim()) fieldErrors.name = 'Full name is required.'
  if (!formState.teamId) fieldErrors.teamId = 'Team is required.'
  if (formState.phone.trim() && formState.phone.trim().length > 32) fieldErrors.phone = 'Phone must be 32 characters or fewer.'
  if (formState.slack.trim() && formState.slack.trim().length > 64) fieldErrors.slack = 'Slack handle must be 64 characters or fewer.'
  if (formState.region.trim() && formState.region.trim().length > 64) fieldErrors.region = 'Region must be 64 characters or fewer.'
  if (formState.roleName.trim() && formState.roleName.trim().length > 128) fieldErrors.roleName = 'Role name must be 128 characters or fewer.'
  if (formState.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim())) fieldErrors.email = 'Enter a valid email address.'
  if (!formState.timezone.trim()) fieldErrors.timezone = 'Timezone is required.'
  if (formState.timezone.trim().length > 64) fieldErrors.timezone = 'Timezone must be 64 characters or fewer.'
  if (formState.notes.trim().length > 500) fieldErrors.notes = 'Notes must be 500 characters or fewer.'

  return Object.keys(fieldErrors).length === 0
}

function openCreateDrawer() {
  if (!canCreateStaff.value) {
    return
  }
  drawerMode.value = 'create'
  selectedStaffId.value = null
  resetForm()
  formVisible.value = true
}

function openDetailDrawer(staffId) {
  drawerMode.value = 'detail'
  formVisible.value = false
  formErrorMessage.value = ''
  selectedStaffId.value = staffId
}

function openEditDrawer() {
  if (!canEditSelectedStaff.value) {
    return
  }

  drawerMode.value = 'edit'
  fillForm(selectedStaff.value)
  formVisible.value = true
}

async function submitForm() {
  if (submitPending.value || !canCreateStaff.value) {
    return
  }

  formErrorMessage.value = ''
  confirmDeleteVisible.value = false

  const errorRules = isCreateDrawer.value ? createStaffErrorRules : updateStaffErrorRules
  const isValid = isCreateDrawer.value ? validateCreateForm() : validateUpdateForm()

  if (!isValid) {
    formErrorMessage.value = 'Please correct the highlighted fields before saving.'
    return
  }
  if (!authStore.canEditTeam(formState.teamId)) {
    fieldErrors.teamId = 'You can only manage staff in your editable teams.'
    formErrorMessage.value = 'Please correct the highlighted fields before saving.'
    return
  }

  submitPending.value = true

  try {
    if (drawerMode.value === 'create') {
      const createdStaff = await api.workspace.createStaffBatch(buildCreatePayload())
      selectedStaffId.value = createdStaff.length === 1 ? createdStaff[0].id : null
    } else if (selectedStaff.value) {
      const updated = await api.workspace.updateStaff(selectedStaff.value.id, buildPayload())
      selectedStaffId.value = updated.id
    }

    formVisible.value = false
    drawerMode.value = 'detail'
    resetForm()
    await loadStaff()
  } catch (error) {
    const hasFieldErrors = applyApiFieldErrors(error, fieldErrors, errorRules)
    formErrorMessage.value = hasFieldErrors ? 'Please correct the highlighted fields before saving.' : getApiErrorMessage(error, 'Failed to save staff profile.')
  } finally {
    submitPending.value = false
  }
}

function promptDeleteStaff() {
  confirmDeleteVisible.value = true
  formErrorMessage.value = ''
}

async function confirmDeleteStaff() {
  if (!canEditSelectedStaff.value || deletePending.value) {
    return
  }

  deletePending.value = true
  formErrorMessage.value = ''

  try {
    await api.workspace.deleteStaff(selectedStaff.value.id)
    closeDrawer()
    await loadStaff()
  } catch (error) {
    formErrorMessage.value = getApiErrorMessage(error, 'Failed to delete staff profile.')
  } finally {
    deletePending.value = false
  }
}

function cancelDeleteStaff() {
  confirmDeleteVisible.value = false
}

function closeDrawer() {
  selectedStaffId.value = null
  formVisible.value = false
  drawerMode.value = 'detail'
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
  void loadStaff()
})
</script>

<template>
  <div class="relative flex h-full flex-col bg-slate-50">
    <div class="flex-1 overflow-auto p-8">
      <div class="mx-auto flex max-w-7xl flex-col gap-8">
        <WorkspacePageHeader
          title="Staff Directory"
          :title="t('workspace.staff.title')"
          :description="t('workspace.staff.description')"
        >
          <template #actions>
            <div class="relative">
              <label for="workspace-staff-search" class="sr-only">{{ t('workspace.staff.searchLabel') }}</label>
              <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="workspace-staff-search"
                name="workspace-staff-search"
                v-model="searchTerm"
                type="text"
                :placeholder="t('workspace.staff.searchPlaceholder')"
                class="w-64 rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <input
              v-model="staffIdFilter"
              type="text"
              :placeholder="t('workspace.staff.exactStaffId')"
              class="w-40 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
            <select
              v-model="selectedTeamFilter"
              class="w-44 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            >
                <option value="">{{ t('common.allTeams') }}</option>
              <option v-for="team in teamOptions" :key="team.id" :value="String(team.id)">{{ team.name }}</option>
            </select>
             <button v-if="canCreateStaff" class="flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700" @click="openCreateDrawer">
              <Plus class="h-4 w-4" />
              <span>{{ t('workspace.staff.addStaff') }}</span>
            </button>
          </template>
        </WorkspacePageHeader>

        <WorkspaceSurface v-if="errorMessage" tone="muted" class="border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          <div class="flex items-center justify-between gap-4">
            <span>{{ errorMessage }}</span>
            <button class="rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100" @click="loadStaff">
              {{ t('common.retry') }}
            </button>
          </div>
        </WorkspaceSurface>

        <WorkspaceSurface :padded="false">
          <div class="overflow-x-auto">
            <table class="min-w-full text-left text-sm text-slate-600">
              <thead class="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th class="px-6 py-3">{{ t('workspace.staff.columns.name') }}</th>
                  <th class="px-6 py-3">{{ t('workspace.staff.columns.staffId') }}</th>
                  <th class="px-6 py-3">{{ t('workspace.staff.columns.roleName') }}</th>
                  <th class="px-6 py-3">{{ t('workspace.staff.columns.team') }}</th>
                  <th class="px-6 py-3">{{ t('workspace.staff.columns.timezone') }}</th>
                  <th class="px-6 py-3">{{ t('workspace.staff.columns.status') }}</th>
                  <th class="px-6 py-3 text-right">{{ t('workspace.staff.columns.actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="staff in filteredStaff"
                  :key="staff.id"
                  class="cursor-pointer transition-colors hover:bg-slate-50/80"
                  @click="openDetailDrawer(staff.id)"
                >
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <AvatarImage :name="staff.name" :src="staff.avatar" size-class="h-8 w-8" />
                      <div class="flex flex-col">
                        <span class="font-medium text-slate-800">{{ staff.name }}</span>
                        <span class="text-xs text-slate-400">{{ staff.email }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 font-mono text-xs text-slate-500">{{ staff.staffCode || staff.id }}</td>
                  <td class="px-6 py-4">{{ staff.roleName || '-' }}</td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {{ staff.teamName || '-' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-xs text-slate-500">{{ normalizeWorkspaceStaffTimezone(staff.timezone) || '-' }}</td>
                  <td class="px-6 py-4">
                    <span
                      v-if="isActiveStatus(staff.status)"
                      class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
                    >
                      <CheckCircle2 class="h-3.5 w-3.5" />
                      {{ t('common.active') }}
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                    >
                      <XCircle class="h-3.5 w-3.5" />
                      {{ t('common.inactive') }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right text-xs text-slate-400">{{ t('common.open') }}</td>
                </tr>
                <tr v-if="loading">
                  <td colspan="7" class="px-6 py-10 text-center text-sm text-slate-500">{{ t('workspace.staff.loading') }}</td>
                </tr>
                <tr v-else-if="!filteredStaff.length">
                  <td colspan="7" class="px-6 py-10 text-center text-sm text-slate-500">{{ t('workspace.staff.empty') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </WorkspaceSurface>
      </div>
    </div>

    <WorkspaceDrawer :model-value="drawerOpen" :title="drawerTitle" width="460px" @update:model-value="closeDrawer">
      <template #subtitle>
        <p class="mt-1 text-xs text-slate-500">{{ drawerSubtitle }}</p>
      </template>

      <template v-if="drawerMode === 'detail' && selectedStaff">
        <div class="space-y-6">
          <div class="rounded-2xl border border-slate-100 bg-slate-50/70 px-6 py-8 text-center">
            <AvatarImage
              :name="selectedStaff.name"
              :src="selectedStaff.avatar"
              size-class="mx-auto mb-4 h-20 w-20"
              fallback-class="border border-slate-200 bg-white text-xl font-semibold text-slate-600 shadow-sm"
            />
            <h3 class="text-xl font-semibold text-slate-800">{{ selectedStaff.name }}</h3>
            <p class="mt-1 text-sm text-slate-500">{{ selectedStaff.roleName || '-' }}</p>
          </div>

          <div>
            <h4 class="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{{ t('workspace.staff.contactLocation') }}</h4>
            <div class="space-y-4 text-sm text-slate-700">
              <div class="flex items-center gap-3">
                <Mail class="h-4 w-4 text-slate-400" />
                <span>{{ selectedStaff.email || '-' }}</span>
              </div>
              <div class="flex items-center gap-3">
                <Phone class="h-4 w-4 text-slate-400" />
                <span>{{ selectedStaff.phone || '-' }}</span>
              </div>
              <div class="flex items-center gap-3">
                <Globe class="h-4 w-4 text-slate-400" />
                <span>{{ t('workspace.staff.region', { region: selectedStaff.region || '-' }) }}</span>
              </div>
              <div class="flex items-center gap-3">
                <Clock3 class="h-4 w-4 text-slate-400" />
                <span>{{ normalizeWorkspaceStaffTimezone(selectedStaff.timezone) || '-' }}</span>
              </div>
            </div>
          </div>

          <div class="h-px bg-slate-100"></div>

          <div>
            <h4 class="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{{ t('workspace.staff.participation') }}</h4>
            <div class="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">{{ t('workspace.staff.columns.team') }}</span>
                <span class="font-medium text-slate-800">{{ selectedStaff.teamName || '-' }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">{{ t('workspace.staff.columns.roleName') }}</span>
                <span class="font-medium text-slate-800">{{ selectedStaff.roleName || '-' }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">{{ t('workspace.staff.columns.status') }}</span>
                <span class="font-medium text-slate-800">{{ selectedStaff.status || '-' }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">{{ t('workspace.staff.rosterTags') }}</span>
                <span class="font-medium text-slate-800">{{ selectedStaff.rosterTags?.join(', ') || t('workspace.staff.noRosterTags') }}</span>
              </div>
            </div>
          </div>

          <WorkspaceSurface v-if="formErrorMessage" tone="muted" class="border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {{ formErrorMessage }}
          </WorkspaceSurface>

          <WorkspaceSurface v-if="confirmDeleteVisible && canEditSelectedStaff" tone="muted" class="space-y-3 border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p>{{ t('workspace.staff.deleteConfirm', { name: selectedStaff.name }) }}</p>
            <p class="text-xs text-amber-800">{{ t('workspace.staff.deleteWarning') }}</p>
            <div class="flex items-center justify-end gap-2">
              <button type="button" class="rounded-md border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 transition-colors hover:bg-amber-100" @click="cancelDeleteStaff">
                {{ t('workspace.staff.keepRecord') }}
              </button>
              <button type="button" class="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60" :disabled="deletePending" @click="confirmDeleteStaff">
                {{ deletePending ? t('common.deleting') : t('workspace.staff.confirmDelete') }}
              </button>
            </div>
          </WorkspaceSurface>
        </div>
      </template>

      <template v-else>
        <form class="space-y-5" @submit.prevent="submitForm">
          <WorkspaceSurface v-if="formErrorMessage" tone="muted" class="border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {{ formErrorMessage }}
          </WorkspaceSurface>

          <div v-if="isCreateDrawer" class="space-y-5">
            <label class="space-y-2 text-sm text-slate-700">
              <span class="font-medium">{{ t('workspace.staff.fields.staffIds') }}</span>
              <textarea id="staff-staffCodesText" v-model="formState.staffCodesText" name="staffCodesText" rows="8" :class="inputClass('staffCodesText')"></textarea>
              <p class="text-xs text-slate-500">{{ t('workspace.staff.batchStaffHint') }}</p>
              <p v-if="fieldErrors.staffCodesText" class="text-xs text-rose-600">{{ fieldErrors.staffCodesText }}</p>
            </label>

            <WorkspaceSurface tone="muted" class="border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              {{ t('workspace.staff.autoFillHint') }}
            </WorkspaceSurface>

            <div class="grid gap-4 md:grid-cols-2">
              <label class="space-y-2 text-sm text-slate-700">
                <span class="font-medium">{{ t('workspace.staff.fields.team') }}</span>
                <select id="staff-teamId" v-model="formState.teamId" name="teamId" :class="['bg-white', ...inputClass('teamId')]">
                  <option value="">{{ t('workspace.staff.selectTeam') }}</option>
                  <option v-for="team in editableTeamOptions" :key="team.id" :value="String(team.id)">{{ team.name }}</option>
                </select>
                <p v-if="fieldErrors.teamId" class="text-xs text-rose-600">{{ fieldErrors.teamId }}</p>
              </label>
              <label class="space-y-2 text-sm text-slate-700">
                <span class="font-medium">{{ t('workspace.staff.fields.timezone') }}</span>
                <select id="staff-timezone" v-model="formState.timezone" name="timezone" :class="['bg-white', ...inputClass('timezone')]">
                  <option v-for="timezoneOption in WORKSPACE_STAFF_TIMEZONE_OPTIONS" :key="timezoneOption.value" :value="timezoneOption.value">
                    {{ timezoneOption.label }}
                  </option>
                </select>
                <p v-if="fieldErrors.timezone" class="text-xs text-rose-600">{{ fieldErrors.timezone }}</p>
              </label>
              <label class="space-y-2 text-sm text-slate-700">
                <span class="font-medium">{{ t('workspace.staff.fields.status') }}</span>
                <select id="staff-status" v-model="formState.status" name="status" class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20">
                  <option value="ACTIVE">{{ t('common.active') }}</option>
                  <option value="INACTIVE">{{ t('common.inactive') }}</option>
                </select>
              </label>
              <label class="space-y-2 text-sm text-slate-700 md:col-span-2">
                <span class="font-medium">{{ t('workspace.staff.fields.notes') }}</span>
                <textarea id="staff-notes" v-model="formState.notes" name="notes" rows="4" :class="inputClass('notes')"></textarea>
                <p v-if="fieldErrors.notes" class="text-xs text-rose-600">{{ fieldErrors.notes }}</p>
              </label>
            </div>
          </div>

          <div v-else class="grid gap-4 md:grid-cols-2">
            <label class="space-y-2 text-sm text-slate-700">
              <span class="font-medium">{{ t('workspace.staff.fields.staffId') }}</span>
              <input id="staff-staffCode" v-model="formState.staffCode" name="staffCode" type="text" :class="inputClass('staffCode')" />
              <p v-if="fieldErrors.staffCode" class="text-xs text-rose-600">{{ fieldErrors.staffCode }}</p>
            </label>
            <label class="space-y-2 text-sm text-slate-700">
              <span class="font-medium">{{ t('workspace.staff.fields.fullName') }}</span>
              <input id="staff-name" v-model="formState.name" name="name" type="text" :class="inputClass('name')" />
              <p v-if="fieldErrors.name" class="text-xs text-rose-600">{{ fieldErrors.name }}</p>
            </label>
            <label class="space-y-2 text-sm text-slate-700 md:col-span-2">
              <span class="font-medium">{{ t('workspace.staff.fields.email') }}</span>
              <input id="staff-email" v-model="formState.email" name="email" type="email" :class="inputClass('email')" />
              <p v-if="fieldErrors.email" class="text-xs text-rose-600">{{ fieldErrors.email }}</p>
            </label>
            <label class="space-y-2 text-sm text-slate-700">
              <span class="font-medium">{{ t('workspace.staff.fields.phone') }}</span>
              <input id="staff-phone" v-model="formState.phone" name="phone" type="text" :class="inputClass('phone')" />
              <p v-if="fieldErrors.phone" class="text-xs text-rose-600">{{ fieldErrors.phone }}</p>
            </label>
            <label class="space-y-2 text-sm text-slate-700">
              <span class="font-medium">{{ t('workspace.staff.fields.slack') }}</span>
              <input id="staff-slack" v-model="formState.slack" name="slack" type="text" :class="inputClass('slack')" />
              <p v-if="fieldErrors.slack" class="text-xs text-rose-600">{{ fieldErrors.slack }}</p>
            </label>
            <label class="space-y-2 text-sm text-slate-700">
              <span class="font-medium">{{ t('workspace.staff.fields.region') }}</span>
              <input id="staff-region" v-model="formState.region" name="region" type="text" :class="inputClass('region')" />
              <p v-if="fieldErrors.region" class="text-xs text-rose-600">{{ fieldErrors.region }}</p>
            </label>
            <label class="space-y-2 text-sm text-slate-700">
              <span class="font-medium">{{ t('workspace.staff.fields.timezone') }}</span>
              <select id="staff-timezone" v-model="formState.timezone" name="timezone" :class="['bg-white', ...inputClass('timezone')]">
                <option v-for="timezoneOption in WORKSPACE_STAFF_TIMEZONE_OPTIONS" :key="timezoneOption.value" :value="timezoneOption.value">
                  {{ timezoneOption.label }}
                </option>
              </select>
              <p v-if="fieldErrors.timezone" class="text-xs text-rose-600">{{ fieldErrors.timezone }}</p>
            </label>
            <label class="space-y-2 text-sm text-slate-700">
              <span class="font-medium">{{ t('workspace.staff.fields.roleName') }}</span>
              <input id="staff-roleName" v-model="formState.roleName" name="roleName" type="text" :class="inputClass('roleName')" />
              <p v-if="fieldErrors.roleName" class="text-xs text-rose-600">{{ fieldErrors.roleName }}</p>
            </label>
            <label class="space-y-2 text-sm text-slate-700">
              <span class="font-medium">{{ t('workspace.staff.fields.team') }}</span>
              <select id="staff-teamId" v-model="formState.teamId" name="teamId" :class="['bg-white', ...inputClass('teamId')]">
                <option value="">{{ t('workspace.staff.selectTeam') }}</option>
                <option v-for="team in editableTeamOptions" :key="team.id" :value="String(team.id)">{{ team.name }}</option>
              </select>
              <p v-if="fieldErrors.teamId" class="text-xs text-rose-600">{{ fieldErrors.teamId }}</p>
            </label>
            <label class="space-y-2 text-sm text-slate-700">
              <span class="font-medium">{{ t('workspace.staff.fields.status') }}</span>
              <select id="staff-status" v-model="formState.status" name="status" class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20">
                <option value="ACTIVE">{{ t('common.active') }}</option>
                <option value="INACTIVE">{{ t('common.inactive') }}</option>
              </select>
            </label>
            <label class="space-y-2 text-sm text-slate-700 md:col-span-2">
              <span class="font-medium">{{ t('workspace.staff.fields.notes') }}</span>
              <textarea id="staff-notes" v-model="formState.notes" name="notes" rows="4" :class="inputClass('notes')"></textarea>
              <p v-if="fieldErrors.notes" class="text-xs text-rose-600">{{ fieldErrors.notes }}</p>
            </label>
          </div>
        </form>
      </template>

      <template #footer>
        <div class="flex items-center justify-between gap-3">
          <button
            v-if="drawerMode === 'detail' && canEditSelectedStaff"
            type="button"
            class="inline-flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="deletePending"
            @click="promptDeleteStaff"
          >
            <Trash2 class="h-4 w-4" />
            {{ t('workspace.staff.deleteAction') }}
          </button>
          <div v-else></div>

          <div class="flex items-center gap-3">
            <button type="button" class="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50" @click="closeDrawer">
              {{ t('common.cancel') }}
            </button>
            <button
              v-if="drawerMode === 'detail' && canEditSelectedStaff"
              type="button"
              class="inline-flex items-center gap-2 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
              @click="openEditDrawer"
            >
              <Pencil class="h-4 w-4" />
              {{ t('workspace.staff.editAction') }}
            </button>
            <button
              v-else-if="canCreateStaff"
              type="button"
              class="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="submitPending"
              @click="submitForm"
            >
              {{ submitPending ? t('common.saving') : drawerMode === 'create' ? t('workspace.staff.createAction') : t('workspace.staff.saveAction') }}
            </button>
          </div>
        </div>
      </template>
    </WorkspaceDrawer>
  </div>
</template>
