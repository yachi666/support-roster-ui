import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./ValidationCenterPage.vue', import.meta.url), 'utf8')

test('validation center bulk actions include previewable cleanup issues and aggregate remediation previews', () => {
  assert.match(
    source,
    /const selectedFixableIssues = computed\(\(\) =>[\s\S]*selectedIssueIds\.value[\s\S]*canFixIssue\(issue\)/,
  )
  assert.match(
    source,
    /const selectedPreviewableIssues = computed\(\(\) =>[\s\S]*selectedFixableIssues\.value[\s\S]*canPreviewRemediation\(issue\)/,
  )
  assert.match(
    source,
    /function resolveSelectedIssues\(\) \{[\s\S]*selectedPreviewableIssues\.value\.length[\s\S]*openRemediationModal\(\{[\s\S]*issues: selectedPreviewableIssues\.value/,
  )
  assert.match(source, /remediationPreview\.records \|\| \[\]/)
})

test('validation center preserves workspace query state and adds focus params for related records', () => {
  assert.match(source, /import \{ RouterLink, useRoute \} from 'vue-router'/)
  assert.match(
    source,
    /function buildIssueTargetRoute\(issue\) \{[\s\S]*\.\.\.route\.query[\s\S]*focusStaffId[\s\S]*focusShiftId[\s\S]*focusDay/,
  )
  assert.match(source, /:to="buildIssueTargetRoute\(prioritizedIssue\)"/)
  assert.match(source, /:to="buildIssueTargetRoute\(issue\)"/)
})
