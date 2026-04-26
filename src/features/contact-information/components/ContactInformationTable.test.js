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

test('contact information table exposes real pagination props and events', () => {
  assert.match(tableSource, /currentPage:/)
  assert.match(tableSource, /pageSize:/)
  assert.match(tableSource, /defineEmits\(\['copy', 'change-page'\]\)/)
  assert.match(tableSource, /@click="emit\('change-page', props\.currentPage - 1\)"/)
  assert.match(tableSource, /@click="emit\('change-page', props\.currentPage \+ 1\)"/)
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
  assert.match(tableSource, /const displayedEntryStart = computed\(\(\) => \(props\.totalCount && props\.teams\.length/)
  assert.match(tableSource, /const displayedEntryEnd = computed\(\(\) =>/)
  assert.match(tableSource, /Showing \{\{ displayedEntryStart \}\} to \{\{ displayedEntryEnd \}\}/)
})

test('contact information table only renders a mailto link when a team email exists', () => {
  assert.match(
    tableSource,
    /<a\s+v-if="team\.email"[\s\S]*:href="`mailto:\$\{team\.email\}`"/,
  )
})
