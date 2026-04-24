import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const pageSource = readFileSync(new URL('./LinuxPasswordsPage.vue', import.meta.url), 'utf8')
const toolbarSource = readFileSync(new URL('../components/LinuxPasswordToolbar.vue', import.meta.url), 'utf8')

test('linux passwords page exposes viewer and workspace navigation links', () => {
  assert.match(pageSource, /<RouterLink[\s\S]*to="\/viewer"/)
  assert.match(pageSource, /<RouterLink[\s\S]*to="\/workspace"/)
})

test('linux passwords page passes management state to the toolbar and gates add action rendering', () => {
  assert.match(pageSource, /:can-manage-servers="model\.canManageServers"/)
  assert.match(toolbarSource, /canManageServers/)
  assert.match(toolbarSource, /v-if="canManageServers"/)
})
