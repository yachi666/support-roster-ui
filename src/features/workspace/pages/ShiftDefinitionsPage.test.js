import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./ShiftDefinitionsPage.vue', import.meta.url), 'utf8')

test('shift definitions handle long codes gracefully and focus routed records', () => {
  assert.match(source, /import \{ computed, nextTick, onMounted, reactive, shallowRef, watch \} from 'vue'/)
  assert.match(source, /import \{ useRoute \} from 'vue-router'/)
  assert.match(source, /const highlightedShiftId = shallowRef\(null\)/)
  assert.match(
    source,
    /function focusShiftFromRoute\(\) \{[\s\S]*route\.query\.focusShiftId[\s\S]*openShiftDrawer\(targetShift\)/,
  )
  assert.match(source, /:data-workspace-shift-id="String\(shift\.id\)"/)
  assert.match(source, /:title="shift\.code"/)
  assert.match(
    source,
    /class="inline-flex min-h-\[32px\] max-w-\[9rem\] items-center justify-center truncate rounded border/,
  )
})
