import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./MonthlyRosterPlannerPage.vue', import.meta.url), 'utf8')

test('monthly roster wires the selection action bar through a wrapper handler', () => {
  assert.match(source, /import RosterSelectionActionBar from '\.\.\/components\/roster\/RosterSelectionActionBar\.vue'/)
  assert.match(
    source,
    /function applyCurrentSelection\(code\) \{[\s\S]*const activeSelection = selectedRange\.value \|\| selectedCell\.value[\s\S]*applyShiftCodeToActiveSelection\(activeSelection, code\)/,
  )
  assert.match(
    source,
    /<RosterSelectionActionBar[\s\S]*:visible="Boolean\(selectedRange \|\| selectedCell\)"[\s\S]*@select-code="selectedAssignmentEditable && applyCurrentSelection\(\$event\)"/,
  )
  assert.doesNotMatch(source, /<AssignmentDrawer/)
  assert.doesNotMatch(source, /data-testid="roster-status-strip"/)
})

test('monthly roster clears stale selection state when the active cell disappears or is filtered out', () => {
  assert.match(source, /function clearSelection\(\) \{[\s\S]*selectedCell\.value = null[\s\S]*selectedRange\.value = null/)
  assert.match(
    source,
    /watch\(selectedCell, \(cell\) => \{[\s\S]*if \(!cell\) \{[\s\S]*selectedRange\.value = null/,
  )
  assert.match(
    source,
    /watch\(visibleStaffIds, \(staffIds\) => \{[\s\S]*if \(!staffIds\.has\(selectedCell\.value\.staffId\)\) \{[\s\S]*clearSelection\(\)/,
  )
})
