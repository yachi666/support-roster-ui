# Shift Definitions Page

## Purpose

Document available shift codes, the teams that share them, and surface their preview timeline, primary status, and visibility.

## Behavior

- Search matches code, meaning, and shared team names
- A single shift definition can be shared by multiple teams; the table renders all associated teams as compact badges
- Timeline preview is rendered as a compact bar derived from `startTime`, `endTime`, and `colorHex`
- Primary/Secondary and visibility are displayed as compact status tokens
- New and existing shift definitions are maintained through a drawer form that persists via POST / PUT / DELETE
- The drawer uses multi-select team checkboxes instead of a single-team select
- Start Time and End Time are selected from 30-minute options, with quick duration presets and a live summary that marks next-day endings
- The drawer renders field-level validation feedback, including backend-derived errors mapped onto team selection, code, time, timezone, and color inputs
- Delete uses an explicit confirmation panel inside the drawer before the DELETE request is sent

## Data Source

- `/api/workspace/shift-definitions`
- `/api/workspace/teams`
