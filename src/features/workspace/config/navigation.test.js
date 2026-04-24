import test from 'node:test'
import assert from 'node:assert/strict'

import * as navigation from './navigation.js'

test('resolveSafeAppRedirectPath keeps top-level app routes like linux-passwords', () => {
  assert.equal(
    navigation.resolveSafeAppRedirectPath?.('/linux-passwords', navigation.WORKSPACE_ENTRY_PATH),
    '/linux-passwords',
  )
  assert.equal(
    navigation.resolveSafeAppRedirectPath?.('/viewer', navigation.WORKSPACE_ENTRY_PATH),
    '/viewer',
  )
  assert.equal(
    navigation.resolveSafeAppRedirectPath?.('/workspace/overview', navigation.WORKSPACE_ENTRY_PATH),
    '/workspace/overview',
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
  assert.equal(
    navigation.resolveSafeAppRedirectPath?.('/does-not-exist', navigation.WORKSPACE_ENTRY_PATH),
    navigation.WORKSPACE_ENTRY_PATH,
  )
  assert.equal(
    navigation.resolveSafeAppRedirectPath?.('/login', navigation.WORKSPACE_ENTRY_PATH),
    navigation.WORKSPACE_ENTRY_PATH,
  )
})
