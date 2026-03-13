# Validation Center Page

## Purpose

Centralize roster issues so admins can inspect severity and prepare bulk resolution.

## Behavior

- Search filters issue rows by type, description, team, and date
- Row selection is local UI state, but bulk and per-row fixes submit the selected issue IDs to the backend resolve endpoint
- Issue IDs are treated as strings end-to-end so import-backed issues with large IDs remain selectable and resolvable in the browser
- Header action button is enabled when at least one resolvable issue is selected
- Summary cards render the server-provided severity summary for the active month
- The page resolves month/year from the shared workspace period state used by Monthly Roster and Import / Export
- Successful resolve actions replace the visible issue list and severity counts from the API response instead of mutating rows optimistically
- Non-resolvable rows stay read-only and are labeled as manual-only actions

## Data Source

- `/api/workspace/validation?year=&month=`
- `/api/workspace/validation/resolve`
