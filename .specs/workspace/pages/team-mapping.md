# Team Mapping Page

## Purpose

Explain and control how role groups are bundled into public-facing teams.

## Behavior

- Team cards expose order and visibility affordances
- Hidden teams remain visible in admin UI but are marked as excluded from downstream views
- Right-side preview gives a compact read-only representation of the public dashboard grouping
- Team groups can now be created, edited, and deleted from a drawer form that also controls assigned role groups
- The team drawer shows field-level validation feedback for code, name, color, order, description, and role-group selection when save fails validation
- Delete uses an explicit confirmation panel inside the drawer before the DELETE request is sent

## Data Source

- `/api/workspace/teams`
- Team cards render embedded role group names and backend-managed team colors/order
- Role group selection for create/edit is sourced from `/api/workspace/role-groups`
