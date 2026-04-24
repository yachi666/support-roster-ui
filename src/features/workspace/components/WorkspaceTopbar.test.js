import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./WorkspaceTopbar.vue', import.meta.url), 'utf8')

test('workspace topbar action links share one button skeleton while keeping separate visual variants', () => {
  assert.match(
    source,
    /const topbarActionLinkBaseClass = 'inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors'/,
  )
  assert.match(
    source,
    /const topbarActionSecondaryClass = 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'/,
  )
  assert.match(
    source,
    /const topbarActionPrimaryClass = 'border border-teal-200 bg-teal-50 text-teal-700 hover:border-teal-300 hover:bg-teal-100'/,
  )
})
