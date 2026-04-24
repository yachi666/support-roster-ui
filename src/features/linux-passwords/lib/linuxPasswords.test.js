import test from 'node:test'
import assert from 'node:assert/strict'

import { mockServers } from '../data/mockServers.js'
import {
  createLinuxPasswordServer,
  filterLinuxPasswordServers,
  listLinuxPasswordUnits,
  mergeLinuxPasswordDirectories,
} from './linuxPasswords.js'

test('listLinuxPasswordUnits merges built-in folders and server business units', () => {
  assert.deepEqual(
    listLinuxPasswordUnits(mockServers).slice(0, 6),
    ['Database', 'Finance', 'Human Resources', 'Infrastructure', 'Marketing', 'Web'],
  )
})

test('filterLinuxPasswordServers matches selected unit and search term', () => {
  const result = filterLinuxPasswordServers(mockServers, {
    selectedUnit: 'Infrastructure',
    search: 'proxy',
  })

  assert.deepEqual(result.map((server) => server.id), ['srv-7'])
})

test('createLinuxPasswordServer normalizes form input into a new local record', () => {
  const next = createLinuxPasswordServer({
    hostname: ' prod-web-99 ',
    ip: '10.9.9.9',
    username: 'root',
    password: 'TopSecret!23',
    folders: ['Web', 'Infrastructure'],
  })

  assert.equal(next.hostname, 'prod-web-99')
  assert.equal(next.passwordHash, 'TopSecret!23')
  assert.deepEqual(next.businessUnits, ['Web', 'Infrastructure'])
  assert.equal(next.status, 'online')
  assert.match(next.id, /^srv-/)
})

test('mergeLinuxPasswordDirectories trims and deduplicates checked and typed directories', () => {
  assert.deepEqual(
    mergeLinuxPasswordDirectories([' Web ', 'Infrastructure', 'Web'], '  Database  '),
    ['Web', 'Infrastructure', 'Database'],
  )
})

test('mergeLinuxPasswordDirectories falls back to Uncategorized when nothing is selected', () => {
  assert.deepEqual(
    mergeLinuxPasswordDirectories([], '   '),
    ['Uncategorized'],
  )
})
