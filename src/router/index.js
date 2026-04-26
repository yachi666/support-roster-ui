import { createRouter, createWebHistory } from 'vue-router'
import { h } from 'vue'
import { useAuthStore } from '@/stores/auth'
import PublicDashboardPage from '@/pages/PublicDashboardPage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import ContactInformationLayout from '@/features/contact-information/layout/ContactInformationLayout.vue'
import SupportTeamContactsPage from '@/features/contact-information/pages/SupportTeamContactsPage.vue'
import SupportTeamContactCreatePage from '@/features/contact-information/pages/SupportTeamContactCreatePage.vue'
import WorkspaceLayout from '@/features/workspace/layout/WorkspaceLayout.vue'
import LinuxPasswordsPage from '@/features/linux-passwords/pages/LinuxPasswordsPage.vue'
import OverviewDashboardPage from '@/features/workspace/pages/OverviewDashboardPage.vue'
import MonthlyRosterPlannerPage from '@/features/workspace/pages/MonthlyRosterPlannerPage.vue'
import StaffDirectoryPage from '@/features/workspace/pages/StaffDirectoryPage.vue'
import ShiftDefinitionsPage from '@/features/workspace/pages/ShiftDefinitionsPage.vue'
import TeamMappingPage from '@/features/workspace/pages/TeamMappingPage.vue'
import ImportExportCenterPage from '@/features/workspace/pages/ImportExportCenterPage.vue'
import ValidationCenterPage from '@/features/workspace/pages/ValidationCenterPage.vue'
import AccountManagementPage from '@/features/workspace/pages/AccountManagementPage.vue'
import {
  WORKSPACE_ENTRY_PATH,
  resolveDefaultWorkspacePath,
  resolveSafeAppRedirectPath,
} from '@/features/workspace/config/navigation'

function resolveWorkspaceRouteLocation(targetPath, requestedRoute) {
  return {
    path: targetPath,
    query: requestedRoute?.query || {},
    hash: requestedRoute?.hash || '',
  }
}

function resolveWorkspaceEntryLocation(authStore, requestedRoute) {
  const targetPath = resolveDefaultWorkspacePath(authStore)
  if (targetPath) {
    return resolveWorkspaceRouteLocation(targetPath, requestedRoute)
  }

  return authStore.isAuthenticated
    ? '/viewer'
    : {
        path: '/login',
        query: { redirect: requestedRoute?.fullPath || WORKSPACE_ENTRY_PATH },
      }
}

function resolveWorkspaceRedirectTarget(authStore, requestedPath) {
  return resolveSafeAppRedirectPath(requestedPath, resolveDefaultWorkspacePath(authStore) || '/viewer')
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: { render: () => h('div') },
      redirect: '/viewer',
    },
    {
      path: '/viewer',
      name: 'viewer',
      component: PublicDashboardPage,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: { guestOnly: true },
    },
    {
      path: '/contact-information',
      component: ContactInformationLayout,
      children: [
        {
          path: '',
          name: 'contact-information',
          component: SupportTeamContactsPage,
        },
        {
          path: 'add',
          name: 'contact-information-add',
          component: SupportTeamContactCreatePage,
        },
      ],
    },
    {
      path: '/linux-passwords',
      name: 'linux-passwords',
      component: LinuxPasswordsPage,
      meta: { protectedPageCode: 'linux-passwords' },
    },
    {
      path: WORKSPACE_ENTRY_PATH,
      component: WorkspaceLayout,
      children: [
        {
          path: '',
          name: 'workspace-entry',
          component: { render: () => h('div') },
          beforeEnter: (to) => resolveWorkspaceEntryLocation(useAuthStore(), to),
        },
        {
          path: 'overview',
          name: 'workspace-overview',
          component: OverviewDashboardPage,
          meta: { workspacePageCode: 'overview' },
        },
        {
          path: 'roster',
          name: 'workspace-roster',
          component: MonthlyRosterPlannerPage,
          meta: { workspacePageCode: 'roster' },
        },
        {
          path: 'staff',
          name: 'workspace-staff',
          component: StaffDirectoryPage,
          meta: { workspacePageCode: 'staff' },
        },
        {
          path: 'shifts',
          name: 'workspace-shifts',
          component: ShiftDefinitionsPage,
          meta: { workspacePageCode: 'shifts' },
        },
        {
          path: 'teams',
          name: 'workspace-teams',
          component: TeamMappingPage,
          meta: { workspacePageCode: 'teams', requiresAuth: true, roles: ['admin'] },
        },
        {
          path: 'import-export',
          name: 'workspace-import-export',
          component: ImportExportCenterPage,
          meta: { workspacePageCode: 'import-export' },
        },
        {
          path: 'validation',
          name: 'workspace-validation',
          component: ValidationCenterPage,
          meta: { workspacePageCode: 'validation' },
        },
        {
          path: 'accounts',
          name: 'workspace-accounts',
          component: AccountManagementPage,
          meta: { workspacePageCode: 'accounts', requiresAuth: true, roles: ['admin'] },
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (!authStore.initialized) {
    await authStore.initSession()
  }

  if (!authStore.workspaceAccessLoaded) {
    await authStore.ensureWorkspaceAccessPolicy()
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return resolveWorkspaceRedirectTarget(authStore, to.query.redirect)
  }

  const protectedPageCode = [...to.matched]
    .reverse()
    .map((record) => record.meta?.protectedPageCode || record.meta?.workspacePageCode)
    .find((pageCode) => typeof pageCode === 'string')

  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth)
    || (protectedPageCode ? authStore.isProtectedPageLoginRequired(protectedPageCode) : false)
  if (!requiresAuth) {
    return true
  }

  if (!authStore.isAuthenticated) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }

  const requiredRoles = to.matched.flatMap((record) => record.meta?.roles || [])
  if (requiredRoles.length && !authStore.hasAnyRole(requiredRoles)) {
    return resolveWorkspaceEntryLocation(authStore, to)
  }

  return true
})

export default router
