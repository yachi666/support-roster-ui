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
              credentials: [{ id: 'cred-1', username: 'admin', hasPassword: true }],
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
      revealLinuxPasswordCredential: async (credentialId, action) => {
        calls.push(['revealLinuxPasswordCredential', credentialId, action])
        return { password: 'Proxy@Infra99' }
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
  assert.deepEqual(model.servers[0].credentials, [{ id: 'cred-1', username: 'admin', hasPassword: true }])
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
    credentials: [{ username: 'root', password: 'TopSecret!23' }],
    businessUnits: ['Web', 'Infrastructure'],
  })

  assert.deepEqual(deps.calls[0], ['createLinuxPassword', {
    hostname: 'prod-web-99',
    ip: '10.9.9.9',
    credentials: [{ id: undefined, username: 'root', password: 'TopSecret!23', notes: '' }],
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
    credentials: [{ id: 'cred-1', username: 'admin', hasPassword: true }],
    businessUnits: ['Infrastructure'],
    status: 'online',
  })

  await model.submitForm({
    hostname: 'infra-proxy-01',
    ip: '10.0.1.2',
    credentials: [{ id: 'cred-1', username: 'admin', password: '' }],
    businessUnits: ['Infrastructure'],
    status: 'offline',
  })

  assert.deepEqual(deps.calls[0], ['updateLinuxPassword', '1', {
    hostname: 'infra-proxy-01',
    ip: '10.0.1.2',
    credentials: [{ id: 'cred-1', username: 'admin', password: '', notes: '' }],
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
        revealLinuxPasswordCredential: async () => ({ password: '' }),
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

test('togglePassword reveals secret on demand and hides without refetching', async () => {
  const deps = createDependencies()
  const model = createLinuxPasswordsModel(deps)

  await model.togglePassword({ id: 'cred-1', username: 'admin' })

  assert.deepEqual(deps.calls[0], ['revealLinuxPasswordCredential', 'cred-1', 'VIEW'])
  assert.equal(model.revealedPasswords['cred-1'], 'Proxy@Infra99')
  assert.equal(model.visiblePasswords['cred-1'], true)

  await model.togglePassword({ id: 'cred-1', username: 'admin' })

  assert.equal(deps.calls.length, 1)
  assert.equal(model.visiblePasswords['cred-1'], false)
})

test('copyPassword requests copy audit action before writing clipboard', async () => {
  const deps = createDependencies()
  const model = createLinuxPasswordsModel(deps)
  const writes = []

  await model.copyPassword({
    id: '1',
    hostname: 'infra-proxy-01',
    credential: { id: 'cred-1', username: 'admin' },
  }, {
    writeText: async (value) => writes.push(value),
  })

  assert.deepEqual(deps.calls[0], ['revealLinuxPasswordCredential', 'cred-1', 'COPY'])
  assert.deepEqual(writes, ['Proxy@Infra99'])
  assert.equal(model.copiedServerId, 'cred-1')
})

test('togglePassword ignores a second reveal request while the first is still in flight', async () => {
  const deferred = createDeferred()
  let revealCallCount = 0
  const model = createLinuxPasswordsModel({
    api: {
      workspace: {
        getLinuxPasswords: async () => ({ items: [] }),
        getLinuxPasswordDirectories: async () => [],
        createLinuxPassword: async () => null,
        updateLinuxPassword: async () => null,
        deleteLinuxPassword: async () => null,
        revealLinuxPasswordCredential: async (credentialId, action) => {
          revealCallCount += 1
          return deferred.promise
        },
      },
    },
    authStore: { isAdmin: false },
    t: (key, params = {}) => `${key}:${JSON.stringify(params)}`,
    confirmDelete: async () => true,
  })

  // Fire two toggle calls concurrently before the first resolves
  const first = model.togglePassword({ id: 'cred-1', username: 'admin' })
  const second = model.togglePassword({ id: 'cred-1', username: 'admin' })

  deferred.resolve({ password: 'Secret99' })
  await first
  await second

  assert.equal(revealCallCount, 1, 'backend should only be called once despite two concurrent toggles')
})

test('loadServers clears visiblePasswords and revealedPasswords on successful reload', async () => {
  const deps = createDependencies()
  const model = createLinuxPasswordsModel(deps)

  // Pre-populate caches by toggling password
  await model.togglePassword({ id: 'cred-1', username: 'admin' })
  assert.equal(model.revealedPasswords['cred-1'], 'Proxy@Infra99')
  assert.equal(model.visiblePasswords['cred-1'], true)

  // Reload servers — caches should be cleared
  await model.loadServers()

  assert.deepEqual(model.revealedPasswords, {})
  assert.deepEqual(model.visiblePasswords, {})
})
