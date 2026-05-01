import test from 'node:test'
import assert from 'node:assert/strict'
import {
  formatProductUpdateModuleList,
  getProductUpdateTypeLabel,
  groupProductUpdatesByMonth,
  localizeProductUpdates,
  productUpdates,
} from './productUpdates.js'

test('groups product updates by release month', () => {
  const groups = groupProductUpdatesByMonth(productUpdates, 'zh-CN')

  assert.equal(groups.length, 3)
  assert.equal(groups[0].month, '2026年5月')
  assert.deepEqual(
    groups[0].items.map((item) => item.id),
    ['2026-05-01-roster-save-actions', '2026-05-01-workspace-motion-feedback'],
  )
  assert.equal(groups[1].month, '2026年4月')
  assert.deepEqual(
    groups[1].items.map((item) => item.id),
    [
      '2026-04-28-viewer-external-systems-drawer',
      '2026-04-27-linux-password-audit',
      '2026-04-27-viewer-product-updates-entry',
      '2026-04-26-contact-information',
      '2026-04-24-linux-passwords',
      '2026-04-13-teams-contact',
      '2026-04-10-roster-preview',
      '2026-04-03-search-validation',
    ],
  )
  assert.equal(groups[2].month, '2026年3月')
})

test('localizes product updates and labels for English', () => {
  const updates = localizeProductUpdates(productUpdates, 'en')
  const groups = groupProductUpdatesByMonth(updates, 'en')

  assert.equal(updates[0].title, 'Roster save actions moved above the grid')
  assert.equal(updates[0].sections[0].title, 'Experience improvements')
  assert.equal(getProductUpdateTypeLabel('feature', 'en'), 'New')
  assert.equal(
    formatProductUpdateModuleList(['contact', 'viewer'], 'en'),
    'Contact information, Viewer',
  )
  assert.equal(groups[0].month, 'May 2026')
})

test('includes the workspace motion feedback release note in both locales', () => {
  const zhUpdates = localizeProductUpdates(productUpdates, 'zh-CN')
  const enUpdates = localizeProductUpdates(productUpdates, 'en')
  const zhEntry = zhUpdates.find((item) => item.id === '2026-05-01-workspace-motion-feedback')
  const enEntry = enUpdates.find((item) => item.id === '2026-05-01-workspace-motion-feedback')

  assert.ok(zhEntry)
  assert.equal(zhEntry.type, 'improvement')
  assert.deepEqual(zhEntry.modules, ['workspace', 'roster'])
  assert.equal(zhEntry.title, '工作台动效与排班反馈更聚焦')
  assert.equal(zhEntry.sections[0].title, '体验优化')

  assert.ok(enEntry)
  assert.equal(enEntry.title, 'Workspace motion and roster feedback feel more focused')
  assert.equal(enEntry.sections[0].title, 'Experience improvements')
})
