# Shift Definitions Page

## Purpose

Document available shift codes and surface their preview timeline, primary status, and visibility.

## Behavior

- Search matches code, meaning, and role group text
- Timeline preview is rendered as a compact bar derived from `startTime`, `endTime`, and `colorHex`
- Primary/Secondary and visibility are displayed as compact status tokens
- New and existing shift definitions are maintained through a drawer form that persists via POST / PUT / DELETE
- The drawer renders field-level validation feedback, including backend-derived errors mapped onto role group, code, time, timezone, and color inputs
- Delete uses an explicit confirmation panel inside the drawer before the DELETE request is sent

## Data Source

- `/api/workspace/shift-definitions`
- Role group choices are loaded from `/api/workspace/role-groups`
