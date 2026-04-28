import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./ExternalSystemsDrawer.vue', import.meta.url), 'utf8')

test('external systems drawer exposes accessible external links', () => {
  assert.match(source, /role="dialog"/)
  assert.match(source, /aria-modal="true"/)
  assert.match(source, /aria-labelledby="external-systems-title"/)
  assert.match(source, /v-for="system in systems"/)
  assert.match(source, /target="_blank"/)
  assert.match(source, /rel="noreferrer"/)
  assert.match(source, /Close external systems drawer/)
  assert.match(source, /event\.key === 'Escape'/)
})
