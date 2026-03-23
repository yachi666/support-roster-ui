<script setup>
import { computed, onMounted, reactive, shallowRef, watch } from 'vue'
import { KeyRound, Plus, RefreshCcw, Search, ShieldAlert, UserCog, UserRoundCheck, UserRoundX } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { applyApiFieldErrors, clearFieldErrors, getApiErrorMessage } from '../lib/formErrors'
import WorkspaceDrawer from '../components/WorkspaceDrawer.vue'
import WorkspacePageHeader from '../components/WorkspacePageHeader.vue'
import WorkspaceSurface from '../components/WorkspaceSurface.vue'

const authStore = useAuthStore()
const { t } = useI18n()

const EMPTY_FORM = {
  createTeamId: '',
  staffRecordId: '',
  roleCode: 'editor',
  editableTeamIds: [],
  notes: '',
}

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'readonly', label: 'Readonly' },
]

const searchTerm = shallowRef('')
const accounts = shallowRef([])
const staffOptions = shallowRef([])
const teams = shallowRef([])
const loading = shallowRef(false)
const errorMessage = shallowRef('')
const drawerOpen = shallowRef(false)
const selectedAccountId = shallowRef(null)
const submitPending = shallowRef(false)
const actionPending = shallowRef(false)
const formErrorMessage = shallowRef('')
const fieldErrors = reactive({})
const formState = reactive({ ...EMPTY_FORM })

const accountErrorRules = [
  { match: /staff/i, field: 'staffRecordId', message: 'Choose a valid staff member.' },
  { match: /role/i, field: 'roleCode', message: 'Select a valid role.' },
  { match: /team/i, field: 'editableTeamIds', message: 'Editors must have at least one editable team.' },
]

const selectedAccount = computed(() => accounts.value.find((account) => account.id === selectedAccountId.value) || null)
const isCreateMode = computed(() => !selectedAccount.value)
const selectedCreateTeam = computed(() => teams.value.find((team) => String(team.id) === String(formState.createTeamId)) || null)
const selectedStaffOption = computed(() => staffOptions.value.find((staff) => String(staff.id) === String(formState.staffRecordId)) || null)
const availableStaffOptions = computed(() => {
  const linkedStaffIds = new Set(accounts.value.map((account) => String(account.staffRecordId)))
  const filteredStaff = staffOptions.value.filter((staff) => !linkedStaffIds.has(String(staff.id)) || String(selectedAccount.value?.staffRecordId || '') === String(staff.id))
  if (!isCreateMode.value) {
    return filteredStaff
  }
  if (!formState.createTeamId) {
    return []
  }
  return filteredStaff.filter((staff) => String(staff.teamId || '') === String(formState.createTeamId))
})
const filteredAccounts = computed(() => {
  const query = searchTerm.value.trim().toLowerCase()
  if (!query) {
    return accounts.value
  }
  return accounts.value.filter((account) => [account.staffId, account.staffName, account.roleCode, account.accountStatus]
    .join(' ')
    .toLowerCase()
    .includes(query))
})
const isEditorRole = computed(() => formState.roleCode === 'editor')

function resetForm() {
  Object.assign(formState, { ...EMPTY_FORM })
  clearFieldErrors(fieldErrors)
  formErrorMessage.value = ''
}

function fillForm(account) {
  Object.assign(formState, {
    createTeamId: '',
    staffRecordId: account?.staffRecordId ? String(account.staffRecordId) : '',
    roleCode: account?.roleCode || 'editor',
    editableTeamIds: (account?.editableTeamIds || []).map(String),
    notes: account?.notes || '',
  })
}

function applyDefaultEditorTeamScope() {
  if (!isCreateMode.value || formState.roleCode !== 'editor') {
    return
  }
  const defaultTeamId = String(selectedStaffOption.value?.teamId || '')
  if (!defaultTeamId) {
    return
  }
  if (formState.editableTeamIds.includes(defaultTeamId)) {
    return
  }
  formState.editableTeamIds = [...formState.editableTeamIds, defaultTeamId]
}

function handleCreateTeamChange() {
  if (!isCreateMode.value) {
    return
  }
  formState.staffRecordId = ''
  if (formState.roleCode === 'editor') {
    formState.editableTeamIds = []
  }
}

function toggleTeam(teamId) {
  const normalizedId = String(teamId)
  if (formState.editableTeamIds.includes(normalizedId)) {
    formState.editableTeamIds = formState.editableTeamIds.filter((value) => value !== normalizedId)
    return
  }
  formState.editableTeamIds = [...formState.editableTeamIds, normalizedId]
}

function openCreateDrawer() {
  selectedAccountId.value = null
  resetForm()
  drawerOpen.value = true
}

function openEditDrawer(account) {
  selectedAccountId.value = account.id
  fillForm(account)
  drawerOpen.value = true
}

function closeDrawer() {
  drawerOpen.value = false
  selectedAccountId.value = null
  resetForm()
}

function validateForm() {
  clearFieldErrors(fieldErrors)

  if (isCreateMode.value && !formState.createTeamId) fieldErrors.createTeamId = 'Team selection is required before choosing staff.'
  if (!formState.staffRecordId) fieldErrors.staffRecordId = 'Staff selection is required.'
  if (!formState.roleCode) fieldErrors.roleCode = 'Role is required.'
  if (isEditorRole.value && !formState.editableTeamIds.length) fieldErrors.editableTeamIds = 'Editors must have at least one editable team.'
  if (formState.notes.trim().length > 500) fieldErrors.notes = 'Notes must be 500 characters or fewer.'

  return Object.keys(fieldErrors).length === 0
}

function buildPayload() {
  return {
    staffRecordId: formState.staffRecordId,
    roleCode: formState.roleCode,
    editableTeamIds: isEditorRole.value ? formState.editableTeamIds : [],
    notes: formState.notes.trim(),
  }
}

async function loadAccounts() {
  loading.value = true
  errorMessage.value = ''
  try {
    accounts.value = await api.workspace.getAccounts(searchTerm.value)
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'Failed to load accounts.')
  } finally {
    loading.value = false
  }
}

async function loadStaff() {
  try {
    staffOptions.value = await api.workspace.getStaff('')
  } catch {
    staffOptions.value = []
  }
}

async function loadTeams() {
  try {
    teams.value = await api.workspace.getTeams()
  } catch {
    teams.value = []
  }
}

async function saveAccount() {
  if (submitPending.value) {
    return
  }
  formErrorMessage.value = ''

  if (!validateForm()) {
    formErrorMessage.value = 'Please correct the highlighted fields before saving.'
    return
  }

  submitPending.value = true
  try {
    const payload = buildPayload()
    if (selectedAccount.value) {
      await api.workspace.updateAccount(selectedAccount.value.id, payload)
    } else {
      await api.workspace.createAccount(payload)
    }
    await loadAccounts()
    closeDrawer()
  } catch (error) {
    const hasFieldErrors = applyApiFieldErrors(error, fieldErrors, accountErrorRules)
    formErrorMessage.value = hasFieldErrors ? 'Please correct the highlighted fields before saving.' : getApiErrorMessage(error, 'Failed to save account.')
  } finally {
    submitPending.value = false
  }
}

async function runAccountAction(action) {
  if (!selectedAccount.value || actionPending.value) {
    return
  }
  actionPending.value = true
  formErrorMessage.value = ''
  try {
    await action(selectedAccount.value.id)
    await loadAccounts()
    if (selectedAccount.value?.id === authStore.currentUser?.accountId) {
      await authStore.refreshCurrentUser()
    }
    if (selectedAccountId.value) {
      const refreshed = accounts.value.find((account) => account.id === selectedAccountId.value)
      if (refreshed) {
        fillForm(refreshed)
      }
    }
  } catch (error) {
    formErrorMessage.value = getApiErrorMessage(error, 'Account action failed.')
  } finally {
    actionPending.value = false
  }
}

function inputClass(fieldName) {
  return [
    'w-full rounded-md border px-3 py-2 outline-none transition focus:ring-2 focus:ring-teal-500/20',
    fieldErrors[fieldName] ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-teal-500',
  ]
}

watch(() => formState.staffRecordId, () => {
  delete fieldErrors.createTeamId
  delete fieldErrors.staffRecordId
  delete fieldErrors.editableTeamIds
  applyDefaultEditorTeamScope()
})

watch(() => formState.roleCode, (roleCode) => {
  if (roleCode === 'editor') {
    applyDefaultEditorTeamScope()
  }
})

onMounted(async () => {
  await Promise.all([loadAccounts(), loadStaff(), loadTeams()])
})
</script>

<template>
  <div class="flex h-full flex-col bg-slate-50">
    <div class="flex-1 overflow-auto p-8">
      <div class="mx-auto flex max-w-7xl flex-col gap-8">
        <WorkspacePageHeader
          :title="t('workspace.accounts.title')"
          :description="t('workspace.accounts.description')"
        >
          <template #actions>
            <div class="relative">
              <label for="workspace-account-search" class="sr-only">{{ t('workspace.accounts.searchLabel') }}</label>
              <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="workspace-account-search"
                v-model="searchTerm"
                type="text"
                :placeholder="t('workspace.accounts.searchPlaceholder')"
                class="w-64 rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                @input="void loadAccounts()"
              />
            </div>
            <button class="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50" @click="void loadAccounts()">
              <RefreshCcw class="h-4 w-4" />
              {{ t('common.refresh') }}
            </button>
            <button class="inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700" @click="openCreateDrawer">
              <Plus class="h-4 w-4" />
              {{ t('workspace.accounts.createAction') }}
            </button>
          </template>
        </WorkspacePageHeader>

        <WorkspaceSurface v-if="errorMessage" tone="muted" class="border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          <div class="flex items-center justify-between gap-4">
            <span>{{ errorMessage }}</span>
            <button class="rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100" @click="void loadAccounts()">
              {{ t('common.retry') }}
            </button>
          </div>
        </WorkspaceSurface>

        <WorkspaceSurface tone="muted" class="flex gap-4 border-amber-200 bg-amber-50 p-5 text-amber-900">
          <ShieldAlert class="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <div>
            <h3 class="text-sm font-semibold">{{ t('workspace.accounts.activationTitle') }}</h3>
            <p class="mt-1 text-sm leading-relaxed text-amber-800/80">
              {{ t('workspace.accounts.activationBody') }}
            </p>
          </div>
        </WorkspaceSurface>

        <WorkspaceSurface :padded="false">
          <div class="overflow-x-auto">
            <table class="min-w-full text-left text-sm text-slate-600">
              <thead class="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th class="px-6 py-3">{{ t('workspace.accounts.columns.staff') }}</th>
                  <th class="px-6 py-3">{{ t('workspace.accounts.columns.role') }}</th>
                  <th class="px-6 py-3">{{ t('workspace.accounts.columns.status') }}</th>
                  <th class="px-6 py-3">{{ t('workspace.accounts.columns.editableTeams') }}</th>
                  <th class="px-6 py-3">{{ t('workspace.accounts.columns.lastLogin') }}</th>
                  <th class="px-6 py-3 text-right">{{ t('workspace.accounts.columns.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td colspan="6" class="px-6 py-8 text-center text-sm text-slate-500">{{ t('workspace.accounts.loading') }}</td>
                </tr>
                <tr v-else-if="!filteredAccounts.length">
                  <td colspan="6" class="px-6 py-8 text-center text-sm text-slate-500">{{ t('workspace.accounts.empty') }}</td>
                </tr>
                <tr v-for="account in filteredAccounts" :key="account.id" class="border-b border-slate-100 transition hover:bg-slate-50/70">
                  <td class="px-6 py-4">
                    <div class="font-medium text-slate-800">{{ account.staffName }}</div>
                    <div class="text-xs text-slate-500">{{ account.staffId }}</div>
                  </td>
                  <td class="px-6 py-4 capitalize">{{ account.roleCode }}</td>
                  <td class="px-6 py-4">
                    <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold" :class="account.accountStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : account.accountStatus === 'DISABLED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'">
                      {{ account.accountStatus }}
                    </span>
                  </td>
                   <td class="px-6 py-4 text-xs text-slate-500">{{ (account.editableTeams || []).map((team) => team.name).join(', ') || t('workspace.accounts.allOrNa') }}</td>
                  <td class="px-6 py-4 text-xs text-slate-500">{{ account.lastLoginAt || '-' }}</td>
                  <td class="px-6 py-4 text-right">
                    <button class="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50" @click="openEditDrawer(account)">
                      {{ t('workspace.accounts.manageAction') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </WorkspaceSurface>
      </div>
    </div>

    <WorkspaceDrawer v-model="drawerOpen" :title="selectedAccount ? t('workspace.accounts.manageTitle') : t('workspace.accounts.createTitle')" width="520px">
      <div class="space-y-6">
        <div v-if="formErrorMessage" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {{ formErrorMessage }}
        </div>

        <div>
          <template v-if="isCreateMode">
            <label class="mb-2 block text-sm font-medium text-slate-700">{{ t('workspace.accounts.team') }}</label>
            <select v-model="formState.createTeamId" :class="['bg-white', ...inputClass('createTeamId')]" @change="handleCreateTeamChange">
              <option value="">{{ t('workspace.accounts.selectTeamFirst') }}</option>
              <option v-for="team in teams" :key="team.id" :value="String(team.id)">{{ team.name }}</option>
            </select>
            <p class="mt-2 text-xs text-slate-500">{{ t('workspace.accounts.selectTeamFirstHint') }}</p>
            <p v-if="fieldErrors.createTeamId" class="mt-2 text-xs text-rose-600">{{ fieldErrors.createTeamId }}</p>
          </template>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">{{ t('workspace.accounts.staffMember') }}</label>
          <select v-model="formState.staffRecordId" :disabled="Boolean(selectedAccount) || (isCreateMode && !formState.createTeamId)" :class="['bg-white', ...inputClass('staffRecordId')]">
            <option value="">{{ isCreateMode && !formState.createTeamId ? t('workspace.accounts.selectTeamFirst') : t('workspace.accounts.selectStaff') }}</option>
            <option v-for="staff in availableStaffOptions" :key="staff.id" :value="String(staff.id)">
              {{ staff.staffCode }} · {{ staff.name }}
            </option>
          </select>
          <p v-if="isCreateMode && selectedCreateTeam" class="mt-2 text-xs text-slate-500">
            {{ t('workspace.accounts.showingTeamStaff', { team: selectedCreateTeam.name }) }}
          </p>
          <p v-else-if="isCreateMode" class="mt-2 text-xs text-slate-500">
            {{ t('workspace.accounts.staffSelectionHint') }}
          </p>
          <p v-if="fieldErrors.staffRecordId" class="mt-2 text-xs text-rose-600">{{ fieldErrors.staffRecordId }}</p>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">{{ t('workspace.accounts.role') }}</label>
          <select v-model="formState.roleCode" :class="inputClass('roleCode')">
            <option v-for="option in roleOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
          <p v-if="fieldErrors.roleCode" class="mt-2 text-xs text-rose-600">{{ fieldErrors.roleCode }}</p>
        </div>

        <div>
          <div class="mb-2 flex items-center justify-between gap-2">
            <label class="text-sm font-medium text-slate-700">{{ t('workspace.accounts.editorScope') }}</label>
            <span class="text-xs text-slate-400">{{ t('workspace.accounts.editorScopeHint') }}</span>
          </div>
          <p v-if="isCreateMode && selectedStaffOption?.teamName" class="mb-2 text-xs text-slate-500">
            {{ t('workspace.accounts.defaultScopeHint', { team: selectedStaffOption.teamName }) }}
          </p>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div class="grid gap-2 sm:grid-cols-2">
              <label v-for="team in teams" :key="team.id" class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                <input type="checkbox" :checked="formState.editableTeamIds.includes(String(team.id))" :disabled="!isEditorRole" @change="toggleTeam(team.id)" />
                <span>{{ team.name }}</span>
              </label>
            </div>
          </div>
          <p v-if="fieldErrors.editableTeamIds" class="mt-2 text-xs text-rose-600">{{ fieldErrors.editableTeamIds }}</p>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">{{ t('common.notes') }}</label>
          <textarea v-model="formState.notes" rows="4" :class="inputClass('notes')" :placeholder="t('workspace.accounts.notesPlaceholder')"></textarea>
          <p v-if="fieldErrors.notes" class="mt-2 text-xs text-rose-600">{{ fieldErrors.notes }}</p>
        </div>
      </div>

      <template #footer>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div v-if="selectedAccount" class="flex flex-wrap items-center gap-2">
            <button class="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50" :disabled="actionPending" @click="runAccountAction(api.workspace.resetAccountPassword)">
              <KeyRound class="h-4 w-4" />
              {{ t('workspace.accounts.resetPassword') }}
            </button>
            <button
              class="inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors"
              :class="selectedAccount.accountStatus === 'DISABLED' ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'"
              :disabled="actionPending"
              @click="runAccountAction(selectedAccount.accountStatus === 'DISABLED' ? api.workspace.enableAccount : api.workspace.disableAccount)"
            >
              <component :is="selectedAccount.accountStatus === 'DISABLED' ? UserRoundCheck : UserRoundX" class="h-4 w-4" />
              {{ selectedAccount.accountStatus === 'DISABLED' ? t('workspace.accounts.enableAccount') : t('workspace.accounts.disableAccount') }}
            </button>
          </div>
          <div class="ml-auto flex items-center gap-3">
            <button class="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50" @click="closeDrawer">
              {{ t('common.cancel') }}
            </button>
            <button class="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60" :disabled="submitPending" @click="saveAccount">
              <UserCog class="h-4 w-4" />
              {{ submitPending ? t('common.saving') : selectedAccount ? t('workspace.accounts.saveAction') : t('workspace.accounts.createAction') }}
            </button>
          </div>
        </div>
      </template>
    </WorkspaceDrawer>
  </div>
</template>
