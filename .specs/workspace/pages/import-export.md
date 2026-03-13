# Import / Export Page

## Purpose

Walk admins through roster file upload, validation, and apply flow.

## Behavior

- Idle state supports click and drag-drop affordances
- Upload preview posts Excel files to `/api/workspace/import-export/preview` with the shared workspace year/month attached in the form payload
- Success state shows server-returned record counts, validation issues, and apply CTA
- Apply action posts the preview batch id to `/api/workspace/import-export/{batchId}/apply`
- Export action downloads CSV from `/api/workspace/import-export/export`
- Export uses the backend-returned binary payload directly; the server emits UTF-8 BOM CSV plus charset metadata so Chinese names and notes remain readable in spreadsheet tools
- Changing the shared workspace month resets any in-progress import preview so the page stays aligned with the active roster context

## Import Template Example

The page displays an import template example section showing the expected Excel format:

### Template Structure

The import Excel file contains 3 sheets:

1. **Sheet 0: Shift Definitions** - Defines shift codes with time ranges
   - Columns: `role_group`, `code`, `meaning`, `start_time`, `end_time`, `timezone`, `show_on_roster_page`, `remark`

2. **Sheet 1: Staff Shifts** - Staff daily shift assignments
   - Columns: `name`, `staff_id`, `role_group`, `region`, `contact`, `notes`, `1`-`31` (day columns)

3. **Sheet 2: Color Definitions** - Color mapping for shift codes
   - Columns: `code`, `color_name`, `rgb`, `hex`

### Download Template

- Download button fetches template from `GET /api/workspace/import-export/template`
- Returns `.xlsx` file with example data for all 3 sheets
- Button shows loading state during download

## Limitation

- The current UI exposes preview/apply/export only; field-level mapping correction is not yet editable in-browser.
