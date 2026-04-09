import assert from 'node:assert/strict'
import test from 'node:test'
import { buildPreviousMonthCopyUpdates, getPreviousMonthPeriod } from './previousRoster.js'

test('getPreviousMonthPeriod wraps from january to previous december', () => {
  assert.deepEqual(getPreviousMonthPeriod(2026, 1), { year: 2025, month: 12 })
  assert.deepEqual(getPreviousMonthPeriod(2026, 4), { year: 2026, month: 3 })
})

test('buildPreviousMonthCopyUpdates copies only blank current cells', () => {
  const updates = buildPreviousMonthCopyUpdates({
    currentGroups: [
      {
        teamId: 't-1',
        staff: [
          { id: 's-1', schedule: ['', 'B', '', ''] },
          { id: 's-2', schedule: ['', '', '', ''] },
        ],
      },
    ],
    previousGroups: [
      {
        teamId: 't-1',
        staff: [
          { id: 's-1', schedule: ['A', 'C', '', 'D'] },
          { id: 's-2', schedule: ['', 'N', '', ''] },
        ],
      },
    ],
    targetDayCount: 4,
  })

  assert.deepEqual(updates, [
    { staffId: 's-1', day: 1, shiftCode: 'A' },
    { staffId: 's-1', day: 4, shiftCode: 'D' },
    { staffId: 's-2', day: 2, shiftCode: 'N' },
  ])
})

test('buildPreviousMonthCopyUpdates ignores non-matching staff and days outside current month', () => {
  const updates = buildPreviousMonthCopyUpdates({
    currentGroups: [
      {
        teamId: 't-1',
        staff: [{ id: 's-1', schedule: ['', ''] }],
      },
    ],
    previousGroups: [
      {
        teamId: 't-1',
        staff: [
          { id: 's-1', schedule: ['A', 'B', 'C'] },
          { id: 's-9', schedule: ['N', 'N', 'N'] },
        ],
      },
    ],
    targetDayCount: 2,
  })

  assert.deepEqual(updates, [
    { staffId: 's-1', day: 1, shiftCode: 'A' },
    { staffId: 's-1', day: 2, shiftCode: 'B' },
  ])
})
