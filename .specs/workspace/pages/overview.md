# Overview Page

## Purpose

Give admins a fast operational summary of roster health and recent activity.

## Sections

- KPI stat grid
- Recent activity feed
- Quick action panel

## Dependencies

- `OverviewStatCard.vue`
- `WorkspacePageHeader.vue`
- `WorkspaceSurface.vue`
- `api.workspace.getOverview()`
- `getWorkspaceQuickActionTarget()`

## Data Source

- KPI stats, activity feed, and quick actions all come from `/api/workspace/overview`
