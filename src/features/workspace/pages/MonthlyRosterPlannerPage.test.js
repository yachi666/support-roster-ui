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

test('monthly roster animates status strip and save/import messages with workspace status transitions', () => {
  assert.match(
    source,
    /<Transition name="workspace-status">[\s\S]*data-testid="roster-status-strip"/,
  )
  assert.match(
    source,
    /<Transition name="workspace-status">[\s\S]*v-if="saveErrorMessage"/,
  )
  assert.match(
    source,
    /<Transition name="workspace-status">[\s\S]*v-if="saveSuccessMessage"/,
  )
  assert.match(
    source,
    /<Transition name="workspace-status">[\s\S]*v-if="importExportError"/,
  )
})

test('monthly roster animates the team filter popover with the shared workspace popover transition', () => {
  assert.match(
    source,
    /<Transition name="workspace-popover">[\s\S]*v-if="showTeamFilter"/,
  )
})
