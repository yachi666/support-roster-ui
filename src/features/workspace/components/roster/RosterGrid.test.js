import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./RosterGrid.vue', import.meta.url), 'utf8')

test('roster grid highlights the selected staff row without replacing selected cell priority', () => {
  assert.match(
    source,
    /isSelectedStaff\(row\.person\.id\)\s*\?\s*'bg-teal-100\/70 hover:bg-teal-100\/90'\s*:\s*'hover:bg-slate-100\/80'/,
  )
  assert.match(
    source,
    /isSelected\(row\.person\.id, index \+ 1\)\s*\?\s*'z-10 bg-teal-50\/60 ring-2 ring-inset ring-teal-500'/,
  )
  assert.match(
    source,
    /isRangeSelected\(row\.person\.id, index \+ 1\)\s*\?\s*'bg-sky-50\/70 ring-1 ring-inset ring-sky-300'/,
  )
  assert.match(
    source,
    /isPendingUpdate\(row\.person\.id, index \+ 1\)\s*\?\s*'bg-amber-50\/70 ring-1 ring-inset ring-amber-300'/,
  )
})

test('roster grid lets the frozen staff cell select that staff row', () => {
  assert.match(source, /function selectStaffRow\(staffId\)/)
  assert.match(source, /emit\('select-cell', \{ staffId, day: props\.selectedCell\?\.day \|\| 1 \}\)/)
  assert.match(source, /@click="selectStaffRow\(row\.person\.id\)"/)
  assert.match(source, /type="button"/)
})
