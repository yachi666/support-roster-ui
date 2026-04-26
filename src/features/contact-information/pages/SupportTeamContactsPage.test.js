import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const pageSource = readFileSync(new URL('./SupportTeamContactsPage.vue', import.meta.url), 'utf8')

test('contact information page auto-dismisses transient notices and clears timers', () => {
  assert.match(pageSource, /setTimeout\(/)
  assert.match(pageSource, /onUnmounted/)
  assert.match(pageSource, /clearTimeout/)
})

test('contact information page loads real api data instead of runtime mock records', () => {
  assert.doesNotMatch(pageSource, /contactInformationMockTeams/)
  assert.match(pageSource, /listContactInformation/)
  assert.match(pageSource, /contactsResponse/)
})

test('contact information page normalizes query state before requesting the api', () => {
  assert.match(pageSource, /const normalizedPage = computed\(\(\) => \{/)
  assert.match(pageSource, /const numericPage = Number\(route\.query\.page \|\| 1\)/)
  assert.match(pageSource, /return Number\.isInteger\(numericPage\) && numericPage > 0 \? numericPage : 1/)
  assert.match(pageSource, /keyword: layoutState\.searchTerm\.value/)
  assert.match(pageSource, /page: normalizedPage\.value/)
})
