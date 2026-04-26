import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const formSource = readFileSync(new URL('./SupportTeamContactForm.vue', import.meta.url), 'utf8')

test('create contact form accepts comma-separated staff IDs through one input', () => {
  assert.match(formSource, /staffInput:\s*''/)
  assert.match(formSource, /parseCommaSeparatedTokens\(formState\.staffInput\)/)
  assert.match(formSource, /placeholder="S-10492, S-94281, S-55219"/)
  assert.doesNotMatch(formSource, /Quick add:/)
})

test('create contact form uses tag language instead of role language on the add screen', () => {
  assert.match(formSource, /selectedTags:\s*\[\]/)
  assert.match(formSource, /for="tagInput">Tag</)
  assert.match(formSource, /roles: \[\.\.\.formState\.selectedTags\]/)
  assert.doesNotMatch(formSource, />Role</)
})

test('create contact form keeps other information as a single input', () => {
  assert.match(formSource, /otherInfo:\s*''/)
  assert.match(formSource, /for="otherInfo">Other Information</)
  assert.match(formSource, /id="otherInfo"/)
  assert.doesNotMatch(formSource, /customLinks/)
  assert.doesNotMatch(formSource, /Add Custom Field/)
})

test('create contact form wires validation errors to inputs accessibly', () => {
  assert.match(formSource, /:aria-invalid="Boolean\(fieldErrors\.teamName\)"/)
  assert.match(formSource, /:aria-describedby="fieldErrors\.teamName \? 'teamName-error' : undefined"/)
  assert.match(formSource, /id="teamName-error"[^>]*role="alert"[^>]*aria-live="polite"/)
  assert.match(formSource, /:aria-invalid="Boolean\(fieldErrors\.teamEmail\)"/)
  assert.match(formSource, /:aria-describedby="fieldErrors\.teamEmail \? 'teamEmail-error' : undefined"/)
  assert.match(formSource, /id="teamEmail-error"[^>]*role="alert"[^>]*aria-live="polite"/)
  assert.match(formSource, /:aria-invalid="Boolean\(fieldErrors\.selectedStaff\)"/)
  assert.match(formSource, /:aria-describedby="fieldErrors\.selectedStaff \? 'staffIds-error' : undefined"/)
  assert.match(formSource, /id="staffIds-error"[^>]*role="alert"[^>]*aria-live="polite"/)
})
