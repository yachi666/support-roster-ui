import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const pageSource = readFileSync(new URL('./SupportTeamContactCreatePage.vue', import.meta.url), 'utf8')

test('contact information create page gives the back button an accessible name', () => {
  assert.match(pageSource, /aria-label="Back to contact information list"/)
})
