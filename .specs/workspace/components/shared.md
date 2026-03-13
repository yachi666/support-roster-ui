# Shared Components

## `WorkspacePageHeader.vue`

Responsibility:

- Render page title/description
- Expose an `actions` slot for page-level controls

## `WorkspaceSurface.vue`

Responsibility:

- Provide a consistent bordered card surface
- Support `white` and `muted` surface tones

## `WorkspaceDrawer.vue`

Responsibility:

- Provide overlay + slide-in panel behavior
- Standardize title area and footer action slot
- Serve staff profile and roster assignment use cases

## `OverviewStatCard.vue`

Responsibility:

- Render dashboard KPI cards with status icon and progress strip

## Roster-specific shared pieces

- `RosterGrid.vue`: sticky grid + cell selection
- `AssignmentDrawer.vue`: assignment editing form bound to current cell
