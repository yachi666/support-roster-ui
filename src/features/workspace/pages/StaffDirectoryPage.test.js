import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./StaffDirectoryPage.vue', import.meta.url), 'utf8')

test('staff directory opens and highlights the routed staff record', () => {
  assert.match(source, /import \{ useRoute \} from 'vue-router'/)
  assert.match(source, /const highlightedStaffId = shallowRef\(null\)/)
  assert.match(
    source,
    /function focusStaffFromRoute\(\) \{[\s\S]*route\.query\.focusStaffId[\s\S]*openDetailDrawer\(focusStaffId\)/,
  )
  assert.match(
    source,
    /watch\(\[filteredStaff, \(\) => route\.query\.focusStaffId\],[\s\S]*focusStaffFromRoute/,
  )
  assert.match(source, /:data-workspace-staff-id="String\(staff\.id\)"/)
  assert.match(source, /highlightedStaffId === staff\.id/)
})
