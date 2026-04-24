import { computed, proxyRefs, ref, shallowRef, unref } from 'vue'

function normalizeServerPayload(formData = {}) {
  const businessUnits = Array.isArray(formData.businessUnits)
    ? formData.businessUnits
    : Array.isArray(formData.folders)
      ? formData.folders
      : []

  return {
    hostname: String(formData.hostname || '').trim(),
    ip: String(formData.ip || '').trim(),
    username: String(formData.username || '').trim(),
    password: String(formData.password || ''),
    businessUnits,
  }
}

export function createLinuxPasswordsModel({
  api,
  authStore,
  t,
  confirmDelete,
}) {
  const servers = ref([])
  const availableUnits = ref([])
  const visiblePasswords = ref({})
  const view = shallowRef('list')
  const selectedUnit = shallowRef('All')
  const search = shallowRef('')
  const copiedServerId = shallowRef('')
  const statusMessage = shallowRef('')
  const isLoading = shallowRef(false)
  const formMode = shallowRef('create')
  const editingServer = shallowRef(null)

  const canManageServers = computed(() => Boolean(unref(authStore?.isAdmin)))
  const subtitle = computed(() => {
    if (view.value === 'add') {
      return formMode.value === 'edit'
        ? t('linuxPasswords.editServer')
        : t('linuxPasswords.addNewServer')
    }
    if (selectedUnit.value === 'All') {
      return t('linuxPasswords.allServers')
    }
    return selectedUnit.value
  })

  async function loadServers() {
    isLoading.value = true
    try {
      const response = await api.workspace.getLinuxPasswords({
        search: search.value,
        businessUnit: selectedUnit.value === 'All' ? null : selectedUnit.value,
      })
      servers.value = Array.isArray(response?.items) ? response.items : []
    } finally {
      isLoading.value = false
    }
  }

  async function loadDirectories() {
    const response = await api.workspace.getLinuxPasswordDirectories()
    availableUnits.value = Array.isArray(response) ? response : []
  }

  function openAddForm() {
    formMode.value = 'create'
    editingServer.value = null
    view.value = 'add'
  }

  function openEditForm(server) {
    if (!canManageServers.value) {
      return
    }
    formMode.value = 'edit'
    editingServer.value = server
    view.value = 'add'
  }

  async function submitForm(formData) {
    const payload = normalizeServerPayload(formData)

    if (formMode.value === 'edit' && editingServer.value?.id) {
      await api.workspace.updateLinuxPassword(editingServer.value.id, {
        ...payload,
        status: String(formData?.status || '').trim(),
      })
    } else {
      await api.workspace.createLinuxPassword(payload)
    }

    view.value = 'list'
    editingServer.value = null
    statusMessage.value = t('linuxPasswords.savedServer', { hostname: payload.hostname })
    await loadServers()
    await loadDirectories()
  }

  async function deleteServer(server) {
    if (!canManageServers.value) {
      return false
    }

    const confirmed = await confirmDelete?.(server)
    if (!confirmed) {
      return false
    }

    await api.workspace.deleteLinuxPassword(server.id)
    statusMessage.value = t('linuxPasswords.deletedServer', { hostname: server.hostname })
    await loadServers()
    await loadDirectories()
    return true
  }

  function togglePassword(serverId) {
    visiblePasswords.value = {
      ...visiblePasswords.value,
      [serverId]: !visiblePasswords.value[serverId],
    }
  }

  async function copyPassword(server, clipboard = navigator?.clipboard) {
    await clipboard.writeText(server.password)
    copiedServerId.value = server.id
    statusMessage.value = t('linuxPasswords.copiedServer', { hostname: server.hostname })
    window.setTimeout(() => {
      if (copiedServerId.value === server.id) {
        copiedServerId.value = ''
      }
    }, 1500)
  }

  function resetStatusMessage() {
    statusMessage.value = ''
  }

  return proxyRefs({
    availableUnits,
    canManageServers,
    copiedServerId,
    deleteServer,
    editingServer,
    formMode,
     isLoading,
     loadDirectories,
     loadServers,
    openAddForm,
    openEditForm,
    resetStatusMessage,
    search,
    selectedUnit,
    servers,
    statusMessage,
    submitForm,
    subtitle,
    togglePassword,
    view,
    visiblePasswords,
    copyPassword,
  })
}
