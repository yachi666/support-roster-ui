import test from 'node:test'
import assert from 'node:assert/strict'
import { computed } from 'vue'

import { createLinuxPasswordsModel } from './useLinuxPasswords.js'

function createDependencies(overrides = {}) {
  const calls = []
  const api = {
    workspace: {
      getLinuxPasswords: async (params = {}) => {
        calls.push(['getLinuxPasswords', params])
        return {
          items: [
            {
              id: '1',
              hostname: 'infra-proxy-01',
              ip: '10.0.1.2',
              username: 'admin',
              password: 'Proxy@Infra99',
              businessUnits: ['Infrastructure', 'Web'],
              status: 'online',
            },
          ],
          businessUnits: ['Database', 'Infrastructure', 'Web'],
        }
      },
      getLinuxPasswordDirectories: async () => {
        calls.push(['getLinuxPasswordDirectories'])
        return ['Database', 'Infrastructure', 'Web']
      },
      createLinuxPassword: async (payload) => {
        calls.push(['createLinuxPassword', payload])
        return null
      },
      updateLinuxPassword: async (id, payload) => {
        calls.push(['updateLinuxPassword', id, payload])
        return null
      },
      deleteLinuxPassword: async (id) => {
        calls.push(['deleteLinuxPassword', id])
        return null
      },
    },
  }

  return {
    api,
    authStore: { isAdmin: false, ...(overrides.authStore || {}) },
    t: (key, params = {}) => `${key}:${JSON.stringify(params)}`,
    confirmDelete: async () => true,
    ...overrides,
    calls,
  }
}

function createDeferred() {
  let resolve
  let reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

test('loadServers requests backend list and stores returned items and business units', async () => {
  const deps = createDependencies()
  const model = createLinuxPasswordsModel(deps)

  model.search = 'proxy'
  model.selectedUnit = 'Infrastructure'

  await model.loadServers()

  assert.deepEqual(deps.calls[0], ['getLinuxPasswords', { search: 'proxy', businessUnit: 'Infrastructure' }])
  assert.equal(model.servers[0].password, 'Proxy@Infra99')
  assert.deepEqual(model.availableUnits, [])
})

test('loadDirectories requests backend directory list and stores returned directories', async () => {
  const deps = createDependencies()
  const model = createLinuxPasswordsModel(deps)

  await model.loadDirectories()

  assert.deepEqual(deps.calls[0], ['getLinuxPasswordDirectories'])
  assert.deepEqual(model.availableUnits, ['Database', 'Infrastructure', 'Web'])
})

test('submitCreate sends create payload, resets add mode, and reloads list', async () => {
  const deps = createDependencies()
  const model = createLinuxPasswordsModel(deps)

  model.openAddForm()

  await model.submitForm({
    hostname: ' prod-web-99 ',
    ip: '10.9.9.9',
    username: 'root',
    password: 'TopSecret!23',
    businessUnits: ['Web', 'Infrastructure'],
  })

  assert.deepEqual(deps.calls[0], ['createLinuxPassword', {
    hostname: 'prod-web-99',
    ip: '10.9.9.9',
    username: 'root',
    password: 'TopSecret!23',
    businessUnits: ['Web', 'Infrastructure'],
  }])
  assert.equal(model.view, 'list')
  assert.match(model.statusMessage, /^linuxPasswords\.savedServer:/)
  assert.deepEqual(deps.calls[1], ['getLinuxPasswords', { search: '', businessUnit: null }])
  assert.deepEqual(deps.calls[2], ['getLinuxPasswordDirectories'])
})

test('openAddForm ignores non-admin users', () => {
  const deps = createDependencies()
  const model = createLinuxPasswordsModel(deps)

  model.openAddForm()

  assert.equal(model.view, 'list')
  assert.equal(model.formMode, 'create')
  assert.equal(model.editingServer, null)
})

test('submitEdit requires admin and sends status with update payload', async () => {
  const deps = createDependencies({ authStore: { isAdmin: true } })
  const model = createLinuxPasswordsModel(deps)

  model.openEditForm({
    id: '1',
    hostname: 'infra-proxy-01',
    ip: '10.0.1.2',
    username: 'admin',
    password: 'Proxy@Infra99',
    businessUnits: ['Infrastructure'],
    status: 'online',
  })

  await model.submitForm({
    hostname: 'infra-proxy-01',
    ip: '10.0.1.2',
    username: 'admin',
    password: 'Proxy@Infra99',
    businessUnits: ['Infrastructure'],
    status: 'offline',
  })

  assert.deepEqual(deps.calls[0], ['updateLinuxPassword', '1', {
    hostname: 'infra-proxy-01',
    ip: '10.0.1.2',
    username: 'admin',
    password: 'Proxy@Infra99',
    businessUnits: ['Infrastructure'],
    status: 'offline',
  }])
  assert.equal(model.canManageServers, true)
})

test('deleteServer confirms first and skips delete when user is not admin', async () => {
  const deps = createDependencies()
  const model = createLinuxPasswordsModel(deps)

  await model.deleteServer({ id: '1', hostname: 'infra-proxy-01' })

  assert.equal(deps.calls.length, 0)
  assert.equal(model.canManageServers, false)
})

test('deleteServer refreshes directories after admin deletion', async () => {
  const deps = createDependencies({ authStore: { isAdmin: true } })
  const model = createLinuxPasswordsModel(deps)

  await model.deleteServer({ id: '1', hostname: 'infra-proxy-01' })

  assert.deepEqual(deps.calls[0], ['deleteLinuxPassword', '1'])
  assert.deepEqual(deps.calls[1], ['getLinuxPasswords', { search: '', businessUnit: null }])
  assert.deepEqual(deps.calls[2], ['getLinuxPasswordDirectories'])
})

test('loadServers keeps the latest response when earlier requests resolve later', async () => {
  const first = createDeferred()
  const second = createDeferred()
  const calls = []
  let requestCount = 0
  const model = createLinuxPasswordsModel({
    api: {
      workspace: {
        getLinuxPasswords: async (params = {}) => {
          calls.push(params)
          requestCount += 1
          return requestCount === 1 ? first.promise : second.promise
        },
        getLinuxPasswordDirectories: async () => [],
        createLinuxPassword: async () => null,
        updateLinuxPassword: async () => null,
        deleteLinuxPassword: async () => null,
      },
    },
    authStore: { isAdmin: true },
    t: (key, params = {}) => `${key}:${JSON.stringify(params)}`,
    confirmDelete: async () => true,
  })

  model.search = 'first'
  const firstLoad = model.loadServers()
  model.search = 'second'
  const secondLoad = model.loadServers()

  second.resolve({
    items: [{ id: 'new', hostname: 'new-host' }],
  })
  await secondLoad

  first.resolve({
    items: [{ id: 'old', hostname: 'old-host' }],
  })
  await firstLoad

  assert.deepEqual(calls, [
    { search: 'first', businessUnit: null },
    { search: 'second', businessUnit: null },
  ])
  assert.deepEqual(model.servers, [{ id: 'new', hostname: 'new-host' }])
})

test('model exposes template-friendly values and respects computed admin refs', () => {
  const deps = createDependencies({
    authStore: {
      isAdmin: computed(() => false),
    },
  })

  const model = createLinuxPasswordsModel(deps)

  assert.equal(model.view, 'list')
  assert.deepEqual(model.availableUnits, [])
  assert.equal(model.canManageServers, false)
})
