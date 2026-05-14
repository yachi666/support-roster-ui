import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const pageSource = readFileSync(new URL('./SupportTeamContactCreatePage.vue', import.meta.url), 'utf8')

test('contact information create page gives the back button an accessible name', () => {
  assert.match(pageSource, /:aria-label="`Back to \$\{t\('common\.contactInformation'\)\}`"/)
  assert.match(pageSource, /{{ `Add Team to \$\{t\('common\.contactInformation'\)\}` }}/)
})

test('contact information create page submits through the real api client and surfaces errors', () => {
  assert.match(pageSource, /createContactInformation/)
  assert.match(pageSource, /submitError/)
  assert.match(pageSource, /await createContactInformation\(payload\)/)
})
