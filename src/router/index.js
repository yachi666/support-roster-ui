import { createRouter, createWebHistory } from 'vue-router'
import { h } from 'vue'
import { useAuthStore } from '@/stores/auth'
import PublicDashboardPage from '@/pages/PublicDashboardPage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import WorkspaceLayout from '@/features/workspace/layout/WorkspaceLayout.vue'
import OverviewDashboardPage from '@/features/workspace/pages/OverviewDashboardPage.vue'
import MonthlyRosterPlannerPage from '@/features/workspace/pages/MonthlyRosterPlannerPage.vue'
import StaffDirectoryPage from '@/features/workspace/pages/StaffDirectoryPage.vue'
import ShiftDefinitionsPage from '@/features/workspace/pages/ShiftDefinitionsPage.vue'
import TeamMappingPage from '@/features/workspace/pages/TeamMappingPage.vue'
import ImportExportCenterPage from '@/features/workspace/pages/ImportExportCenterPage.vue'
import ValidationCenterPage from '@/features/workspace/pages/ValidationCenterPage.vue'
import AccountManagementPage from '@/features/workspace/pages/AccountManagementPage.vue'

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
      path: '/workspace',
      component: WorkspaceLayout,
      children: [
        {
          path: '',
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
          meta: { workspacePageCode: 'teams' },
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
    return typeof to.query.redirect === 'string' ? to.query.redirect : '/workspace'
  }

  const workspacePageCode = [...to.matched]
    .reverse()
    .map((record) => record.meta?.workspacePageCode)
    .find((pageCode) => typeof pageCode === 'string')

  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth)
    || (workspacePageCode ? authStore.isWorkspacePageLoginRequired(workspacePageCode) : false)
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
    return '/workspace'
  }

  return true
})

export default router
