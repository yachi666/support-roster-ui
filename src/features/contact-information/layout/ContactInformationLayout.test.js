import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./ContactInformationLayout.vue', import.meta.url), 'utf8')

test('contact information layout exposes navigation to related app areas', () => {
  assert.match(source, /to="\/linux-passwords"/)
  assert.match(source, /to="\/viewer"/)
  assert.match(source, /to="\/workspace"/)
})

test('contact information layout mirrors the shared top action hierarchy', () => {
  assert.match(source, /const topActionLinkBaseClass = 'inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition-colors'/)
  assert.match(source, /const topActionSecondaryClass = 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'/)
  assert.match(source, /const topActionPrimaryClass = 'border border-teal-200 bg-teal-50 text-teal-700 hover:border-teal-300 hover:bg-teal-100'/)
})

test('contact information layout does not duplicate the local add action in the global header', () => {
  assert.doesNotMatch(source, /showAddAction/)
  assert.doesNotMatch(source, /to="\/contact-information\/add"/)
  assert.doesNotMatch(source, /Add Team/)
})

test('contact information layout gives the shared search input an accessible name', () => {
  assert.match(source, /aria-label="Search teams, staff IDs, or links"/)
})

test('contact information layout syncs the shared search term with the keyword query parameter', () => {
  assert.match(source, /const normalizedKeyword = computed\(\(\) => String\(route\.query\.keyword \|\| ''\)\.trim\(\)\)/)
  assert.match(source, /searchTerm = ref\(normalizedKeyword\.value\)/)
  assert.match(source, /const normalizedNext = String\(next \|\| ''\)\.trim\(\)/)
  assert.match(source, /router\.replace\(\{[\s\S]*keyword: normalizedNext \|\| undefined[\s\S]*page: undefined[\s\S]*\}\)/)
})
