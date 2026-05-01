import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./ImportRosterPreviewModal.vue', import.meta.url), 'utf8')

test('import roster preview routes dragged multi-day apply through the primary apply action', () => {
  assert.match(source, /function applySelectedShift\(\) \{[\s\S]*if \(hasRangeSelection\.value\)[\s\S]*applySelectedRange\(selectedRange\.value\.endDay\)/)
  assert.doesNotMatch(source, /@apply-range=/)
  assert.doesNotMatch(source, /function applyRangeForward/)
})

test('import roster preview disables apply-and-next semantics for multi-day range selection', () => {
  assert.match(source, /function applyAndAdvanceDay\(\) \{[\s\S]*if \(!selectedCell\.value \|\| hasRangeSelection\.value\)/)
})
