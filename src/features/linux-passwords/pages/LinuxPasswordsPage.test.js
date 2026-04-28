import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const pageSource = readFileSync(new URL('./LinuxPasswordsPage.vue', import.meta.url), 'utf8')
const toolbarSource = readFileSync(
  new URL('../components/LinuxPasswordToolbar.vue', import.meta.url),
  'utf8',
)
const sidebarSource = readFileSync(
  new URL('../components/LinuxPasswordSidebar.vue', import.meta.url),
  'utf8',
)

test('linux passwords page exposes viewer, contact information, and workspace navigation links', () => {
  assert.match(pageSource, /<RouterLink[\s\S]*to="\/viewer"/)
  assert.match(pageSource, /<RouterLink[\s\S]*to="\/contact-information"/)
  assert.match(pageSource, /<RouterLink[\s\S]*to="\/workspace"/)
  assert.match(pageSource, /ContactRound class="h-4 w-4 text-slate-500"/)
  assert.match(pageSource, /CalendarDays class="h-4 w-4 text-slate-500"/)
  assert.match(pageSource, /LayoutDashboard class="h-4 w-4 text-teal-600"/)
  assert.match(pageSource, /t\('linuxPasswords\.enterWorkspace'\)/)
})

test('linux passwords page defines shared top action button classes for cleaner hierarchy', () => {
  assert.match(
    pageSource,
    /const topActionLinkBaseClass = 'inline-flex h-9 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition-colors'/,
  )
  assert.match(
    pageSource,
    /const topActionSecondaryClass = 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'/,
  )
  assert.match(
    pageSource,
    /const topActionPrimaryClass = 'border border-teal-200 bg-teal-50 text-teal-700 hover:border-teal-300 hover:bg-teal-100'/,
  )
})

test('linux passwords page passes management state to the toolbar and gates add action rendering', () => {
  assert.match(pageSource, /:can-manage-servers="model\.canManageServers"/)
  assert.match(toolbarSource, /canManageServers/)
  assert.match(toolbarSource, /v-if="canManageServers"/)
})

test('linux passwords sidebar exposes admin-only audit entry', () => {
  assert.match(pageSource, /:can-view-audits="authStore\.isAdmin"/)
  assert.match(sidebarSource, /canViewAudits/)
  assert.match(sidebarSource, /v-if="props\.canViewAudits"/)
  assert.match(sidebarSource, /to="\/linux-passwords\/audits"/)
})
