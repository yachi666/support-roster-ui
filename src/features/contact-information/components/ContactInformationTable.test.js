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
  assert.match(tableSource, /of \{\{ props\.totalCount \}\} entries/)
})

test('contact information table marks pagination placeholders as disabled controls', () => {
  assert.match(tableSource, /<button[^>]*type="button"[^>]*disabled[^>]*>\s*Previous/s)
  assert.match(tableSource, /<button[^>]*type="button"[^>]*disabled[^>]*>\s*Next/s)
})

test('contact information table gives icon-only copy buttons accessible names', () => {
  assert.match(tableSource, /aria-label="Copy xMatter Group ID"/)
  assert.match(tableSource, /aria-label="Copy GSD Group ID"/)
})

test('contact information table declares column header scope for screen readers', () => {
  assert.match(tableSource, /<th scope="col"/)
})

test('contact information table shows a zero-safe result range summary', () => {
  assert.match(tableSource, /import \{ computed \} from 'vue'/)
  assert.match(tableSource, /const displayedEntryStart = computed\(\(\) => \(props\.teams\.length \? 1 : 0\)\)/)
  assert.match(tableSource, /Showing \{\{ displayedEntryStart \}\} to \{\{ props\.teams\.length \}\}/)
})
