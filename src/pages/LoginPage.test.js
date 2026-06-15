import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./LoginPage.vue', import.meta.url), 'utf8')

test('login form fields expose stable ids, names, and explicit labels', () => {
  assert.match(source, /<label\s+for="login-staff-id"/)
  assert.match(source, /id="login-staff-id"[\s\S]*name="staffId"[\s\S]*autocomplete="username"/)

  assert.match(source, /<label\s+for="login-password"/)
  assert.match(
    source,
    /id="login-password"[\s\S]*name="password"[\s\S]*autocomplete="current-password"/,
  )

  assert.match(source, /<label\s+for="login-new-password"/)
  assert.match(
    source,
    /id="login-new-password"[\s\S]*name="newPassword"[\s\S]*autocomplete="new-password"/,
  )
})
