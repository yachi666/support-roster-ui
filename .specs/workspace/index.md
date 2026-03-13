# Workspace Spec Index

## Scope

`support-roster-ui` now contains two front-end experiences:

- Admin workspace default entry at `/` via redirect to `/workspace`
- Public roster viewer at `/viewer`
- Admin workspace at `/workspace`

The admin workspace is ported from `figma-design-workspace` into the Vue application so it can share the existing build, router, and project conventions.

## Document Map

- [Architecture](./architecture.md)
- [Routing](./routing.md)
- [Layout Shell](./layout.md)
- [UI Design](./ui-design.md)
- [Shared Components](./components/shared.md)
- [Overview Page](./pages/overview.md)
- [Monthly Roster Page](./pages/monthly-roster.md)
- [Staff Directory Page](./pages/staff-directory.md)
- [Shift Definitions Page](./pages/shift-definitions.md)
- [Team Mapping Page](./pages/team-mapping.md)
- [Import / Export Page](./pages/import-export.md)
- [Validation Center Page](./pages/validation-center.md)

## Implementation Notes

- Vue Composition API is used throughout the workspace feature.
- Existing public viewer pages are preserved instead of being replaced.
- Workspace pages now load data from the shared API client in `src/api/index.js` via the `workspace` namespace.
- Workspace month selection is shared across the admin shell so Monthly Roster, Validation Center, Import / Export, and validation badge counts resolve against the same year/month context.
- The largest interactive page, Monthly Roster, is split into page, grid, drawer, and composable layers, with server-backed load/save behavior.
- Staff Directory, Shift Definitions, and Team Mapping each expose drawer-based create/edit/delete flows backed by the corresponding workspace POST/PUT/DELETE APIs.
- Workspace-specific visual language and admin density rules are documented under `ui-design.md` in this directory.
