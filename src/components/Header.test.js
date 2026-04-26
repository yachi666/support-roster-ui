import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./Header.vue', import.meta.url), 'utf8')

test('viewer header exposes contact information and linux password vault as matched utility actions', () => {
  assert.match(source, /<RouterLink[\s\S]*to="\/contact-information"/)
  assert.match(source, /<RouterLink[\s\S]*to="\/linux-passwords"/)
  assert.match(source, /ContactRound class="h-4 w-4 text-gray-500"/)
  assert.match(source, /KeyRound class="h-4 w-4 text-gray-500"/)
  assert.match(source, /LayoutDashboard class="h-4 w-4 text-teal-600"/)
  assert.match(
    source,
    /class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3\.5 py-1\.5 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"/,
  )
})
