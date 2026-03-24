export const workspaceNavigation = [
  { labelKey: 'workspace.nav.overview', to: '/workspace', icon: 'LayoutDashboard' },
  { labelKey: 'workspace.nav.roster', to: '/workspace/roster', icon: 'CalendarDays' },
  { labelKey: 'workspace.nav.staff', to: '/workspace/staff', icon: 'Users' },
  { labelKey: 'workspace.nav.shifts', to: '/workspace/shifts', icon: 'Clock3' },
  { labelKey: 'workspace.nav.teams', to: '/workspace/teams', icon: 'Network', roles: ['admin'] },
  { labelKey: 'workspace.nav.accounts', to: '/workspace/accounts', icon: 'Users', roles: ['admin'] },
  { labelKey: 'workspace.nav.importExport', to: '/workspace/import-export', icon: 'UploadCloud' },
  { labelKey: 'workspace.nav.validation', to: '/workspace/validation', icon: 'AlertTriangle' },
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
