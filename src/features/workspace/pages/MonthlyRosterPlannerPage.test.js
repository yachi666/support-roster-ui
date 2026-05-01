import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./MonthlyRosterPlannerPage.vue', import.meta.url), 'utf8')

test('monthly roster wires the selection action bar through a wrapper handler and shared presentation state', () => {
  assert.match(source, /import RosterSelectionActionBar from '\.\.\/components\/roster\/RosterSelectionActionBar\.vue'/)
  assert.match(
    source,
    /import \{ buildShiftPresentationByTeam \} from '\.\.\/lib\/shiftPresentation'/,
  )
  assert.match(
    source,
    /function applyCurrentSelection\(code\) \{[\s\S]*const activeSelection = selectedRange\.value \|\| selectedCell\.value[\s\S]*if \(!selectedAssignmentEditable\.value\) \{[\s\S]*return[\s\S]*\}[\s\S]*applyShiftCodeToActiveSelection\(activeSelection, code\)/,
  )
  assert.match(
    source,
    /const selectedActionBarTeamId = computed\(\(\) =>[\s\S]*selectedAssignment\.value\?\.group\?\.teamId \|\| selectedAssignment\.value\?\.staff\?\.teamId \|\| ''[\s\S]*\)/,
  )
  assert.match(
    source,
    /const shiftPresentation = computed\(\(\) =>[\s\S]*buildShiftPresentationByTeam\(\{[\s\S]*shiftDetailsByTeam: shiftDetailsByTeam\.value[\s\S]*shiftCodeColorMap: shiftCodeColorMap\.value[\s\S]*\}\)[\s\S]*\)\)/,
  )
  assert.match(
    source,
    /<RosterSelectionActionBar[\s\S]*:visible="Boolean\(selectedRange \|\| selectedCell\)"[\s\S]*:selected-team-id="selectedActionBarTeamId"[\s\S]*:shift-presentation-by-team="shiftPresentation\.shiftPresentationByTeam"[\s\S]*:fallback-shift-presentation-by-code="shiftPresentation\.fallbackShiftPresentationByCode"[\s\S]*@select-code="applyCurrentSelection\(\$event\)"/,
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
