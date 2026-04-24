# Viewer Teams Icon Replacement Design

## Problem

The viewer employee tooltip currently exposes Microsoft Teams contact as a full-width text button. The requested behavior is to replace that existing Teams contact control with the provided Teams PNG icon while preserving the current click behavior that opens a Teams chat for the employee.

## Approach

Use the provided PNG as a local frontend asset and replace only the Teams-specific call-to-action inside the viewer tooltip in `src/components/Timeline.vue`.

## Scope

- Add the provided Teams icon image to the frontend project as a static asset.
- Replace the current text-based Teams button in the employee tooltip with an icon-based button.
- Preserve the existing Teams chat URL generation and external-link behavior.
- Preserve accessibility with an explicit label/title on the icon button.
- Keep the rest of the employee contact details (email, phone, Slack) unchanged.

## Component Boundaries

- `src/components/Timeline.vue`: continues to render the employee tooltip and remains the only component that changes behavior/UI for this task.
- `src/lib/microsoftTeams.js`: remains unchanged and continues to build the Teams chat URL from the contact email.
- Static asset: new Teams PNG added under the frontend app for direct use by the tooltip action.

## UI Design

- Replace the current highlighted Teams action block with a compact icon action.
- The icon button should visually read as the Teams contact affordance without additional button copy.
- The control should keep hover, focus-visible, and pointer feedback so it still behaves like an interactive action.
- The email line remains available as a separate contact row below the icon action.

## Data Flow

- Tooltip receives shift contact data from the existing `layoutShift.shift.contact` object.
- The Teams button continues to derive its `href` from `getMicrosoftTeamsUrl(layoutShift.shift)`.
- No API, store, routing, or state-management changes are required.

## Error Handling

- If no Teams URL can be built from the shift email, the icon action should not render, matching the current behavior.
- No silent fallback icon generation or alternative Teams destination should be introduced.

## Testing

- Add or update a focused UI test around the tooltip rendering so the Teams contact action is asserted as an icon link instead of the previous text block.
- Keep the existing Teams URL unit tests as-is unless a behavior change requires additional coverage.
