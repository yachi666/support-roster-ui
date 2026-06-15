import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./Timeline.vue', import.meta.url), 'utf8')

test('timeline tooltip renders teams contact as an icon-only link with accessible labeling', () => {
  assert.match(source, /import teamsContactIcon from '@\/assets\/teams-contact-icon\.png'/)
  assert.match(source, /:aria-label="`Contact \$\{layoutShift\.shift\.userName\} in Teams`"/)
  assert.match(
    source,
    /<img\s+[^>]*:src="teamsContactIcon"[^>]*alt=""[^>]*aria-hidden="true"[^>]*class="h-5 w-5 rounded-full object-cover"/s,
  )
})

test('timeline details popover can grow wider for long email and shift code content', () => {
  // Verify TooltipContent has viewport-safe adaptive width (no min-w-[20rem] that could overflow)
  assert.match(
    source,
    /<TooltipContent\s+[^>]*class="[^"]*min-w-\[min\(20rem,calc\(100vw-2rem\)\)\][^"]*"/s,
  )
  assert.match(
    source,
    /<TooltipContent\s+[^>]*class="[^"]*max-w-\[min\(40rem,calc\(100vw-2rem\)\)\][^"]*"/s,
  )
  // Verify old fixed w-72 class is gone from TooltipContent
  assert.doesNotMatch(source, /<TooltipContent\s+[^>]*class="[^"]*\bw-72\b[^"]*"/s)
  // Verify shift-code row uses break-all for wrapping
  assert.match(
    source,
    /<span class="w-16 shrink-0 text-xs font-medium leading-5 text-gray-500">[\s\S]*t\('viewer\.timeline\.shiftCode'\)[\s\S]*<\/span>\s*<span class="[^"]*break-all[^"]*font-mono/s,
  )
  // Verify email row uses break-all for wrapping
  assert.match(
    source,
    /<span class="[^"]*break-all[^"]*select-all[^"]*leading-5">[\s\S]*getShiftContactValue\(layoutShift\.shift, 'email'\)[\s\S]*<\/span>/,
  )
})

test('timeline details popover uses consistent detail row spacing', () => {
  assert.match(source, /class="flex min-h-6 items-start gap-2\.5"/)
  assert.match(source, /class="flex min-h-6 items-center gap-2\.5"/)
  assert.match(source, /class="my-2\.5 h-px bg-gray-100"/)
  assert.match(source, /class="inline-flex h-8 w-8 items-center justify-center rounded-full/)
})

test('timeline centers shift lanes vertically inside each team row', () => {
  assert.match(
    source,
    /const laneStackHeight =\s*lanes\.length > 0 \? lanes\.length \* BLOCK_HEIGHT \+ \(lanes\.length - 1\) \* BLOCK_GAP : 0/s,
  )
  assert.match(
    source,
    /const height = Math\.max\(MIN_ROW_HEIGHT, laneStackHeight \+ ROW_PADDING \* 2\)/,
  )
  assert.match(
    source,
    /const laneTopOffset = lanes\.length > 0 \? \(height - laneStackHeight\) \/ 2 : ROW_PADDING/,
  )
  assert.match(source, /top: laneTopOffset \+ layoutShift\.laneIndex \* \(BLOCK_HEIGHT \+ BLOCK_GAP\)/)
  assert.match(source, /top: `\$\{layoutShift\.top\}px`/)
})

test('timeline team labels wrap inside the sticky team column without clipping the row', () => {
  assert.ok(
    source.includes(':style="{ width: `${TEAM_COLUMN_WIDTH}px`, minHeight: `${height}px` }"'),
  )
  assert.ok(
    source.includes('<div class="flex min-w-0 items-start text-sm font-semibold text-gray-800">'),
  )
  assert.ok(
    source.includes(
      '<span class="min-w-0 break-words whitespace-normal leading-5">{{ team.name }}</span>',
    ),
  )
  assert.ok(source.includes(':style="{ width: `${timelineWidth}px`, minHeight: `${height}px` }"'))
  assert.ok(source.includes('<div aria-hidden="true" :style="{ height: `${height}px` }"></div>'))
})
