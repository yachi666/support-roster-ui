import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./Header.vue', import.meta.url), 'utf8')

test('viewer header exposes contact information, linux password vault, and product updates actions', () => {
  assert.match(source, /Messaging Support Rota & Escalation Matrix/)
  assert.match(source, /ExternalSystemsDrawer/)
  assert.match(source, /EXTERNAL_SYSTEM_LINKS/)
  assert.match(source, /PanelRightOpen class="h-4 w-4" aria-hidden="true"/)
  assert.match(source, /aria-label="External systems"/)
  assert.match(source, /@click="openExternalSystemsDrawer"/)
  assert.match(source, /<RouterLink[\s\S]*to="\/contact-information"/)
  assert.match(source, /<RouterLink[\s\S]*to="\/linux-passwords"/)
  assert.match(source, /<RouterLink[\s\S]*to="\/product-updates"/)
  assert.match(source, /ContactRound class="h-4 w-4 text-slate-500"/)
  assert.match(source, /KeyRound class="h-4 w-4 text-slate-500"/)
  assert.match(source, /Newspaper class="h-4 w-4" aria-hidden="true"/)
  assert.match(source, /:aria-label="t\('common\.productUpdates'\)"/)
  assert.match(source, /LayoutDashboard class="h-4 w-4 text-teal-600"/)
  assert.match(source, /<span>Workspace<\/span>/)
  assert.match(
    source,
    /to="\/workspace"[\s\S]*aria-label="External systems"[\s\S]*to="\/product-updates"/,
  )
  assert.doesNotMatch(source, /Enter Workspace/)
  assert.match(
    source,
    /class="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3\.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950/,
  )
  assert.doesNotMatch(source, /shadow-sm transition-colors/)
})
