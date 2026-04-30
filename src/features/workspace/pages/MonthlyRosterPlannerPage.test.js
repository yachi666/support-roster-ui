import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./MonthlyRosterPlannerPage.vue', import.meta.url), 'utf8')

test('monthly roster places unsaved save actions in the table status strip', () => {
  assert.match(source, /data-testid="roster-status-strip"/)
  assert.match(
    source,
    /data-testid="roster-status-strip"[\s\S]*@click="discardChanges"[\s\S]*@click="authStore\.canWriteWorkspace && saveChanges\(\)"/,
  )
  assert.doesNotMatch(source, /class="absolute bottom-6/)
})
