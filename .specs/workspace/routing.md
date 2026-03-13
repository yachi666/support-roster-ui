# Workspace Routing

## Route Table

| Path | Component | Purpose |
| --- | --- | --- |
| `/` | redirect | Default entry redirected to admin workspace |
| `/viewer` | `src/pages/PublicDashboardPage.vue` | Existing public roster viewer |
| `/workspace` | `OverviewDashboardPage.vue` | Admin workspace landing page |
| `/workspace/roster` | `MonthlyRosterPlannerPage.vue` | Calendar-style schedule editing |
| `/workspace/staff` | `StaffDirectoryPage.vue` | Staff list and profile drawer |
| `/workspace/shifts` | `ShiftDefinitionsPage.vue` | Shift code catalog |
| `/workspace/teams` | `TeamMappingPage.vue` | Team ordering and visibility preview |
| `/workspace/import-export` | `ImportExportCenterPage.vue` | File import/export flow |
| `/workspace/validation` | `ValidationCenterPage.vue` | Issue review and bulk selection |

## Why `/workspace`

The admin UI stays mounted under `/workspace`, but `/` now redirects there so it behaves as the default home entry.

This gives the project a clear split:

- Viewer surface for read-only roster consumption at `/viewer`
- Workspace surface for admin operations
