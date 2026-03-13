# Staff Directory Page

## Purpose

Show roster participants in a searchable table and reveal profile details in a side drawer.

## Behavior

- Search matches name, email, team, role, and ID
- Row click opens a profile drawer
- Drawer presents contact and roster participation summary blocks
- Add Staff opens a form drawer for POST create
- Edit and Delete actions are available from the detail drawer and call the corresponding PUT / DELETE endpoints
- The create/edit drawer surfaces field-level validation errors for both client-side checks and mapped backend validation/business errors
- Delete uses an explicit confirmation panel inside the drawer instead of a second destructive click on the same button

## Data Source

- `/api/workspace/staff`
- Drawer details reuse the selected row payload returned by the staff API
- Create/update payloads follow the workspace staff upsert contract exposed by the backend workspace API
