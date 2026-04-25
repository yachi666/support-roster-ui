import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const tableSource = readFileSync(new URL('./ContactInformationTable.vue', import.meta.url), 'utf8')

test('contact information table opens external links safely in a new tab', () => {
  assert.match(tableSource, /target="_blank"/)
  assert.match(tableSource, /rel="noopener noreferrer"/)
})

test('contact information table accepts a total count for filtered results', () => {
  assert.match(tableSource, /totalCount:/)
  assert.match(tableSource, /Showing 1 to \{\{ props\.teams\.length \}\} of \{\{ props\.totalCount \}\} entries/)
})
