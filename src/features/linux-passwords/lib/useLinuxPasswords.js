import { computed, proxyRefs, ref, shallowRef, unref } from 'vue'

function normalizeServerPayload(formData = {}) {
  const businessUnits = Array.isArray(formData.businessUnits)
    ? formData.businessUnits
    : Array.isArray(formData.folders)
      ? formData.folders
      : []
  const credentials = Array.isArray(formData.credentials)
    ? formData.credentials
    : [{
        username: formData.username,
        password: formData.password,
        notes: formData.notes,
      }]

  return {
    hostname: String(formData.hostname || '').trim(),
    ip: String(formData.ip || '').trim(),
    credentials: credentials
      .map((credential) => ({
        id: credential?.id,
        username: String(credential?.username || '').trim(),
        password: String(credential?.password || ''),
        notes: String(credential?.notes || '').trim(),
      }))
      .filter((credential) => credential.username || credential.password || credential.notes),
    businessUnits,
  }
}

export function createLinuxPasswordsModel({
  api,
  authStore,
  t,
  confirmDelete,
}) {
  let latestLoadServersRequestId = 0
  const servers = ref([])
  const availableUnits = ref([])
  const visiblePasswords = ref({})
  const revealedPasswords = ref({})
  const revealingCredentials = new Set()
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
    const requestId = ++latestLoadServersRequestId
    isLoading.value = true
    try {
      const response = await api.workspace.getLinuxPasswords({
        search: search.value,
        businessUnit: selectedUnit.value === 'All' ? null : selectedUnit.value,
      })
      if (requestId === latestLoadServersRequestId) {
        servers.value = Array.isArray(response?.items) ? response.items : []
        visiblePasswords.value = {}
        revealedPasswords.value = {}
      }
    } finally {
      if (requestId === latestLoadServersRequestId) {
        isLoading.value = false
      }
    }
  }

  async function loadDirectories() {
    const response = await api.workspace.getLinuxPasswordDirectories()
    availableUnits.value = Array.isArray(response) ? response : []
  }

  function openAddForm() {
    if (!canManageServers.value) {
      return
    }
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

  async function revealCredentialPassword(credentialId, action = 'VIEW') {
    const response = await api.workspace.revealLinuxPasswordCredential(credentialId, action)
    const password = String(response?.password || '')
    revealedPasswords.value = {
      ...revealedPasswords.value,
      [credentialId]: password,
    }
    return password
  }

  async function togglePassword(credential) {
    const credentialId = credential?.id
    if (!credentialId) {
      return
    }
    if (visiblePasswords.value[credentialId]) {
      visiblePasswords.value = {
        ...visiblePasswords.value,
        [credentialId]: false,
      }
      return
    }
    if (!Object.prototype.hasOwnProperty.call(revealedPasswords.value, credentialId)) {
      if (revealingCredentials.has(credentialId)) {
        return
      }
      revealingCredentials.add(credentialId)
      try {
        await revealCredentialPassword(credentialId, 'VIEW')
      } catch (error) {
        revealingCredentials.delete(credentialId)
        throw error
      }
      revealingCredentials.delete(credentialId)
    }
    visiblePasswords.value = {
      ...visiblePasswords.value,
      [credentialId]: true,
    }
  }

  async function copyPassword(server, clipboard = navigator?.clipboard) {
    const credential = server?.credential || server?.credentials?.[0]
    if (!credential?.id) {
      return
    }
    const password = await revealCredentialPassword(credential.id, 'COPY')
    await clipboard.writeText(password)
    copiedServerId.value = credential.id
    statusMessage.value = t('linuxPasswords.copiedServer', {
      hostname: server.hostname,
      username: credential.username,
    })
    globalThis.setTimeout?.(() => {
      if (copiedServerId.value === credential.id) {
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
    revealedPasswords,
    copyPassword,
  })
}
