import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const routerSource = readFileSync(new URL('./index.js', import.meta.url), 'utf8')

test('router exposes public contact information list and add pages', () => {
  assert.match(
    routerSource,
    /import SupportTeamContactsPage from ['"]@\/features\/contact-information\/pages\/SupportTeamContactsPage\.vue['"]/,
  )
  assert.match(
    routerSource,
    /import SupportTeamContactCreatePage from ['"]@\/features\/contact-information\/pages\/SupportTeamContactCreatePage\.vue['"]/,
  )
  assert.match(routerSource, /path:\s*'\/contact-information'/)
  assert.match(routerSource, /name:\s*'contact-information'/)
  assert.match(routerSource, /children:\s*\[/)
  assert.match(routerSource, /path:\s*'add'/)
  assert.match(routerSource, /name:\s*'contact-information-add'/)
})

test('router exposes standalone product updates page', () => {
  assert.match(
    routerSource,
    /import ProductUpdatesPage from ['"]@\/features\/product-updates\/pages\/ProductUpdatesPage\.vue['"]/,
  )
  assert.match(routerSource, /path:\s*'\/product-updates'/)
  assert.match(routerSource, /name:\s*'product-updates'/)
})

test('router gates linux password audit page to admins', () => {
  assert.match(
    routerSource,
    /import LinuxPasswordAuditPage from ['"]@\/features\/linux-passwords\/pages\/LinuxPasswordAuditPage\.vue['"]/,
  )
  assert.match(routerSource, /path:\s*'\/linux-passwords\/audits'/)
  assert.match(routerSource, /name:\s*'linux-password-audits'/)
  assert.match(routerSource, /meta:\s*\{\s*protectedPageCode:\s*'linux-passwords',\s*requiresAuth:\s*true,\s*roles:\s*\['admin'\]\s*\}/)
})
