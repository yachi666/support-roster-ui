import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/api'
import { clearAuthToken, getAuthToken, setAuthToken } from '@/lib/authToken'

const DEFAULT_WORKSPACE_ACCESS_POLICY = Object.freeze([
  { pageCode: 'overview', authRequired: false, configurable: true },
  { pageCode: 'roster', authRequired: false, configurable: true },
  { pageCode: 'staff', authRequired: false, configurable: true },
  { pageCode: 'shifts', authRequired: false, configurable: true },
  { pageCode: 'teams', authRequired: false, configurable: true },
  { pageCode: 'accounts', authRequired: true, configurable: false },
  { pageCode: 'import-export', authRequired: false, configurable: true },
  { pageCode: 'validation', authRequired: false, configurable: true },
])

const GUEST_WORKSPACE_USER = Object.freeze({
  staffName: 'Guest',
  staffId: 'guest',
  role: 'readonly',
  permissions: ['workspace.read'],
  editableTeamIds: [],
  editableTeams: [],
})

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null)
  const initialized = ref(false)
  const loading = ref(false)
  const workspaceAccessPolicy = ref(DEFAULT_WORKSPACE_ACCESS_POLICY.map((page) => ({ ...page })))
  const workspaceAccessLoaded = ref(false)
  const workspaceAccessLoading = ref(false)

  const isAuthenticated = computed(() => Boolean(currentUser.value && getAuthToken()))
  const workspaceUser = computed(() => currentUser.value || GUEST_WORKSPACE_USER)
  const role = computed(() => currentUser.value?.role || 'readonly')
  const isAdmin = computed(() => role.value === 'admin')
  const isEditor = computed(() => role.value === 'editor')
  const isReadonly = computed(() => !isAuthenticated.value || role.value === 'readonly')
  const canManageAccounts = computed(() => isAdmin.value)
  const canWriteWorkspace = computed(() => isAdmin.value || isEditor.value)

  function applySession(token, user) {
    setAuthToken(token)
    currentUser.value = user
    initialized.value = true
  }

  function clearSession() {
    clearAuthToken()
    currentUser.value = null
    initialized.value = true
  }

  async function initSession() {
    if (initialized.value || loading.value) {
      return
    }

    const token = getAuthToken()
    if (!token) {
      initialized.value = true
      return
    }

    loading.value = true
    try {
      currentUser.value = await api.auth.me()
    } catch {
      clearSession()
    } finally {
      initialized.value = true
      loading.value = false
    }
  }

  async function login(payload) {
    const response = await api.auth.login(payload)
    applySession(response.token, response.currentUser)
    return response.currentUser
  }

  async function activate(payload) {
    const response = await api.auth.activate(payload)
    applySession(response.token, response.currentUser)
    return response.currentUser
  }

  async function logout() {
    if (getAuthToken()) {
      try {
        await api.auth.logout()
      } catch {
      }
    }
    clearSession()
  }

  function normalizeWorkspaceAccessPolicy(pages) {
    const incomingPages = Array.isArray(pages) ? pages : []
    const normalizedByCode = new Map(
      incomingPages
        .filter((page) => page?.pageCode)
        .map((page) => [
          String(page.pageCode),
          {
            pageCode: String(page.pageCode),
            authRequired: Boolean(page.authRequired),
            configurable: Boolean(page.configurable),
          },
        ]),
    )

    const mergedPages = DEFAULT_WORKSPACE_ACCESS_POLICY.map((defaultPage) => ({
      ...defaultPage,
      ...(normalizedByCode.get(defaultPage.pageCode) || {}),
    }))

    for (const page of incomingPages) {
      const pageCode = String(page?.pageCode || '')
      if (!pageCode || mergedPages.some((existing) => existing.pageCode === pageCode)) {
        continue
      }
      mergedPages.push({
        pageCode,
        authRequired: Boolean(page.authRequired),
        configurable: Boolean(page.configurable),
      })
    }

    return mergedPages
  }

  function applyWorkspaceAccessPolicy(response) {
    workspaceAccessPolicy.value = normalizeWorkspaceAccessPolicy(response?.pages)
    workspaceAccessLoaded.value = true
  }

  async function ensureWorkspaceAccessPolicy(force = false) {
    if ((workspaceAccessLoaded.value && !force) || workspaceAccessLoading.value) {
      return workspaceAccessPolicy.value
    }

    workspaceAccessLoading.value = true
    try {
      const response = await api.workspace.getAccessPolicy()
      applyWorkspaceAccessPolicy(response)
    } catch {
      workspaceAccessPolicy.value = normalizeWorkspaceAccessPolicy()
      workspaceAccessLoaded.value = true
    } finally {
      workspaceAccessLoading.value = false
    }

    return workspaceAccessPolicy.value
  }

  async function updateWorkspaceAccessPolicy(payload) {
    const response = await api.workspace.updateAccessPolicy(payload)
    applyWorkspaceAccessPolicy(response)
    return response
  }

  async function refreshCurrentUser() {
    currentUser.value = await api.auth.me()
    return currentUser.value
  }

  async function changePassword(payload) {
    await api.auth.changePassword(payload)
  }

  function hasAnyRole(roles = []) {
    if (!roles.length) {
      return true
    }
    return roles.includes(role.value)
  }

  function getWorkspacePagePolicy(pageCode) {
    return workspaceAccessPolicy.value.find((page) => page.pageCode === pageCode) || null
  }

  function isWorkspacePageLoginRequired(pageCode) {
    const policy = getWorkspacePagePolicy(pageCode)
    return policy ? Boolean(policy.authRequired) : true
  }

  function canAccessWorkspacePage(pageCode) {
    return !isWorkspacePageLoginRequired(pageCode) || isAuthenticated.value
  }

  function canEditTeam(teamId) {
    if (isAdmin.value) {
      return true
    }
    if (!isEditor.value) {
      return false
    }
    return (currentUser.value?.editableTeamIds || []).includes(String(teamId))
  }

  return {
    currentUser,
    workspaceUser,
    initialized,
    loading,
    isAuthenticated,
    role,
    isAdmin,
    isEditor,
    isReadonly,
    canManageAccounts,
    canWriteWorkspace,
    workspaceAccessPolicy,
    workspaceAccessLoaded,
    initSession,
    login,
    activate,
    logout,
    refreshCurrentUser,
    changePassword,
    clearSession,
    ensureWorkspaceAccessPolicy,
    updateWorkspaceAccessPolicy,
    hasAnyRole,
    isWorkspacePageLoginRequired,
    canAccessWorkspacePage,
    canEditTeam,
  }
})
