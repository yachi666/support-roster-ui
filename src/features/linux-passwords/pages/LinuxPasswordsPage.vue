<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import LinuxPasswordForm from '../components/LinuxPasswordForm.vue'
import LinuxPasswordSidebar from '../components/LinuxPasswordSidebar.vue'
import LinuxPasswordTable from '../components/LinuxPasswordTable.vue'
import LinuxPasswordToolbar from '../components/LinuxPasswordToolbar.vue'
import { mockServers } from '../data/mockServers'
import { createLinuxPasswordServer, filterLinuxPasswordServers, listLinuxPasswordUnits } from '../lib/linuxPasswords'

const { t } = useI18n()
const servers = ref([...mockServers])
const view = ref('list')
const selectedUnit = ref('All')
const search = ref('')
const visiblePasswords = ref({})
const modulesExpanded = ref(true)
const copiedServerId = ref('')
const statusMessage = ref('')

const allUnits = computed(() => listLinuxPasswordUnits(servers.value))
const filteredServers = computed(() => filterLinuxPasswordServers(servers.value, {
  selectedUnit: selectedUnit.value,
  search: search.value,
}))
const subtitle = computed(() => {
  if (view.value === 'add') {
    return t('linuxPasswords.addNewServer')
  }
  if (selectedUnit.value === 'All') {
    return t('linuxPasswords.allServers')
  }
  return selectedUnit.value
})

function togglePassword(serverId) {
  visiblePasswords.value = {
    ...visiblePasswords.value,
    [serverId]: !visiblePasswords.value[serverId],
  }
}

async function copyPassword(server) {
  await navigator.clipboard.writeText(server.passwordHash)
  copiedServerId.value = server.id
  statusMessage.value = t('linuxPasswords.copiedServer', { hostname: server.hostname })
  window.setTimeout(() => {
    if (copiedServerId.value === server.id) {
      copiedServerId.value = ''
    }
  }, 1500)
}

function launchWinSCP(server) {
  statusMessage.value = t('linuxPasswords.launchingWinScp', { hostname: server.hostname })
}

function submitServer(formData) {
  servers.value = [createLinuxPasswordServer(formData), ...servers.value]
  view.value = 'list'
  statusMessage.value = t('linuxPasswords.savedServer', { hostname: formData.hostname.trim() })
}
</script>

<template>
  <div class="flex min-h-screen overflow-hidden bg-[#f0f2f5] text-[#1f2937]">
    <LinuxPasswordSidebar
      :units="allUnits"
      :selected-unit="selectedUnit"
      :modules-expanded="modulesExpanded"
      @toggle-modules="modulesExpanded = !modulesExpanded"
      @select-unit="selectedUnit = $event"
    />

    <main class="flex flex-1 flex-col overflow-hidden">
      <LinuxPasswordToolbar
        :title="t('linuxPasswords.title')"
        :subtitle="subtitle"
        :search="search"
        :view="view"
        @update:search="search = $event"
        @show-add="view = 'add'"
        @show-list="view = 'list'"
      />

      <div class="flex-1 overflow-auto p-6">
        <div v-if="statusMessage" class="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          {{ statusMessage }}
        </div>

        <LinuxPasswordTable
          v-if="view === 'list'"
          :servers="filteredServers"
          :visible-passwords="visiblePasswords"
          :copied-server-id="copiedServerId"
          @toggle-password="togglePassword"
          @copy-password="copyPassword"
          @launch-winscp="launchWinSCP"
        />

        <LinuxPasswordForm
          v-else
          :available-units="allUnits"
          @submit="submitServer"
          @cancel="view = 'list'"
        />
      </div>
    </main>
  </div>
</template>
