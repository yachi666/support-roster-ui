const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

class ApiError extends Error {
  constructor(message, details = {}) {
    super(message)
    this.name = 'ApiError'
    Object.assign(this, details)
  }
}

function isFormDataBody(body) {
  return typeof FormData !== 'undefined' && body instanceof FormData
}

async function parseResponse(response, responseType = 'json') {
  if (response.status === 204) {
    return null
  }

  if (responseType === 'blob') {
    return response.blob()
  }

  if (responseType === 'text') {
    return response.text()
  }

  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  if (contentType.startsWith('text/')) {
    return response.text()
  }

  return response.text()
}

async function parseErrorResponse(response) {
  const payload = await response.text()

  let parsedPayload = null
  let message = response.statusText || 'Request failed'

  if (!payload) {
    return {
      status: response.status,
      statusText: response.statusText,
      message,
      payload: null,
    }
  }

  try {
    parsedPayload = JSON.parse(payload)
    message = parsedPayload.message || parsedPayload.error || message
  } catch {
    message = payload
  }

  return {
    status: response.status,
    statusText: response.statusText,
    message,
    payload: parsedPayload,
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const { responseType = 'json', headers = {}, body, ...restOptions } = options
  const normalizedBody = isFormDataBody(body) || typeof body === 'string' || body == null
    ? body
    : JSON.stringify(body)
  
  const config = {
    ...restOptions,
    headers: {
      ...headers,
    },
  }

  if (normalizedBody !== undefined) {
    config.body = normalizedBody
  }

  if (!isFormDataBody(normalizedBody) && normalizedBody !== undefined && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json'
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorDetails = await parseErrorResponse(response)
      throw new ApiError(errorDetails.message, errorDetails)
    }

    return await parseResponse(response, responseType)
  } catch (error) {
    console.error(`API request failed: ${url}`, error)
    throw error
  }
}

export const api = {
  getTeams: () => request('/teams'),
  
  getShifts: (date, teamId = null, timezone = 'UTC') => {
    const params = new URLSearchParams({ date, timezone })
    if (teamId) params.append('teamId', teamId)
    return request(`/shifts?${params.toString()}`)
  },
  
  getShiftById: (id) => request(`/shifts/${id}`),
  
  getAllStaff: () => request('/staff'),
  
  getStaffById: (id) => request(`/staff/${id}`),
  
  getRoleGroups: () => request('/role-groups'),
  
  getShiftCodes: () => request('/shift-codes'),

  workspace: {
    getOverview: () => request('/workspace/overview'),

    getRoleGroups: () => request('/workspace/role-groups'),

    getStaff: (keyword = '') => {
      const params = new URLSearchParams()

      if (keyword.trim()) {
        params.set('keyword', keyword.trim())
      }

      const query = params.toString()
      return request(`/workspace/staff${query ? `?${query}` : ''}`)
    },

    getStaffById: (id) => request(`/workspace/staff/${id}`),

    createStaff: (payload) => request('/workspace/staff', {
      method: 'POST',
      body: payload,
    }),

    updateStaff: (id, payload) => request(`/workspace/staff/${id}`, {
      method: 'PUT',
      body: payload,
    }),

    deleteStaff: (id) => request(`/workspace/staff/${id}`, {
      method: 'DELETE',
    }),

    getShiftDefinitions: (keyword = '') => {
      const params = new URLSearchParams()

      if (keyword.trim()) {
        params.set('keyword', keyword.trim())
      }

      const query = params.toString()
      return request(`/workspace/shift-definitions${query ? `?${query}` : ''}`)
    },

    createShiftDefinition: (payload) => request('/workspace/shift-definitions', {
      method: 'POST',
      body: payload,
    }),

    updateShiftDefinition: (id, payload) => request(`/workspace/shift-definitions/${id}`, {
      method: 'PUT',
      body: payload,
    }),

    deleteShiftDefinition: (id) => request(`/workspace/shift-definitions/${id}`, {
      method: 'DELETE',
    }),

    getTeams: () => request('/workspace/teams'),

    createTeam: (payload) => request('/workspace/teams', {
      method: 'POST',
      body: payload,
    }),

    updateTeam: (id, payload) => request(`/workspace/teams/${id}`, {
      method: 'PUT',
      body: payload,
    }),

    deleteTeam: (id) => request(`/workspace/teams/${id}`, {
      method: 'DELETE',
    }),

    getRoster: (year, month) => request(`/workspace/roster?year=${year}&month=${month}`),

    saveRoster: (payload) => request('/workspace/roster/save', {
      method: 'POST',
      body: payload,
    }),

    getValidation: (year, month) => request(`/workspace/validation?year=${year}&month=${month}`),

    resolveValidationIssues: (payload) => request('/workspace/validation/resolve', {
      method: 'POST',
      body: payload,
    }),

    previewImport: (formData) => request('/workspace/import-export/preview', {
      method: 'POST',
      body: formData,
    }),

    applyImport: (batchId, operator = '') => {
      const params = new URLSearchParams()

      if (operator.trim()) {
        params.set('operator', operator.trim())
      }

      const query = params.toString()
      return request(`/workspace/import-export/${batchId}/apply${query ? `?${query}` : ''}`, {
        method: 'POST',
      })
    },

    exportRoster: (year, month) => request(`/workspace/import-export/export?year=${year}&month=${month}`, {
      responseType: 'blob',
    }),

    downloadTemplate: () => request('/workspace/import-export/template', {
      responseType: 'blob',
    }),
  },
}
