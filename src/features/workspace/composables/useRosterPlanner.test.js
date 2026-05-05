import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./useRosterPlanner.js', import.meta.url), 'utf8')

test('roster planner stages shift codes directly against the active selection', () => {
  assert.match(source, /Accepts either a single-cell selection/)
  assert.match(source, /function normalizeShiftSelection\(selection\) \{/)
  assert.match(source, /console\.error\('\[useRosterPlanner\] Invalid selection passed to applyShiftCodeToActiveSelection\.'\)/)
  assert.match(source, /console\.error\('\[useRosterPlanner\] Expected a single-cell or range selection, received:'\, selection\)/)
  assert.match(source, /const normalizedSelection = normalizeShiftSelection\(selection\)/)
  assert.match(source, /function applyShiftCodeToActiveSelection\(selection, shiftCode\) \{/)
  assert.match(source, /const \{ staffId, startDay, endDay \} = normalizedSelection/)
  assert.match(source, /const normalizedCode = shiftCode === 'Clear' \? '' : shiftCode/)
  assert.match(source, /const normalizedStartDay = Math\.min\(startDay, endDay\)/)
  assert.match(source, /const normalizedEndDay = Math\.max\(startDay, endDay\)/)
  assert.match(source, /for \(let day = normalizedStartDay; day <= normalizedEndDay; day \+= 1\)/)
  assert.match(source, /applyScheduleUpdate\(\{[\s\S]*staffId,[\s\S]*shiftCode: normalizedCode/)
  assert.match(source, /return \{[\s\S]*staffId,[\s\S]*\}/)
  assert.doesNotMatch(source, /staffId: selection\.staffId/)
})

test('roster planner forwards selected team filters into previous month copy updates', () => {
  assert.match(source, /const selectedTeamIds = ref\(\[\]\)/)
  assert.match(
    source,
    /buildPreviousMonthCopyUpdates\(\{[\s\S]*selectedTeamIds: selectedTeamIds\.value,[\s\S]*\}\)/,
  )
})
