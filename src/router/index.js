import { createRouter, createWebHistory } from 'vue-router'
import { h } from 'vue'
import PublicDashboardPage from '@/pages/PublicDashboardPage.vue'
import WorkspaceLayout from '@/features/workspace/layout/WorkspaceLayout.vue'
import OverviewDashboardPage from '@/features/workspace/pages/OverviewDashboardPage.vue'
import MonthlyRosterPlannerPage from '@/features/workspace/pages/MonthlyRosterPlannerPage.vue'
import StaffDirectoryPage from '@/features/workspace/pages/StaffDirectoryPage.vue'
import ShiftDefinitionsPage from '@/features/workspace/pages/ShiftDefinitionsPage.vue'
import TeamMappingPage from '@/features/workspace/pages/TeamMappingPage.vue'
import ImportExportCenterPage from '@/features/workspace/pages/ImportExportCenterPage.vue'
import ValidationCenterPage from '@/features/workspace/pages/ValidationCenterPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: { render: () => h('div') },
      redirect: '/workspace',
    },
    {
      path: '/viewer',
      name: 'viewer',
      component: PublicDashboardPage,
    },
    {
      path: '/workspace',
      component: WorkspaceLayout,
      children: [
        {
          path: '',
          name: 'workspace-overview',
          component: OverviewDashboardPage,
        },
        {
          path: 'roster',
          name: 'workspace-roster',
          component: MonthlyRosterPlannerPage,
        },
        {
          path: 'staff',
          name: 'workspace-staff',
          component: StaffDirectoryPage,
        },
        {
          path: 'shifts',
          name: 'workspace-shifts',
          component: ShiftDefinitionsPage,
        },
        {
          path: 'teams',
          name: 'workspace-teams',
          component: TeamMappingPage,
        },
        {
          path: 'import-export',
          name: 'workspace-import-export',
          component: ImportExportCenterPage,
        },
        {
          path: 'validation',
          name: 'workspace-validation',
          component: ValidationCenterPage,
        },
      ],
    },
  ],
})

export default router
