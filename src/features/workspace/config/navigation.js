export const workspaceNavigation = [
  { pageCode: 'overview', labelKey: 'workspace.nav.overview', to: '/workspace', icon: 'LayoutDashboard' },
  { pageCode: 'roster', labelKey: 'workspace.nav.roster', to: '/workspace/roster', icon: 'CalendarDays' },
  { pageCode: 'staff', labelKey: 'workspace.nav.staff', to: '/workspace/staff', icon: 'Users' },
  { pageCode: 'shifts', labelKey: 'workspace.nav.shifts', to: '/workspace/shifts', icon: 'Clock3' },
  { pageCode: 'teams', labelKey: 'workspace.nav.teams', to: '/workspace/teams', icon: 'Network' },
  { pageCode: 'accounts', labelKey: 'workspace.nav.accounts', to: '/workspace/accounts', icon: 'Users', roles: ['admin'] },
  { pageCode: 'import-export', labelKey: 'workspace.nav.importExport', to: '/workspace/import-export', icon: 'UploadCloud' },
  { pageCode: 'validation', labelKey: 'workspace.nav.validation', to: '/workspace/validation', icon: 'AlertTriangle' },
]

export function getWorkspaceQuickActionTarget(actionKey) {
  const normalizedKey = (actionKey || '').trim().toLowerCase()

  if (!normalizedKey) {
    return '/workspace'
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

  return '/workspace'
}
