import test from 'node:test'
import assert from 'node:assert/strict'

import * as navigation from './navigation.js'

test('resolveSafeAppRedirectPath keeps top-level app routes like linux-passwords', () => {
  assert.equal(
    navigation.resolveSafeAppRedirectPath?.('/linux-passwords', navigation.WORKSPACE_ENTRY_PATH),
    '/linux-passwords',
  )
})

test('resolveSafeAppRedirectPath falls back for non-app redirect targets', () => {
  assert.equal(
    navigation.resolveSafeAppRedirectPath?.('https://example.com/linux-passwords', navigation.WORKSPACE_ENTRY_PATH),
    navigation.WORKSPACE_ENTRY_PATH,
  )
  assert.equal(
    navigation.resolveSafeAppRedirectPath?.('//example.com/linux-passwords', navigation.WORKSPACE_ENTRY_PATH),
    navigation.WORKSPACE_ENTRY_PATH,
  )
  assert.equal(
    navigation.resolveSafeAppRedirectPath?.('workspace/overview', navigation.WORKSPACE_ENTRY_PATH),
    navigation.WORKSPACE_ENTRY_PATH,
  )
})
