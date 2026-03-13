# Workspace Architecture

## Feature Root

```
src/features/workspace/
├── config/
│   └── navigation.js
├── components/
│   ├── WorkspaceDrawer.vue
│   ├── WorkspacePageHeader.vue
│   ├── WorkspaceSidebar.vue
│   ├── WorkspaceSurface.vue
│   ├── WorkspaceTopbar.vue
│   ├── OverviewStatCard.vue
│   └── roster/
│       ├── AssignmentDrawer.vue
│       └── RosterGrid.vue
├── composables/
│   └── useRosterPlanner.js
├── layout/
│   └── WorkspaceLayout.vue
├── lib/
│   └── period.js
└── pages/
    ├── ImportExportCenterPage.vue
    ├── MonthlyRosterPlannerPage.vue
    ├── OverviewDashboardPage.vue
    ├── ShiftDefinitionsPage.vue
    ├── StaffDirectoryPage.vue
    ├── TeamMappingPage.vue
    └── ValidationCenterPage.vue
```

## Design Decisions

- `layout/WorkspaceLayout.vue` owns the sidebar/topbar shell only.
- Each route page owns page-level orchestration and presentation composition.
- Shared workspace request methods live in `src/api/index.js` under `api.workspace`.
- `config/navigation.js` keeps non-domain UI navigation metadata separate from API data.
- `useRosterPlanner.js` isolates roster period switching, local edit tracking, and `/api/workspace/roster` load/save interactions.

## Integration Boundary

The workspace is integrated into the existing Vue app rather than shipped as a second Vite app.

- App root switched from hard-coded `Dashboard.vue` to `RouterView`
- Existing public dashboard was wrapped in `src/pages/PublicDashboardPage.vue` and moved to `/viewer`
- Admin workspace was added as a nested route tree under `/workspace`
- Root `/` now redirects to `/workspace` so the admin surface is the default landing page
- Workspace route pages read and mutate data through `/api/workspace/**` instead of local mock datasets
