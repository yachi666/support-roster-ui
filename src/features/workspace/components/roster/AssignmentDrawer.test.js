import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./AssignmentDrawer.vue', import.meta.url), 'utf8')

test('assignment drawer removes the editable range-end selector and keeps drag range guidance only', () => {
  assert.match(source, /dragDetected/)
  assert.doesNotMatch(source, /applyThrough/)
  assert.doesNotMatch(source, /applyRange/)
  assert.doesNotMatch(source, /rangeEndDay/)
})

test('assignment drawer keeps reset action for multi-day drag selection and hides apply-next in range mode', () => {
  assert.match(source, /v-if="selectedRange && selectedRange\.endDay > assignment\.day"[\s\S]*resetSingleDay/)
  assert.match(source, /:disabled="readonly \|\| !hasSelectionChanged \|\| hasRangeSelection"/)
})

test('assignment drawer no longer references apply-through copy after range fill simplification', () => {
  assert.doesNotMatch(source, /applyThrough/)
  assert.doesNotMatch(source, /applyRange/)
})
