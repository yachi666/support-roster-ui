import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./Timeline.vue', import.meta.url), 'utf8')

test('timeline tooltip renders teams contact as an icon-only link with accessible labeling', () => {
  assert.match(source, /import teamsContactIcon from '@\/assets\/teams-contact-icon\.png'/)
  assert.match(source, /:aria-label="`Contact \$\{layoutShift\.shift\.userName\} in Teams`"/)
  assert.match(
    source,
    /<img\s+[^>]*:src="teamsContactIcon"[^>]*alt=""[^>]*aria-hidden="true"[^>]*class="h-7 w-7 rounded-full object-cover"/s,
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
    /<span class="shrink-0 text-xs font-medium text-gray-500">{{ t\('viewer\.timeline\.shiftCode'\) }}<\/span>\s*<span class="[^"]*break-all[^"]*font-mono/s,
  )
  // Verify email row uses break-all for wrapping
  assert.match(source, /<span class="[^"]*break-all[^"]*select-all">{{ getShiftContactValue\(layoutShift\.shift, 'email'\) }}<\/span>/)
})

test('timeline team labels wrap inside the sticky team column without clipping the row', () => {
  assert.ok(source.includes(':style="{ width: `${TEAM_COLUMN_WIDTH}px`, minHeight: `${height}px` }"'))
  assert.ok(source.includes('<div class="flex min-w-0 items-start text-sm font-semibold text-gray-800">'))
  assert.ok(source.includes('<span class="min-w-0 break-words whitespace-normal leading-5">{{ team.name }}</span>'))
  assert.ok(source.includes(':style="{ width: `${timelineWidth}px`, minHeight: `${height}px` }"'))
  assert.ok(source.includes('<div aria-hidden="true" :style="{ height: `${height}px` }"></div>'))
})
