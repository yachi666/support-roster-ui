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

  assert.equal(groups.length, 2)
  assert.equal(groups[0].month, '2026年4月')
  assert.deepEqual(
    groups[0].items.map((item) => item.id),
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
  assert.equal(groups[1].month, '2026年3月')
})

test('localizes product updates and labels for English', () => {
  const updates = localizeProductUpdates(productUpdates, 'en')
  const groups = groupProductUpdatesByMonth(updates, 'en')

  assert.equal(updates[0].title, 'Viewer external systems drawer')
  assert.equal(updates[0].sections[0].title, 'New capability')
  assert.equal(getProductUpdateTypeLabel('feature', 'en'), 'New')
  assert.equal(
    formatProductUpdateModuleList(['contact', 'viewer'], 'en'),
    'Contact information, Viewer',
  )
  assert.equal(groups[0].month, 'April 2026')
})
