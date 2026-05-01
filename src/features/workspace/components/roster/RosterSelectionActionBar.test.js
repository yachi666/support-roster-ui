import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./RosterSelectionActionBar.vue', import.meta.url), 'utf8')

test('selection action bar exposes shift code options and emits code selection', () => {
  assert.match(source, /defineProps\(\{[\s\S]*shiftCodeOptions:/)
  assert.match(source, /emit\('select-code'/)
  assert.match(source, /v-for="code in shiftCodeOptions"/)
  assert.match(source, /t\('workspace\.roster\.clear'\)/)
})

test('selection action bar no longer depends on drawer-only selection details', () => {
  assert.doesNotMatch(source, /selectedRange/)
  assert.doesNotMatch(source, /assignmentDate/)
  assert.doesNotMatch(source, /assignment\.staff\.name/)
})
