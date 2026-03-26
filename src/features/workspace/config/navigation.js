export const WORKSPACE_ENTRY_PATH = '/workspace'
export const WORKSPACE_OVERVIEW_PATH = '/workspace/overview'

export const workspaceNavigation = [
  { pageCode: 'overview', labelKey: 'workspace.nav.overview', to: WORKSPACE_OVERVIEW_PATH, icon: 'LayoutDashboard' },
  { pageCode: 'roster', labelKey: 'workspace.nav.roster', to: '/workspace/roster', icon: 'CalendarDays' },
  { pageCode: 'staff', labelKey: 'workspace.nav.staff', to: '/workspace/staff', icon: 'Users' },
  { pageCode: 'shifts', labelKey: 'workspace.nav.shifts', to: '/workspace/shifts', icon: 'Clock3' },
  { pageCode: 'teams', labelKey: 'workspace.nav.teams', to: '/workspace/teams', icon: 'Network', roles: ['admin'] },
  { pageCode: 'accounts', labelKey: 'workspace.nav.accounts', to: '/workspace/accounts', icon: 'Users', roles: ['admin'] },
  { pageCode: 'import-export', labelKey: 'workspace.nav.importExport', to: '/workspace/import-export', icon: 'UploadCloud' },
  { pageCode: 'validation', labelKey: 'workspace.nav.validation', to: '/workspace/validation', icon: 'AlertTriangle' },
]

export function getWorkspacePathname(path) {
  if (typeof path !== 'string') {
    return ''
  }

  return path.split(/[?#]/, 1)[0] || ''
}

export function isWorkspacePath(path) {
  const pathname = getWorkspacePathname(path)
  return pathname === WORKSPACE_ENTRY_PATH || pathname.startsWith(`${WORKSPACE_ENTRY_PATH}/`)
}

export function resolveDefaultWorkspacePath(authStore) {
  const firstAccessibleItem = workspaceNavigation.find((item) =>
    authStore.canAccessWorkspacePage(item.pageCode)
    && (!item.roles || authStore.hasAnyRole(item.roles)))

  return firstAccessibleItem?.to || null
}

export function getWorkspaceQuickActionTarget(actionKey) {
  const normalizedKey = (actionKey || '').trim().toLowerCase()

  if (!normalizedKey) {
    return WORKSPACE_OVERVIEW_PATH
  }

  if (normalizedKey.includes('validation') || normalizedKey.includes('issue')) {
    return '/workspace/validation'
  }

  if (normalizedKey.includes('import') || normalizedKey.includes('export')) {
    return '/workspace/import-export'
  }

  if (normalizedKey.includes('roster')) {
    return '/workspace/roster'
  }

  if (normalizedKey.includes('staff')) {
    return '/workspace/staff'
  }

  return WORKSPACE_OVERVIEW_PATH
}
