import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./WorkspaceTopbar.vue', import.meta.url), 'utf8')

test('workspace topbar action links share one button skeleton while keeping separate visual variants', () => {
  assert.match(
    source,
    /const topbarActionLinkBaseClass = 'inline-flex h-8 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-2\.5 text-sm font-semibold transition-colors'/,
  )
  assert.match(
    source,
    /const topbarActionSecondaryClass = 'border border-transparent bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50'/,
  )
  assert.match(
    source,
    /const topbarActionPrimaryClass = 'border border-teal-200 bg-teal-50 text-teal-700 hover:border-teal-300 hover:bg-teal-100'/,
  )
  assert.match(source, /to="\/contact-information"/)
  assert.match(source, /to="\/linux-passwords"/)
  assert.match(source, /class="hidden min-\[1800px\]:inline"/)
})

test('workspace topbar separates search, period context, and action cluster into distinct surfaces', () => {
  assert.match(source, /const topbarSearchShellClass = 'group relative w-\[16rem\] shrink-0 transition-all duration-200 focus-within:w-\[22rem\] xl:w-\[18rem\] xl:focus-within:w-\[24rem\]'/)
  assert.match(source, /const topbarPeriodShellClass = 'flex h-11 w-fit shrink-0 items-center justify-center gap-1\.5 rounded-xl border border-slate-200 bg-white px-1\.5 shadow-sm'/)
  assert.match(source, /const topbarActionClusterClass = 'ml-auto flex h-11 shrink-0 items-center justify-end gap-1\.5 rounded-xl border border-slate-200 bg-white px-1\.5 shadow-sm'/)
})

test('workspace topbar uses one date picker surface instead of duplicating month display', () => {
  assert.doesNotMatch(source, /topbarPeriodLabelClass/)
  assert.doesNotMatch(source, /topbarPeriodValueClass/)
  assert.doesNotMatch(source, /{{ monthLabel }}/)
  assert.match(source, /const topbarMonthSelectClass = 'h-8 min-w-\[9\.5rem\] rounded-lg border border-transparent bg-slate-50 px-3 text-center text-sm font-semibold text-slate-900 outline-none transition-colors hover:border-slate-200 focus:border-teal-300 focus:bg-white focus:ring-2 focus:ring-teal-500\/15'/)
  assert.match(source, /const topbarMetaControlClass = 'flex h-8 min-w-0 items-center gap-1\.5 rounded-lg border border-slate-200 bg-slate-50 px-2'/)
})

test('workspace topbar stays as a single compact toolbar instead of wrapping into multiple rows', () => {
  assert.match(source, /const topbarShellClass = 'flex h-16 min-w-\[50rem\] flex-1 items-center gap-3'/)
  assert.match(source, /<header class="flex flex-shrink-0 overflow-x-auto border-b border-slate-200\/80 bg-slate-50\/90 px-5 backdrop-blur-sm lg:px-6">/)
  assert.doesNotMatch(source, /flex-wrap/)
  assert.doesNotMatch(source, /col-span-2/)
  assert.doesNotMatch(source, /grid-cols/)
})

test('workspace topbar uses compact month, timezone, and locale controls before hiding actions', () => {
  assert.match(source, /const topbarMonthSelectClass = 'h-8 min-w-\[9\.5rem\] rounded-lg border border-transparent bg-slate-50 px-3 text-center text-sm font-semibold text-slate-900 outline-none transition-colors hover:border-slate-200 focus:border-teal-300 focus:bg-white focus:ring-2 focus:ring-teal-500\/15'/)
  assert.match(source, /const topbarYearSelectClass = 'h-8 w-\[4\.75rem\] rounded-lg border border-transparent bg-slate-50 px-2 text-sm font-semibold text-slate-900 outline-none transition-colors hover:border-slate-200 focus:border-teal-300 focus:bg-white focus:ring-2 focus:ring-teal-500\/15'/)
  assert.match(source, /const topbarMetaControlClass = 'flex h-8 min-w-0 items-center gap-1\.5 rounded-lg border border-slate-200 bg-slate-50 px-2'/)
})
