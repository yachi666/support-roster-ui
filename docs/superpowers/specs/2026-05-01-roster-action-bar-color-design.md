# Roster Action Bar Color And Tooltip Reuse Design

## Problem

The monthly roster action bar now supports direct editing, but its shift buttons are visually flatter than the roster grid itself. Users want the action bar to expose the same shift colors and the same hover details already available on roster cells, so recognition stays instant and the editing surface feels like part of the same system.

## Approved Direction

Use the **same team-aware shift presentation** for both the roster grid and the top action bar.

- Each shift button in `RosterSelectionActionBar.vue` uses the same color treatment as the matching roster cell chip.
- Hover and focus on a shift button reuse the same tooltip information and visual treatment already used in `RosterGrid.vue`.
- `Clear` remains neutral and action-like; it does not pretend to be a normal shift option and does not show shift metadata.
- The action bar stays minimal: no selected staff text, no date text, no range hint, no extra helper copy.

## UX Rules

### Button appearance

- Shift buttons should render as colored chips, not neutral text buttons.
- Chip background, border, and text color must come from the same team-scoped shift presentation currently used by roster cells.
- If a shift has no team-specific presentation but does have a fallback code color, the action bar should use the same fallback style as the grid.
- `Clear` stays visually neutral so it reads as a destructive/reset action rather than a shift type.

### Tooltip behavior

- Hovering or keyboard-focusing a shift button shows the same metadata structure as the roster cell tooltip:
  - shift code
  - shift name / label when available
  - time window when available
  - timezone / cross-day context when present in the existing grid presentation
- Tooltip visual language should remain aligned with the grid tooltip so the user does not have to learn a second hover model.
- Tooltip content should be lazily mounted only for the active hovered/focused action-bar button.

### Readonly behavior

- Readonly users should still see colored buttons and hover metadata for recognition.
- Readonly buttons remain disabled for click interaction.
- The disabled state must not suppress passive reading of shift information.

## Component And Data Flow

### `MonthlyRosterPlannerPage.vue`

Responsibility:

- Remains the composition surface for the page.
- Computes the currently active team context from the selected assignment.
- Passes `shiftCodeOptions` plus the team-aware shift presentation data needed by the action bar.

### `RosterSelectionActionBar.vue`

Responsibility:

- Renders colored shift chips and the neutral `Clear` action.
- Handles hover/focus tooltip triggering for those chips.
- Emits only the chosen shift code upward.

Non-responsibilities:

- Does not infer selected staff, selected dates, or range text.
- Does not own permission logic beyond rendering readonly/disabled state.
- Does not construct shift metadata on its own if the page/composable can provide a normalized presentation source.

### Shared presentation source

The color and tooltip data for the action bar should come from the same normalized shift presentation source the grid already uses, rather than duplicating style generation logic in a second component.

That shared presentation source should expose enough information for both surfaces:

- chip/cell color styling
- card/tooltip styling
- badge styling
- window label
- optional shift metadata

## Implementation Constraints

- Prefer extracting reusable presentation helpers over copying style-building logic from `RosterGrid.vue` into `RosterSelectionActionBar.vue`.
- Keep the action bar enhancement focused on **color reuse + tooltip reuse** only.
- Do not add new explanatory text, new selection banners, or new range-reset controls as part of this enhancement.
- Preserve the current minimal editing workflow and header-based save model.

## Testing Expectations

- Add/adjust source-level tests so the action bar is required to consume team-aware shift presentation, not neutral-only button styling.
- Add/adjust tests that confirm the tooltip structure is reused for shift buttons.
- Add/adjust tests that confirm `Clear` stays neutral and does not render shift metadata.
- Re-run the frontend verification flow (`node --test` and `npm run build`) after implementation.

## Scope

In scope:

- Colorized action-bar shift buttons
- Reused roster-style tooltip content and visuals
- Shared presentation plumbing between roster grid and action bar

Out of scope:

- New helper text in the action bar
- Range hint chips or explicit range-clear controls
- New batch-edit shortcuts
- Any change to save semantics
