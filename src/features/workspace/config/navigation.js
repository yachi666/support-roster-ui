export const workspaceNavigation = [
  { label: 'Overview', to: '/workspace', icon: 'LayoutDashboard' },
  { label: 'Monthly Roster', to: '/workspace/roster', icon: 'CalendarDays' },
  { label: 'Staff Directory', to: '/workspace/staff', icon: 'Users' },
  { label: 'Shift Definitions', to: '/workspace/shifts', icon: 'Clock3' },
  { label: 'Team Mapping', to: '/workspace/teams', icon: 'Network' },
  { label: 'Import / Export', to: '/workspace/import-export', icon: 'UploadCloud' },
  { label: 'Validation', to: '/workspace/validation', icon: 'AlertTriangle' },
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