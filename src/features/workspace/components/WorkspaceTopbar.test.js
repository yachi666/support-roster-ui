import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./WorkspaceTopbar.vue', import.meta.url), 'utf8')

test('workspace topbar action links share one button skeleton while keeping separate visual variants', () => {
  assert.match(
    source,
    /const topbarActionLinkBaseClass = 'inline-flex h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full px-3\.5 text-sm font-medium transition-colors'/,
  )
  assert.match(
    source,
    /const topbarActionSecondaryClass = 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'/,
  )
  assert.match(
    source,
    /const topbarActionPrimaryClass = 'border border-teal-200 bg-teal-50 text-teal-700 hover:border-teal-300 hover:bg-teal-100'/,
  )
  assert.match(source, /to="\/contact-information"/)
  assert.match(source, /to="\/linux-passwords"/)
  assert.doesNotMatch(source, /hidden min-\[1800px\]:inline/)
})

test('workspace topbar separates search, period context, and action cluster into distinct surfaces', () => {
  assert.match(source, /const topbarSearchShellClass = 'group relative w-\[9\.5rem\] shrink min-\[1280px\]:w-\[11rem\] min-\[1536px\]:w-\[12rem\]'/)
  assert.match(source, /const topbarPeriodShellClass = 'flex h-9 w-fit shrink-0 items-center justify-center gap-0\.5 rounded-xl border border-slate-200 bg-white px-1 shadow-sm'/)
  assert.match(source, /const topbarActionClusterClass = 'ml-auto flex h-11 shrink-0 items-center justify-end gap-2'/)
})

test('workspace topbar uses one date picker surface instead of duplicating month display', () => {
  assert.doesNotMatch(source, /topbarPeriodLabelClass/)
  assert.doesNotMatch(source, /topbarPeriodValueClass/)
  assert.doesNotMatch(source, /{{ monthLabel }}/)
  assert.match(source, /const topbarMonthSelectClass = 'h-7 w-\[4\.75rem\] rounded-lg border border-transparent bg-slate-50 pl-2 pr-6 text-sm font-semibold text-slate-900 outline-none transition-colors hover:border-slate-200 focus:border-teal-300 focus:bg-white focus:ring-2 focus:ring-teal-500\/15'/)
  assert.match(source, /const topbarMetaControlClass = 'flex h-7 min-w-0 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 pl-1\.5 pr-1'/)
})

test('workspace topbar stays as a single compact toolbar instead of wrapping into multiple rows', () => {
  assert.match(source, /const topbarShellClass = 'flex h-16 w-full min-w-0 flex-1 items-center gap-2'/)
  assert.match(source, /<header class="flex flex-shrink-0 overflow-x-auto border-b border-slate-200\/80 bg-slate-50\/90 px-5 backdrop-blur-sm lg:px-6">/)
  assert.doesNotMatch(source, /flex-wrap/)
  assert.doesNotMatch(source, /col-span-2/)
  assert.doesNotMatch(source, /grid-cols/)
})

test('workspace topbar uses compact month, timezone, and locale controls before hiding actions', () => {
  assert.match(source, /const topbarMonthSelectClass = 'h-7 w-\[4\.75rem\] rounded-lg border border-transparent bg-slate-50 pl-2 pr-6 text-sm font-semibold text-slate-900 outline-none transition-colors hover:border-slate-200 focus:border-teal-300 focus:bg-white focus:ring-2 focus:ring-teal-500\/15'/)
  assert.match(source, /const topbarYearSelectClass = 'h-7 w-\[4\.35rem\] rounded-lg border border-transparent bg-slate-50 pl-1\.5 pr-5 text-sm font-semibold text-slate-900 outline-none transition-colors hover:border-slate-200 focus:border-teal-300 focus:bg-white focus:ring-2 focus:ring-teal-500\/15'/)
  assert.match(source, /const topbarMetaControlClass = 'flex h-7 min-w-0 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 pl-1\.5 pr-1'/)
})

test('workspace topbar labels chevron month navigation buttons for assistive tech', () => {
  assert.match(source, /:aria-label="t\('workspace\.shell\.topbar\.previousMonth'\)"/)
  assert.match(source, /:aria-label="t\('workspace\.shell\.topbar\.nextMonth'\)"/)
})
