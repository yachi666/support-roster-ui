import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const pageSource = readFileSync(new URL('./LinuxPasswordsPage.vue', import.meta.url), 'utf8')
const toolbarSource = readFileSync(new URL('../components/LinuxPasswordToolbar.vue', import.meta.url), 'utf8')

test('linux passwords page exposes viewer, contact information, and workspace navigation links', () => {
  assert.match(pageSource, /<RouterLink[\s\S]*to="\/viewer"/)
  assert.match(pageSource, /<RouterLink[\s\S]*to="\/contact-information"/)
  assert.match(pageSource, /<RouterLink[\s\S]*to="\/workspace"/)
})

test('linux passwords page defines shared top action button classes for cleaner hierarchy', () => {
  assert.match(pageSource, /const topActionLinkBaseClass = 'inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors'/)
  assert.match(pageSource, /const topActionSecondaryClass = 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'/)
  assert.match(pageSource, /const topActionPrimaryClass = 'border border-teal-200 bg-teal-50 text-teal-700 hover:border-teal-300 hover:bg-teal-100'/)
})

test('linux passwords page passes management state to the toolbar and gates add action rendering', () => {
  assert.match(pageSource, /:can-manage-servers="model\.canManageServers"/)
  assert.match(toolbarSource, /canManageServers/)
  assert.match(toolbarSource, /v-if="canManageServers"/)
})
