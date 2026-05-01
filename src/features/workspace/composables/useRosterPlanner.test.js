import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./useRosterPlanner.js', import.meta.url), 'utf8')

test('roster planner stages shift codes directly against the active selection', () => {
  assert.match(source, /function applyShiftCodeToActiveSelection\(selection, shiftCode\) \{/)
  assert.match(source, /const normalizedCode = shiftCode === 'Clear' \? '' : shiftCode/)
  assert.match(source, /const startDay = selection\.day \?\? selection\.startDay/)
  assert.match(source, /const endDay = selection\.day \?\? selection\.endDay \?\? startDay/)
  assert.match(source, /const normalizedStartDay = Math\.min\(startDay, endDay\)/)
  assert.match(source, /const normalizedEndDay = Math\.max\(startDay, endDay\)/)
  assert.match(source, /for \(let day = normalizedStartDay; day <= normalizedEndDay; day \+= 1\)/)
  assert.match(source, /applyScheduleUpdate\(\{[\s\S]*shiftCode: normalizedCode/)
})
