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
    [
      '2026-05-09-viewer-shift-ordering',
      '2026-05-09-workspace-validation-navigation',
      '2026-05-01-roster-save-actions',
      '2026-05-01-workspace-motion-feedback',
    ],
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
  const newestUpdate = updates.find((item) => item.id === '2026-05-09-viewer-shift-ordering')
  const validationUpdate = updates.find((item) => item.id === '2026-05-09-workspace-validation-navigation')

  assert.ok(newestUpdate)
  assert.equal(newestUpdate.title, 'Viewer details expand better and shift order is team-aware')
  assert.equal(newestUpdate.sections[0].title, 'Experience improvements')
  assert.ok(validationUpdate)
  assert.equal(validationUpdate.title, 'Workspace validation fixes are more direct')
  assert.equal(getProductUpdateTypeLabel('feature', 'en'), 'New')
  assert.equal(
    formatProductUpdateModuleList(['contact', 'viewer'], 'en'),
    'Contact information, Viewer',
  )
  assert.equal(groups[0].month, 'May 2026')
})

test('includes the roster editing and workspace motion feedback release notes in both locales', () => {
  const zhUpdates = localizeProductUpdates(productUpdates, 'zh-CN')
  const enUpdates = localizeProductUpdates(productUpdates, 'en')
  const zhRosterEntry = zhUpdates.find((item) => item.id === '2026-05-01-roster-save-actions')
  const enRosterEntry = enUpdates.find((item) => item.id === '2026-05-01-roster-save-actions')
  const zhEntry = zhUpdates.find((item) => item.id === '2026-05-01-workspace-motion-feedback')
  const enEntry = enUpdates.find((item) => item.id === '2026-05-01-workspace-motion-feedback')

  assert.ok(zhRosterEntry)
  assert.equal(zhRosterEntry.title, '月度排班直接编辑更轻量')
  assert.equal(zhRosterEntry.sections[0].items[0], '月度排班页现在使用更轻的直接编辑流程，选择单元格后不再打开右侧抽屉，班次按钮会先写入本地工作副本，再由页面头部的 Save Changes 统一保存。')
  assert.equal(zhRosterEntry.sections[0].items[1], '表格上方的班次按钮沿用网格里按团队区分的颜色呈现。')
  assert.equal(zhRosterEntry.sections[0].items[2], '班次按钮在 hover 和 focus 时会复用网格 tooltip 的信息与视觉样式。')
  assert.equal(zhRosterEntry.sections[0].items[3], 'Clear 保持中性，不展示任何班次元数据。')

  assert.ok(enRosterEntry)
  assert.equal(enRosterEntry.sections[0].items[0], 'Monthly roster now uses a lighter direct-editing flow, so selecting a cell no longer opens the right drawer and shift buttons stage changes into the local working copy before the header Save Changes action commits them.')
  assert.equal(enRosterEntry.sections[0].items[1], "The shift buttons above the grid reuse the roster grid's team-aware color presentation.")
  assert.equal(enRosterEntry.sections[0].items[2], 'Hovering or focusing a shift button reuses the roster grid tooltip information and visual treatment.')
  assert.equal(enRosterEntry.sections[0].items[3], 'Clear stays neutral and does not show shift metadata.')

  assert.ok(zhEntry)
  assert.equal(zhEntry.type, 'improvement')
  assert.deepEqual(zhEntry.modules, ['workspace', 'roster'])
  assert.equal(zhEntry.title, '工作台动效与排班反馈更聚焦')
  assert.equal(zhEntry.sections[0].title, '体验优化')

  assert.ok(enEntry)
  assert.equal(enEntry.title, 'Workspace motion and roster feedback feel more focused')
  assert.equal(enEntry.sections[0].title, 'Experience improvements')
})
