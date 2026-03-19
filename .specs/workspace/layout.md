# Layout Shell

## Composition

`WorkspaceLayout.vue` composes three shell regions:

1. `WorkspaceSidebar.vue`
2. `WorkspaceTopbar.vue`
3. Nested `RouterView`

## Sidebar Rules

- Navigation items are sourced from `workspaceData.js`
- Active route highlighting is derived from `useRoute()`
- Validation badge count is displayed in navigation
- Account summary is pinned to the sidebar footer

## Topbar Rules

- Search is currently presentational and non-blocking
- Topbar owns the shared workspace month chooser, previous/next month controls, and global timezone selector for the admin shell
- Topbar does not expose a day-level date picker because workspace pages operate on monthly data only
- A persistent `Open Public Viewer` link in the topbar routes admins to `/viewer`
- Notification/help/settings actions are visual placeholders
- Toolbar stays fixed while page content scrolls

## Shared Period Context

- `useWorkspacePeriod.js` provides the single year/month source of truth for workspace pages that operate on monthly data.
- Workspace period state no longer tracks a separate day selection in the shell.
- Monthly Roster, Validation Center, Import / Export, and sidebar validation counts all react to the same selected workspace month.

## Visual Direction

The workspace intentionally differs from the legacy viewer:

- Manrope for UI copy
- IBM Plex Mono for tabular/date code fragments
- light neutral surfaces with teal actions
- compact control density for admin workflows
