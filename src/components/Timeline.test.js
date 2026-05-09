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
  assert.match(source, /min-w-\[20rem\]/)
  assert.match(source, /max-w-\[min\(40rem,calc\(100vw-2rem\)\)\]/)
  assert.match(source, /break-all|break-words/)
  assert.match(source, /viewer\.timeline\.shiftCode/)
})
