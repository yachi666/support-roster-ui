import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./RosterGrid.vue', import.meta.url), 'utf8')

test('roster grid removes open-selected-cell and keeps selection events on click and enter', () => {
  assert.doesNotMatch(source, /open-selected-cell/)
  assert.match(source, /@click="selectStaffRow\(row\.person\.id\)"/)
  assert.match(source, /@keydown="handleCellKeydown\(\$event, row\.person\.id, index \+ 1\)"/)
  assert.match(source, /case 'Enter':[\s\S]*emit\('select-cell', \{ staffId, day \}\)/)
})

test('roster grid exposes stable data attributes for route-driven focus and scrolling', () => {
  assert.match(source, /:data-roster-staff-id="String\(row\.person\.id\)"/)
  assert.match(source, /:data-roster-day="String\(index \+ 1\)"/)
})

test('roster grid exposes stable data attributes for route-driven focus and scrolling', () => {
  assert.match(source, /:data-roster-staff-id="String\(row\.person\.id\)"/)
  assert.match(source, /:data-roster-day="String\(index \+ 1\)"/)
})
