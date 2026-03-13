Design a desktop-first admin product called "Support Roster Admin Workspace" for a global technical support scheduling system.

Context:
The current product already has a read-only on-call dashboard that visualizes shifts across teams and time zones. The new system is an internal data-entry and roster-management workspace used to maintain the source data behind that dashboard.
The backend is based on Excel as the source of truth, with entities and APIs centered around:
- Shift Definitions
- Staff
- Staff Shifts (day1-day31 monthly schedule)
- Team and Role Group mapping
The system supports multiple teams such as L1, AP L2, EMEA L2, MDP L2, AP L3, Incident Manager, and DevOps.
The existing business model includes time zone handling, cross-day shifts, and primary-vs-secondary shift semantics.
There is no current frontend admin system. This design should reverse-engineer the best admin experience from the existing read-only roster viewer.

Goal:
Create a lightweight collaboration-style enterprise admin interface for roster data entry, validation, and Excel import/export. This is not a dark dashboard, not a generic CRUD template, and not a spreadsheet clone only. It should feel like a purpose-built scheduling workspace.

Primary users:
- Super Admin: can manage all teams, staff, shift definitions, imports, exports, validation
- Team Admin: can manage only their own team roster and related staff

Design direction:
- Tone: lightweight collaboration tool, calm and productive, high clarity, modern but not flashy
- Desktop first: optimize for 1440px wide enterprise use, with sensible tablet adaptation but desktop is the priority
- Visual language: warm light surfaces, structured panels, subtle editorial feel, not purple-biased, not default SaaS blue-on-white
- Use expressive typography such as Manrope or IBM Plex Sans paired with IBM Plex Mono for codes, dates, and schedule cells
- Use intentional color coding for team labels and shift states, but keep brand surfaces neutral
- Include meaningful motion ideas such as staggered panel reveal, drawer slide-in, and validation highlight pulses
- Use auto layout, reusable components, variants, design tokens, and responsive constraints

Create the following frames/screens in one cohesive product system:

1. Overview dashboard
- A calm landing page for roster admins
- Show monthly completion progress, unresolved validation issues, teams with missing primary shifts, recent imports/exports, recent edits, and quick actions
- Include summary cards, validation widgets, and a compact activity feed
- Make it feel operational but not overwhelming

2. Monthly Roster Planner
- This is the hero screen and should be the most detailed frame
- Layout:
  - top toolbar with month switcher, timezone, team filter, search, role scope, import/export actions
  - left sticky staff/team column
  - right monthly grid for day1-day31
  - bottom or side summary for validation and unsaved changes
- Each row is a staff member grouped by team
- Each cell displays a shift code such as OC, DS, NS, A, B, D, C, BH, HoL
- Support bulk actions like fill range, copy previous week, assign template, clear range
- Include inline status cues for invalid cells, cross-day shifts, leave, primary shifts, and missing coverage
- Add a smart side drawer for editing one staff member or one selected date range
- Show how team admins would only see editable rows inside their scope

3. Staff Directory
- Clean staff management page
- Table + profile detail panel
- Fields include name, staff_id, role_group, region, contact, notes, timezone, active status
- Show team association and roster participation
- Add quick actions for add staff, archive, reassign team, view monthly shifts

4. Shift Definitions
- Table-based editor for shift code definitions
- Fields include role_group, code, meaning, start_time, end_time, timezone, show_on_roster_page, remark
- Emphasize distinction between primary and non-primary shifts
- Include compact timeline previews of shift duration
- Support validation badges for conflicts or invalid times

5. Team and Role Group Mapping
- A structured mapping page showing teams, role groups, colors, ordering, and display rules
- Make relationships easy to scan
- Include examples of how a role group maps into the read-only dashboard

6. Import / Export Center
- A workflow page or modal system for Excel import/export
- Show upload dropzone, file status, parsed preview, field mapping confidence, errors, rollback state, and export actions
- Include a compare-before-apply view
- Make the workflow trustworthy and operational

7. Validation Center
- A focused issue resolution page
- Show problems grouped by severity:
  - invalid shift code
  - missing primary coverage
  - overlapping assignments
  - missing staff metadata
  - time zone ambiguity
- Include filters, batch resolve patterns, and jump-to-edit actions

Key UX patterns to include:
- persistent unsaved changes bar
- side drawers instead of too many full-page forms
- sticky headers and sticky row labels for large schedule grids
- command-like quick edit interactions
- filters as chips, not only dropdowns
- soft warnings and strong errors with clear hierarchy
- audit-friendly status labels such as Draft, Needs Review, Ready to Export, Exported
- a clear distinction between editable admin data and read-only downstream impact

Important content and data behavior:
- The monthly roster is the operational center
- Shift definitions feed roster cell options
- Staff records feed roster rows
- Team and role group mapping control grouping and downstream display logic
- Excel import/export is core, not an afterthought
- Show cross-timezone context and cross-day shifts in a practical way
- Reflect that the existing public roster dashboard is driven by this admin data

Design system requirements:
- Build reusable components for:
  - top app header
  - team switcher
  - month picker
  - schedule grid cell
  - validation badge
  - status chip
  - import status row
  - side drawer form
  - activity item
- Define tokens for:
  - neutral surfaces
  - semantic statuses
  - team colors
  - spacing
  - radius
  - shadows
  - typography
- Prefer warm neutrals, slate ink, muted teal, rust orange, moss green, and signal red
- Avoid generic purple-heavy UI
- Use mono typography selectively for date labels, shift codes, and time fields

Accessibility and production realism:
- Use clear color contrast
- Large data tables must stay legible
- Design should feel buildable in Vue 3 + Tailwind
- Use practical enterprise spacing and interaction patterns
- Avoid overly conceptual artwork
- Use real labels and realistic data density

Output expectations:
- Create a polished multi-screen admin design system
- Emphasize Monthly Roster Planner as the main frame
- Show component consistency across screens
- Include annotations or obvious zones for bulk edit, validation, and import/export workflows
- Make the product feel like a credible internal tool for support operations teams