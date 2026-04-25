import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const pageSource = readFileSync(new URL('./SupportTeamContactsPage.vue', import.meta.url), 'utf8')

test('contact information page auto-dismisses transient notices and clears timers', () => {
  assert.match(pageSource, /setTimeout\(/)
  assert.match(pageSource, /onUnmounted/)
  assert.match(pageSource, /clearTimeout/)
})
