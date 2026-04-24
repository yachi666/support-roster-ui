export const ACCESS_POLICY_PAGES = Object.freeze([
  {
    pageCode: 'overview',
    labelKey: 'workspace.nav.overview',
    route: '/workspace/overview',
    authRequired: false,
    configurable: true,
    includeInWorkspaceNavigation: true,
  },
  {
    pageCode: 'roster',
    labelKey: 'workspace.nav.roster',
    route: '/workspace/roster',
    authRequired: false,
    configurable: true,
    includeInWorkspaceNavigation: true,
  },
  {
    pageCode: 'staff',
    labelKey: 'workspace.nav.staff',
    route: '/workspace/staff',
    authRequired: false,
    configurable: true,
    includeInWorkspaceNavigation: true,
  },
  {
    pageCode: 'shifts',
    labelKey: 'workspace.nav.shifts',
    route: '/workspace/shifts',
    authRequired: false,
    configurable: true,
    includeInWorkspaceNavigation: true,
  },
  {
    pageCode: 'teams',
    labelKey: 'workspace.nav.teams',
    route: '/workspace/teams',
    authRequired: false,
    configurable: true,
    includeInWorkspaceNavigation: true,
  },
  {
    pageCode: 'accounts',
    labelKey: 'workspace.nav.accounts',
    route: '/workspace/accounts',
    authRequired: true,
    configurable: false,
    includeInWorkspaceNavigation: true,
  },
  {
    pageCode: 'import-export',
    labelKey: 'workspace.nav.importExport',
    route: '/workspace/import-export',
    authRequired: false,
    configurable: true,
    includeInWorkspaceNavigation: true,
  },
  {
    pageCode: 'validation',
    labelKey: 'workspace.nav.validation',
    route: '/workspace/validation',
    authRequired: false,
    configurable: true,
    includeInWorkspaceNavigation: true,
  },
  {
    pageCode: 'linux-passwords',
    labelKey: 'linuxPasswords.entryLabel',
    route: '/linux-passwords',
    authRequired: true,
    configurable: true,
    includeInWorkspaceNavigation: false,
  },
])

export function getAccessPolicyPageDefinition(pageCode) {
  return ACCESS_POLICY_PAGES.find((page) => page.pageCode === pageCode) || null
}

export function buildDefaultWorkspaceAccessPolicy() {
  return ACCESS_POLICY_PAGES.map(({ pageCode, authRequired, configurable }) => ({
    pageCode,
    authRequired,
    configurable,
  }))
}
