import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/api'
import { clearAuthToken, getAuthToken, setAuthToken } from '@/lib/authToken'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null)
  const initialized = ref(false)
  const loading = ref(false)

  const isAuthenticated = computed(() => Boolean(currentUser.value && getAuthToken()))
  const role = computed(() => currentUser.value?.role || '')
  const isAdmin = computed(() => role.value === 'admin')
  const isEditor = computed(() => role.value === 'editor')
  const isReadonly = computed(() => role.value === 'readonly')
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

  async function logout() {
    if (getAuthToken()) {
      try {
        await api.auth.logout()
      } catch {
      }
    }
    clearSession()
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
    initialized,
    loading,
    isAuthenticated,
    role,
    isAdmin,
    isEditor,
    isReadonly,
    canManageAccounts,
    canWriteWorkspace,
    initSession,
    login,
    logout,
    refreshCurrentUser,
    changePassword,
    clearSession,
    hasAnyRole,
    canEditTeam,
  }
})
