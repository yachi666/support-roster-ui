<script setup>
import { onMounted, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import LinuxPasswordForm from '../components/LinuxPasswordForm.vue'
import LinuxPasswordSidebar from '../components/LinuxPasswordSidebar.vue'
import LinuxPasswordTable from '../components/LinuxPasswordTable.vue'
import LinuxPasswordToolbar from '../components/LinuxPasswordToolbar.vue'
import { createLinuxPasswordsModel } from '../lib/useLinuxPasswords'

const { t } = useI18n()
const authStore = useAuthStore()
const modulesExpanded = shallowRef(true)
const topActionLinkBaseClass = 'inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors'
const topActionSecondaryClass = 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
const topActionPrimaryClass = 'border border-teal-200 bg-teal-50 text-teal-700 hover:border-teal-300 hover:bg-teal-100'
const model = createLinuxPasswordsModel({
  api,
  authStore,
  t,
  confirmDelete: async (server) => window.confirm(t('linuxPasswords.deleteConfirm', { hostname: server.hostname })),
})

watch(
  () => [model.search, model.selectedUnit],
  async () => {
    try {
      await model.loadServers()
    } catch (error) {
      model.statusMessage = error?.message || t('linuxPasswords.loadFailed')
    }
  },
  { immediate: true },
)

onMounted(async () => {
  try {
    await model.loadDirectories()
  } catch (error) {
    model.statusMessage = error?.message || t('linuxPasswords.loadFailed')
  }
})

async function copyPassword(server) {
  try {
    await model.copyPassword(server)
  } catch (error) {
    model.statusMessage = error?.message || t('linuxPasswords.copyFailed')
  }
}

function launchWinSCP(server) {
  model.statusMessage = t('linuxPasswords.launchingWinScp', { hostname: server.hostname })
}

async function submitServer(formData) {
  try {
    await model.submitForm(formData)
  } catch (error) {
    model.statusMessage = error?.message || t('linuxPasswords.saveFailed')
  }
}

async function deleteServer(server) {
  try {
    await model.deleteServer(server)
  } catch (error) {
    model.statusMessage = error?.message || t('linuxPasswords.deleteFailed')
  }
}
</script>

<template>
  <div class="flex min-h-screen overflow-hidden bg-[#f0f2f5] text-[#1f2937]">
    <LinuxPasswordSidebar
      :units="model.availableUnits"
      :selected-unit="model.selectedUnit"
      :modules-expanded="modulesExpanded"
      @toggle-modules="modulesExpanded = !modulesExpanded"
      @select-unit="model.selectedUnit = $event"
    />

    <main class="flex flex-1 flex-col overflow-hidden">
      <div class="flex items-center justify-end gap-3 border-b border-[#e5e7eb] bg-white px-6 py-3">
        <RouterLink
          to="/contact-information"
          :class="[topActionLinkBaseClass, topActionSecondaryClass]"
        >
          {{ t('common.contactInformation') }}
        </RouterLink>

        <RouterLink
          to="/viewer"
          :class="[topActionLinkBaseClass, topActionSecondaryClass]"
        >
          {{ t('workspace.shell.openViewer') }}
        </RouterLink>

        <RouterLink
          to="/workspace"
          :class="[topActionLinkBaseClass, topActionPrimaryClass]"
        >
          {{ t('linuxPasswords.enterWorkspace') }}
        </RouterLink>
      </div>

      <LinuxPasswordToolbar
        :can-manage-servers="model.canManageServers"
        :title="t('linuxPasswords.title')"
        :subtitle="model.subtitle"
        :search="model.search"
        :view="model.view"
        @update:search="model.search = $event"
        @show-add="model.openAddForm()"
        @show-list="model.view = 'list'"
      />

      <div class="flex-1 overflow-auto p-6">
        <div v-if="model.statusMessage" class="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          {{ model.statusMessage }}
        </div>

        <LinuxPasswordTable
          v-if="model.view === 'list'"
          :servers="model.servers"
          :visible-passwords="model.visiblePasswords"
          :copied-server-id="model.copiedServerId"
          :can-manage-servers="model.canManageServers"
          @toggle-password="model.togglePassword"
          @copy-password="copyPassword"
          @launch-winscp="launchWinSCP"
          @edit-server="model.openEditForm"
          @delete-server="deleteServer"
        />

        <LinuxPasswordForm
          v-else
          :available-units="model.availableUnits"
          :mode="model.formMode"
          :initial-server="model.editingServer"
          @submit="submitServer"
          @cancel="model.view = 'list'"
        />
      </div>
    </main>
  </div>
</template>
