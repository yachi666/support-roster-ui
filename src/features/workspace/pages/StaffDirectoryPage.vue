<script setup>
import { computed, onMounted, reactive, shallowRef } from 'vue'
import { CheckCircle2, Clock3, Filter, Globe, Mail, Pencil, Plus, Search, Trash2, XCircle } from 'lucide-vue-next'
import { api } from '@/api'
import { applyApiFieldErrors, clearFieldErrors, getApiErrorMessage } from '../lib/formErrors'
import WorkspaceDrawer from '../components/WorkspaceDrawer.vue'
import WorkspacePageHeader from '../components/WorkspacePageHeader.vue'
import WorkspaceSurface from '../components/WorkspaceSurface.vue'

const EMPTY_FORM = {
  staffCode: '',
  name: '',
  email: '',
  phone: '',
  slack: '',
  region: '',
  timezone: 'UTC',
  roleName: '',
  roleGroupId: '',
  status: 'ACTIVE',
  notes: '',
}

const searchTerm = shallowRef('')
const selectedStaffId = shallowRef(null)
const staffList = shallowRef([])
const roleGroups = shallowRef([])
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

const staffErrorRules = [
  {
    match: /staff\s*code/i,
    field: 'staffCode',
    message: 'Staff code is required.',
  },
  {
    match: /full\s*name|\bname\b/i,
    field: 'name',
    message: 'Full name is required.',
  },
  {
    match: /role\s*group|rolegroup/i,
    field: 'roleGroupId',
    message: 'Select a valid role group.',
  },
  {
    match: ['email'],
    field: 'email',
  },
  {
    match: ['timezone'],
    field: 'timezone',
  },
  {
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

async function loadRoleGroups() {
  try {
    roleGroups.value = await api.workspace.getRoleGroups()
  } catch {
    roleGroups.value = []
  }
}

const filteredStaff = computed(() => {
  const query = searchTerm.value.trim().toLowerCase()
  if (!query) {
    return staffList.value
  }

  return staffList.value.filter((staff) => {
    return [staff.name, staff.email, staff.teamName, staff.roleName, staff.roleGroupName, staff.staffCode, staff.id]
      .join(' ')
      .toLowerCase()
      .includes(query)
  })
})

const selectedStaff = computed(() => {
  return staffList.value.find((staff) => staff.id === selectedStaffId.value) || null
})

const roleGroupOptions = computed(() => roleGroups.value.filter((group) => group.active !== false))

const drawerOpen = computed(() => Boolean(selectedStaff.value) || formVisible.value)

const drawerTitle = computed(() => {
  if (drawerMode.value === 'create') {
    return 'Add Staff'
  }

  if (drawerMode.value === 'edit') {
    return 'Edit Staff'
  }

  return 'Staff Profile'
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
    staffCode: staff?.staffCode || '',
    name: staff?.name || '',
    email: staff?.email || '',
    phone: staff?.phone || '',
    slack: staff?.slack || '',
    region: staff?.region || '',
    timezone: staff?.timezone || 'UTC',
    roleName: staff?.roleName || '',
    roleGroupId: staff?.roleGroupId ? String(staff.roleGroupId) : '',
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
    roleGroupId: formState.roleGroupId,
    status: formState.status,
    notes: formState.notes.trim(),
  }
}

function validateForm() {
  clearFieldErrors(fieldErrors)

  if (!formState.staffCode.trim()) fieldErrors.staffCode = 'Staff code is required.'
  if (!formState.name.trim()) fieldErrors.name = 'Full name is required.'
  if (!formState.roleGroupId) fieldErrors.roleGroupId = 'Role group is required.'
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
  if (!selectedStaff.value) {
    return
  }

  drawerMode.value = 'edit'
  fillForm(selectedStaff.value)
  formVisible.value = true
}

async function submitForm() {
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
    const payload = buildPayload()

    if (drawerMode.value === 'create') {
      const created = await api.workspace.createStaff(payload)
      selectedStaffId.value = created.id
    } else if (selectedStaff.value) {
      const updated = await api.workspace.updateStaff(selectedStaff.value.id, payload)
      selectedStaffId.value = updated.id
    }

    formVisible.value = false
    drawerMode.value = 'detail'
    resetForm()
    await loadStaff()
  } catch (error) {
    const hasFieldErrors = applyApiFieldErrors(error, fieldErrors, staffErrorRules)
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
  if (!selectedStaff.value || deletePending.value) {
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
  void loadRoleGroups()
  void loadStaff()
})
</script>

<template>
  <div class="relative flex h-full flex-col bg-slate-50">
    <div class="flex-1 overflow-auto p-8">
      <div class="mx-auto flex max-w-7xl flex-col gap-8">
        <WorkspacePageHeader
          title="Staff Directory"
          description="Manage personnel, roles, and regional assignments."
        >
          <template #actions>
            <div class="relative">
              <label for="workspace-staff-search" class="sr-only">Search staff directory</label>
              <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="workspace-staff-search"
                name="workspace-staff-search"
                v-model="searchTerm"
                type="text"
                placeholder="Search staff..."
                class="w-64 rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <button class="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
              <Filter class="h-4 w-4" />
              <span>Filter</span>
            </button>
            <button class="flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700" @click="openCreateDrawer">
              <Plus class="h-4 w-4" />
              <span>Add Staff</span>
            </button>
          </template>
        </WorkspacePageHeader>

        <WorkspaceSurface v-if="errorMessage" tone="muted" class="border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          <div class="flex items-center justify-between gap-4">
            <span>{{ errorMessage }}</span>
            <button class="rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100" @click="loadStaff">
              Retry
            </button>
          </div>
        </WorkspaceSurface>

        <WorkspaceSurface :padded="false">
          <div class="overflow-x-auto">
            <table class="min-w-full text-left text-sm text-slate-600">
              <thead class="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th class="px-6 py-3">Staff Name</th>
                  <th class="px-6 py-3">Staff ID</th>
                  <th class="px-6 py-3">Role Group</th>
                  <th class="px-6 py-3">Team</th>
                  <th class="px-6 py-3">Timezone</th>
                  <th class="px-6 py-3">Status</th>
                  <th class="px-6 py-3 text-right">Actions</th>
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
                      <div class="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600 shadow-sm">
                        {{ staff.name.split(' ').map((part) => part[0]).join('') }}
                      </div>
                      <div class="flex flex-col">
                        <span class="font-medium text-slate-800">{{ staff.name }}</span>
                        <span class="text-xs text-slate-400">{{ staff.email }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 font-mono text-xs text-slate-500">{{ staff.staffCode || staff.id }}</td>
                  <td class="px-6 py-4">{{ staff.roleGroupName || staff.roleName || '-' }}</td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {{ staff.teamName || '-' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-xs text-slate-500">{{ staff.timezone || '-' }}</td>
                  <td class="px-6 py-4">
                    <span
                      v-if="isActiveStatus(staff.status)"
                      class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
                    >
                      <CheckCircle2 class="h-3.5 w-3.5" />
                      Active
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                    >
                      <XCircle class="h-3.5 w-3.5" />
                      Inactive
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right text-xs text-slate-400">Open</td>
                </tr>
                <tr v-if="loading">
                  <td colspan="7" class="px-6 py-10 text-center text-sm text-slate-500">Loading staff directory...</td>
                </tr>
                <tr v-else-if="!filteredStaff.length">
                  <td colspan="7" class="px-6 py-10 text-center text-sm text-slate-500">No staff records matched the current filter.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </WorkspaceSurface>
      </div>
    </div>

    <WorkspaceDrawer :model-value="drawerOpen" :title="drawerTitle" width="460px" @update:model-value="closeDrawer">
      <template #subtitle>
        <p class="mt-1 text-xs text-slate-500">{{ drawerMode === 'detail' ? 'Inspect and maintain the selected roster participant.' : 'Changes are saved directly to the workspace staff registry.' }}</p>
      </template>

      <template v-if="drawerMode === 'detail' && selectedStaff">
        <div class="space-y-6">
          <div class="rounded-2xl border border-slate-100 bg-slate-50/70 px-6 py-8 text-center">
            <div class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-semibold text-slate-600 shadow-sm">
              {{ selectedStaff.name.split(' ').map((part) => part[0]).join('') }}
            </div>
            <h3 class="text-xl font-semibold text-slate-800">{{ selectedStaff.name }}</h3>
            <p class="mt-1 text-sm text-slate-500">{{ selectedStaff.roleName || selectedStaff.roleGroupName || '-' }}</p>
          </div>

          <div>
            <h4 class="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Contact & Location</h4>
            <div class="space-y-4 text-sm text-slate-700">
              <div class="flex items-center gap-3">
                <Mail class="h-4 w-4 text-slate-400" />
                <span>{{ selectedStaff.email || '-' }}</span>
              </div>
              <div class="flex items-center gap-3">
                <Globe class="h-4 w-4 text-slate-400" />
                <span>Region: {{ selectedStaff.region || '-' }}</span>
              </div>
              <div class="flex items-center gap-3">
                <Clock3 class="h-4 w-4 text-slate-400" />
                <span>{{ selectedStaff.timezone || '-' }}</span>
              </div>
            </div>
          </div>

          <div class="h-px bg-slate-100"></div>

          <div>
            <h4 class="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Roster Participation</h4>
            <div class="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Primary Team</span>
                <span class="font-medium text-slate-800">{{ selectedStaff.teamName || '-' }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Role Group</span>
                <span class="font-medium text-slate-800">{{ selectedStaff.roleGroupName || '-' }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Status</span>
                <span class="font-medium text-slate-800">{{ selectedStaff.status || '-' }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Roster Tags</span>
                <span class="font-medium text-slate-800">{{ selectedStaff.rosterTags?.join(', ') || 'None' }}</span>
              </div>
            </div>
          </div>

          <WorkspaceSurface v-if="formErrorMessage" tone="muted" class="border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {{ formErrorMessage }}
          </WorkspaceSurface>

          <WorkspaceSurface v-if="confirmDeleteVisible" tone="muted" class="space-y-3 border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p>Delete {{ selectedStaff.name }} from the workspace staff registry?</p>
            <p class="text-xs text-amber-800">This removes the staff record immediately. Existing roster assignments may lose their linked profile.</p>
            <div class="flex items-center justify-end gap-2">
              <button type="button" class="rounded-md border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 transition-colors hover:bg-amber-100" @click="cancelDeleteStaff">
                Keep Record
              </button>
              <button type="button" class="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60" :disabled="deletePending" @click="confirmDeleteStaff">
                {{ deletePending ? 'Deleting...' : 'Confirm Delete' }}
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

          <div class="grid gap-4 md:grid-cols-2">
            <label class="space-y-2 text-sm text-slate-700">
              <span class="font-medium">Staff Code</span>
              <input id="staff-staffCode" v-model="formState.staffCode" name="staffCode" type="text" :class="inputClass('staffCode')" />
              <p v-if="fieldErrors.staffCode" class="text-xs text-rose-600">{{ fieldErrors.staffCode }}</p>
            </label>
            <label class="space-y-2 text-sm text-slate-700">
              <span class="font-medium">Full Name</span>
              <input id="staff-name" v-model="formState.name" name="name" type="text" :class="inputClass('name')" />
              <p v-if="fieldErrors.name" class="text-xs text-rose-600">{{ fieldErrors.name }}</p>
            </label>
            <label class="space-y-2 text-sm text-slate-700 md:col-span-2">
              <span class="font-medium">Email</span>
              <input id="staff-email" v-model="formState.email" name="email" type="email" :class="inputClass('email')" />
              <p v-if="fieldErrors.email" class="text-xs text-rose-600">{{ fieldErrors.email }}</p>
            </label>
            <label class="space-y-2 text-sm text-slate-700">
              <span class="font-medium">Phone</span>
              <input id="staff-phone" v-model="formState.phone" name="phone" type="text" :class="inputClass('phone')" />
              <p v-if="fieldErrors.phone" class="text-xs text-rose-600">{{ fieldErrors.phone }}</p>
            </label>
            <label class="space-y-2 text-sm text-slate-700">
              <span class="font-medium">Slack</span>
              <input id="staff-slack" v-model="formState.slack" name="slack" type="text" :class="inputClass('slack')" />
              <p v-if="fieldErrors.slack" class="text-xs text-rose-600">{{ fieldErrors.slack }}</p>
            </label>
            <label class="space-y-2 text-sm text-slate-700">
              <span class="font-medium">Region</span>
              <input id="staff-region" v-model="formState.region" name="region" type="text" :class="inputClass('region')" />
              <p v-if="fieldErrors.region" class="text-xs text-rose-600">{{ fieldErrors.region }}</p>
            </label>
            <label class="space-y-2 text-sm text-slate-700">
              <span class="font-medium">Timezone</span>
              <input id="staff-timezone" v-model="formState.timezone" name="timezone" type="text" :class="inputClass('timezone')" />
              <p v-if="fieldErrors.timezone" class="text-xs text-rose-600">{{ fieldErrors.timezone }}</p>
            </label>
            <label class="space-y-2 text-sm text-slate-700">
              <span class="font-medium">Role Name</span>
              <input id="staff-roleName" v-model="formState.roleName" name="roleName" type="text" :class="inputClass('roleName')" />
              <p v-if="fieldErrors.roleName" class="text-xs text-rose-600">{{ fieldErrors.roleName }}</p>
            </label>
            <label class="space-y-2 text-sm text-slate-700">
              <span class="font-medium">Role Group</span>
              <select id="staff-roleGroupId" v-model="formState.roleGroupId" name="roleGroupId" :class="['bg-white', ...inputClass('roleGroupId')]">
                <option value="">Select a role group</option>
                <option v-for="group in roleGroupOptions" :key="group.id" :value="String(group.id)">{{ group.name }}</option>
              </select>
              <p v-if="fieldErrors.roleGroupId" class="text-xs text-rose-600">{{ fieldErrors.roleGroupId }}</p>
            </label>
            <label class="space-y-2 text-sm text-slate-700">
              <span class="font-medium">Status</span>
              <select id="staff-status" v-model="formState.status" name="status" class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </label>
            <label class="space-y-2 text-sm text-slate-700 md:col-span-2">
              <span class="font-medium">Notes</span>
              <textarea id="staff-notes" v-model="formState.notes" name="notes" rows="4" :class="inputClass('notes')"></textarea>
              <p v-if="fieldErrors.notes" class="text-xs text-rose-600">{{ fieldErrors.notes }}</p>
            </label>
          </div>
        </form>
      </template>

      <template #footer>
        <div class="flex items-center justify-between gap-3">
          <button
            v-if="drawerMode === 'detail' && selectedStaff"
            type="button"
            class="inline-flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="deletePending"
            @click="promptDeleteStaff"
          >
            <Trash2 class="h-4 w-4" />
            Delete
          </button>
          <div v-else></div>

          <div class="flex items-center gap-3">
            <button type="button" class="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50" @click="closeDrawer">
              Cancel
            </button>
            <button
              v-if="drawerMode === 'detail' && selectedStaff"
              type="button"
              class="inline-flex items-center gap-2 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
              @click="openEditDrawer"
            >
              <Pencil class="h-4 w-4" />
              Edit
            </button>
            <button
              v-else
              type="button"
              class="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="submitPending"
              @click="submitForm"
            >
              {{ submitPending ? 'Saving...' : drawerMode === 'create' ? 'Create Staff' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </template>
    </WorkspaceDrawer>
  </div>
</template>
