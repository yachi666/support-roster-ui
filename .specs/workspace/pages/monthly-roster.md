# Monthly Roster Page

## Purpose

Present the generated roster as a dense monthly matrix and allow assignment editing from a side drawer.

## Split Strategy

- `MonthlyRosterPlannerPage.vue`: toolbar and save banner composition
- `useRosterPlanner.js`: grid state, selection, mutable schedule updates
- `RosterGrid.vue`: sticky team/staff matrix and shift cells
- `AssignmentDrawer.vue`: current selection form and warning presentation

## Current Behavior

- Selecting a cell opens the assignment drawer
- Applying a code mutates the in-memory working copy and tracks pending cell updates locally
- Month switching refetches `/api/workspace/roster?year=&month=` using the shared workspace month context from the admin shell
- Save posts pending updates to `/api/workspace/roster/save` and rehydrates the grid from the server response
- Roster row IDs and save payload `staffId` values are transported as strings so newly created staff with Snowflake-style IDs can be saved without browser precision loss
- Discard restores the last server snapshot for the active month
- Validation warnings shown in the drawer come from the current roster payload's `validationWarning`
