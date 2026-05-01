import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./MonthlyRosterPlannerPage.vue', import.meta.url), 'utf8')

test('monthly roster wires the selection action bar through a wrapper handler', () => {
  assert.match(source, /import RosterSelectionActionBar from '\.\.\/components\/roster\/RosterSelectionActionBar\.vue'/)
  assert.match(
    source,
    /function applyCurrentSelection\(code\) \{[\s\S]*applyShiftCodeToActiveSelection\(selectedRange\.value, code\)/,
  )
  assert.match(source, /<RosterSelectionActionBar[\s\S]*@select-code="selectedAssignmentEditable && applyCurrentSelection\(\$event\)"/)
  assert.doesNotMatch(source, /<AssignmentDrawer/)
  assert.doesNotMatch(source, /data-testid="roster-status-strip"/)
})
