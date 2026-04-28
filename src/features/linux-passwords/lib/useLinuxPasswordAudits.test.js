import test from 'node:test'
import assert from 'node:assert/strict'

import { createLinuxPasswordAuditsModel } from './useLinuxPasswordAudits.js'

function createDependencies(overrides = {}) {
  const calls = []
  const defaultResponse = {
    items: [{ id: '1', staffName: 'Alice', action: 'VIEW', result: 'SUCCESS' }],
    total: 40,
    page: 1,
    pageSize: 20,
  }

  const api = {
    workspace: {
      getLinuxPasswordAccessAudits: async (params) => {
        calls.push(['getLinuxPasswordAccessAudits', params])
        if (overrides.apiResponse) {
          return overrides.apiResponse
        }
        return defaultResponse
      },
    },
  }

  return {
    api,
    t: (key, params = {}) => `${key}:${JSON.stringify(params)}`,
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

// ── blank-filter cleaning / request shaping ──────────────────────────────────

test('loadAudits omits blank filter fields from request params', async () => {
  const deps = createDependencies()
  const model = createLinuxPasswordAuditsModel(deps)

  model.filters.keyword = 'alice'
  model.filters.staffId = ''
  model.filters.hostname = '   '

  await model.loadAudits()

  const [, params] = deps.calls[0]
  assert.equal(params.keyword, 'alice')
  assert.ok(!Object.prototype.hasOwnProperty.call(params, 'staffId'), 'blank staffId should be omitted')
  assert.ok(!Object.prototype.hasOwnProperty.call(params, 'hostname'), 'whitespace-only hostname should be omitted')
})

test('loadAudits always sends page and pageSize even when all filters are blank', async () => {
  const deps = createDependencies()
  const model = createLinuxPasswordAuditsModel(deps)

  await model.loadAudits()

  const [, params] = deps.calls[0]
  assert.equal(params.page, '1')
  assert.equal(params.pageSize, '20')
})

test('loadAudits stores items and total from response', async () => {
  const deps = createDependencies()
  const model = createLinuxPasswordAuditsModel(deps)

  await model.loadAudits()

  assert.equal(model.items.length, 1)
  assert.equal(model.items[0].staffName, 'Alice')
  assert.equal(model.total, 40)
})

// ── searchAudits() resets to page 1 ─────────────────────────────────────────

test('searchAudits resets page to 1 before fetching', async () => {
  const deps = createDependencies()
  const model = createLinuxPasswordAuditsModel(deps)

  // Simulate being on page 3
  model.page = 3

  await model.searchAudits()

  const [, params] = deps.calls[0]
  assert.equal(params.page, '1', 'searchAudits must reset to page 1')
  assert.equal(model.page, 1)
})

test('searchAudits passes current filter values in the request', async () => {
  const deps = createDependencies()
  const model = createLinuxPasswordAuditsModel(deps)

  model.filters.staffId = 'S001'
  model.filters.action = 'COPY'

  await model.searchAudits()

  const [, params] = deps.calls[0]
  assert.equal(params.staffId, 'S001')
  assert.equal(params.action, 'COPY')
})

// ── goToPage() clamping ──────────────────────────────────────────────────────

function createPageEchoApi() {
  const calls = []
  const api = {
    workspace: {
      getLinuxPasswordAccessAudits: async (params) => {
        calls.push(['getLinuxPasswordAccessAudits', params])
        const requestedPage = Number(params.page) || 1
        return { items: [], total: 40, page: requestedPage, pageSize: 20 }
      },
    },
  }
  return { api, calls }
}

test('goToPage clamps to totalPages when given an out-of-range value', async () => {
  const { api, calls } = createPageEchoApi()
  const model = createLinuxPasswordAuditsModel({ api, t: (key) => key })

  // Load first to establish total=40, pageSize=20 → totalPages=2
  await model.loadAudits()
  calls.length = 0

  await model.goToPage(999)

  assert.equal(model.page, 2)
  assert.equal(calls.length, 1)
  assert.equal(calls[0][1].page, '2')
})

test('goToPage clamps to 1 when given 0 or negative', async () => {
  const { api, calls } = createPageEchoApi()
  const model = createLinuxPasswordAuditsModel({ api, t: (key) => key })

  await model.loadAudits()
  calls.length = 0

  await model.goToPage(0)

  assert.equal(model.page, 1)
  // already on page 1, so no additional fetch
  assert.equal(calls.length, 0)
})

test('goToPage navigates to page 2 when total allows it', async () => {
  const { api, calls } = createPageEchoApi()
  const model = createLinuxPasswordAuditsModel({ api, t: (key) => key })

  await model.loadAudits()
  calls.length = 0

  await model.goToPage(2)

  assert.equal(model.page, 2)
  assert.equal(calls.length, 1)
  assert.equal(calls[0][1].page, '2')
})

test('goToPage does not fetch when already on the requested page', async () => {
  const { api, calls } = createPageEchoApi()
  const model = createLinuxPasswordAuditsModel({ api, t: (key) => key })

  await model.loadAudits()
  calls.length = 0

  await model.goToPage(1)

  assert.equal(calls.length, 0, 'should not re-fetch when already on page 1')
})

// ── resetFilters() restoring defaults and reloading ─────────────────────────

test('resetFilters clears all filter fields to empty string', async () => {
  const deps = createDependencies()
  const model = createLinuxPasswordAuditsModel(deps)

  model.filters.keyword = 'search-term'
  model.filters.staffId = 'S001'
  model.filters.action = 'VIEW'
  model.filters.result = 'SUCCESS'
  model.filters.from = '2024-01-01'
  model.filters.to = '2024-12-31'

  await model.resetFilters()

  assert.equal(model.filters.keyword, '')
  assert.equal(model.filters.staffId, '')
  assert.equal(model.filters.action, '')
  assert.equal(model.filters.result, '')
  assert.equal(model.filters.from, '')
  assert.equal(model.filters.to, '')
})

test('resetFilters resets page to 1 and triggers a reload', async () => {
  const deps = createDependencies()
  const model = createLinuxPasswordAuditsModel(deps)

  model.page = 5

  await model.resetFilters()

  assert.equal(model.page, 1)
  assert.ok(deps.calls.length >= 1, 'resetFilters must reload')
  const [, params] = deps.calls[0]
  assert.equal(params.page, '1')
})

test('resetFilters restores all default filter keys including staffName, ip, username, hostname', async () => {
  const deps = createDependencies()
  const model = createLinuxPasswordAuditsModel(deps)

  model.filters.staffName = 'Bob'
  model.filters.ip = '10.0.0.1'
  model.filters.username = 'root'
  model.filters.hostname = 'prod-01'

  await model.resetFilters()

  assert.equal(model.filters.staffName, '')
  assert.equal(model.filters.ip, '')
  assert.equal(model.filters.username, '')
  assert.equal(model.filters.hostname, '')
})

// ── error handling ───────────────────────────────────────────────────────────

test('loadAudits sets statusMessage and rethrows on API error', async () => {
  const api = {
    workspace: {
      getLinuxPasswordAccessAudits: async () => {
        throw new Error('network failure')
      },
    },
  }
  const model = createLinuxPasswordAuditsModel({
    api,
    t: (key) => key,
  })

  await assert.rejects(
    () => model.loadAudits(),
    (err) => err.message === 'network failure',
  )

  assert.equal(model.statusMessage, 'network failure')
})

test('loadAudits clears statusMessage at start so previous errors disappear on success', async () => {
  const api = {
    workspace: {
      getLinuxPasswordAccessAudits: async () => {
        throw new Error('first failure')
      },
    },
  }
  const model = createLinuxPasswordAuditsModel({ api, t: (key) => key })

  try { await model.loadAudits() } catch {}
  assert.equal(model.statusMessage, 'first failure')

  // Now fix the API and reload
  api.workspace.getLinuxPasswordAccessAudits = async () => ({
    items: [],
    total: 0,
    page: 1,
    pageSize: 20,
  })

  await model.loadAudits()

  assert.equal(model.statusMessage, '')
})

test('loadAudits falls back to composable error message key when API error has no message', async () => {
  const api = {
    workspace: {
      getLinuxPasswordAccessAudits: async () => {
        throw {}
      },
    },
  }
  const model = createLinuxPasswordAuditsModel({ api, t: (key) => key })

  try { await model.loadAudits() } catch {}

  assert.equal(model.statusMessage, 'linuxPasswords.audit.loadFailed')
})

// ── computed helpers ─────────────────────────────────────────────────────────

test('hasActiveFilters is false when all filters are empty', async () => {
  const deps = createDependencies()
  const model = createLinuxPasswordAuditsModel(deps)

  assert.equal(model.hasActiveFilters, false)
})

test('hasActiveFilters is true when any filter has a non-empty value', async () => {
  const deps = createDependencies()
  const model = createLinuxPasswordAuditsModel(deps)

  model.filters.action = 'VIEW'

  assert.equal(model.hasActiveFilters, true)
})

test('totalPages is at least 1 even when total is 0', async () => {
  const api = {
    workspace: {
      getLinuxPasswordAccessAudits: async () => ({ items: [], total: 0, page: 1, pageSize: 20 }),
    },
  }
  const model = createLinuxPasswordAuditsModel({ api, t: (key) => key })

  await model.loadAudits()

  assert.equal(model.totalPages, 1)
})

test('isLoading is true during fetch and false after', async () => {
  const deferred = createDeferred()
  const api = {
    workspace: {
      getLinuxPasswordAccessAudits: () => deferred.promise,
    },
  }
  const model = createLinuxPasswordAuditsModel({ api, t: (key) => key })

  const loadPromise = model.loadAudits()
  assert.equal(model.isLoading, true)

  deferred.resolve({ items: [], total: 0, page: 1, pageSize: 20 })
  await loadPromise

  assert.equal(model.isLoading, false)
})
