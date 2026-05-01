import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./RosterSelectionActionBar.vue', import.meta.url), 'utf8')

test('selection action bar accepts team-aware presentation props and reuses roster tooltip primitives', () => {
  assert.match(
    source,
    /import[\s\S]*TooltipArrow[\s\S]*TooltipContent[\s\S]*TooltipPortal[\s\S]*TooltipProvider[\s\S]*TooltipRoot[\s\S]*TooltipTrigger[\s\S]*from 'radix-vue'/,
  )
  assert.match(
    source,
    /import \{ getShiftPresentation as resolveShiftPresentation \} from '\.\.\/\.\.\/lib\/shiftPresentation'/,
  )
  assert.match(
    source,
    /defineProps\(\{[\s\S]*visible:[\s\S]*readonly:[\s\S]*shiftCodeOptions:[\s\S]*selectedTeamId:[\s\S]*shiftPresentationByTeam:[\s\S]*fallbackShiftPresentationByCode:/,
  )
  assert.match(
    source,
    /function getShiftPresentation\(code\) \{[\s\S]*return resolveShiftPresentation\(\{[\s\S]*shiftPresentationByTeam: props\.shiftPresentationByTeam[\s\S]*fallbackShiftPresentationByCode: props\.fallbackShiftPresentationByCode[\s\S]*teamId: props\.selectedTeamId[\s\S]*code,[\s\S]*\}\)/,
  )
})

test('selection action bar renders colored shift chips and roster-aligned tooltip content', () => {
  assert.match(source, /<TooltipProvider[\s\S]*v-for="code in actionShiftCodes"/)
  assert.match(
    source,
    /<TooltipContent[\s\S]*class="z-50 w-64 rounded-2xl border border-slate-200 bg-white\/98 p-3\.5 text-left shadow-\[0_18px_50px_rgba\(15,23,42,0\.18\)\] backdrop-blur"/,
  )
  assert.match(
    source,
    /:style="getShiftChipStyle\(code\)"[\s\S]*\{\{ code \}\}[\s\S]*getShiftMeaning\(code\) \|\|[\s\S]*t\('workspace\.grid\.shiftDefinition'\)/,
  )
  assert.match(source, /t\('workspace\.grid\.timeWindow'\)/)
  assert.match(source, /t\('workspace\.grid\.timezone'\)/)
  assert.match(source, /<TooltipArrow class="fill-white" \/>/)
})

test('selection action bar keeps Clear neutral and without shift metadata tooltip', () => {
  assert.match(source, /props\.shiftCodeOptions\.filter\(\(code\) => code && code !== 'Clear'\)/)
  assert.match(
    source,
    /<button[\s\S]*class="rounded-md border border-slate-200 bg-white px-3 py-1\.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"[\s\S]*:aria-disabled="readonly \? 'true' : 'false'"[\s\S]*handleActionClick\('Clear'\)/,
  )
  assert.match(source, /:tabindex="readonly \? -1 : 0"/)
  assert.doesNotMatch(source, /getShiftPresentation\('Clear'\)/)
  assert.doesNotMatch(source, /getShiftMeaning\('Clear'\)/)
})
