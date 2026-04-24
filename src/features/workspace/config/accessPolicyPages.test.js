import test from 'node:test'
import assert from 'node:assert/strict'

import {
  ACCESS_POLICY_PAGES,
  buildDefaultWorkspaceAccessPolicy,
  getAccessPolicyPageDefinition,
} from './accessPolicyPages.js'

test('linux-passwords is configurable and protected by default', () => {
  const page = getAccessPolicyPageDefinition('linux-passwords')

  assert.equal(page.pageCode, 'linux-passwords')
  assert.equal(page.route, '/linux-passwords')
  assert.equal(page.authRequired, true)
  assert.equal(page.configurable, true)
  assert.equal(page.includeInWorkspaceNavigation, false)
})

test('default policy keeps existing workspace pages and appends linux-passwords', () => {
  assert.deepEqual(
    buildDefaultWorkspaceAccessPolicy().map(({ pageCode, authRequired, configurable }) => ({
      pageCode,
      authRequired,
      configurable,
    })),
    [
      { pageCode: 'overview', authRequired: false, configurable: true },
      { pageCode: 'roster', authRequired: false, configurable: true },
      { pageCode: 'staff', authRequired: false, configurable: true },
      { pageCode: 'shifts', authRequired: false, configurable: true },
      { pageCode: 'teams', authRequired: false, configurable: true },
      { pageCode: 'accounts', authRequired: true, configurable: false },
      { pageCode: 'import-export', authRequired: false, configurable: true },
      { pageCode: 'validation', authRequired: false, configurable: true },
      { pageCode: 'linux-passwords', authRequired: true, configurable: true },
    ],
  )
})

test('registry still contains every configurable page exactly once', () => {
  const codes = ACCESS_POLICY_PAGES.map((page) => page.pageCode)
  assert.equal(new Set(codes).size, codes.length)
})
