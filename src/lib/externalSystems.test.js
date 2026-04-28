import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./externalSystems.js', import.meta.url), 'utf8')

test('external systems config includes approved placeholder links', () => {
  assert.match(source, /import\.meta\.env\.VITE_XMATTERS_URL/)
  assert.match(source, /import\.meta\.env\.VITE_SERVICENOW_URL/)
  assert.match(source, /import\.meta\.env\.VITE_MESSAGE_DELIVERY_KB_URL/)
  assert.match(source, /id: 'xmatters'/)
  assert.match(source, /\|\| 'https:\/\/www\.xmatters\.com\/'/)
  assert.match(source, /id: 'servicenow'/)
  assert.match(source, /\|\| 'https:\/\/www\.servicenow\.com\/'/)
  assert.match(source, /id: 'message-delivery-knowledge-base'/)
  assert.match(source, /\|\| 'https:\/\/learn\.microsoft\.com\/'/)
  assert.match(source, /message-delivery-kb\.png/)
})
