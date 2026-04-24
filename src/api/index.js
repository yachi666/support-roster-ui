import { clearAuthToken, getAuthTokenHeader } from '@/lib/authToken'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://supportui.servier/api'

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
  const tokenHeader = getAuthTokenHeader()

  if (tokenHeader && !config.headers.Authorization) {
    config.headers.Authorization = tokenHeader
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
      if (response.status === 401) {
        clearAuthToken()
      }
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
  auth: {
    login: (payload) => request('/auth/login', {
      method: 'POST',
      body: payload,
    }),

    activate: (payload) => request('/auth/activate', {
      method: 'POST',
      body: payload,
    }),

    logout: () => request('/auth/logout', {
      method: 'POST',
    }),

    me: () => request('/auth/me'),

    changePassword: (payload) => request('/auth/change-password', {
      method: 'POST',
      body: payload,
    }),
  },

  getTeams: () => request('/teams'),
  
  getShifts: (date, teamId = null, timezone = 'UTC') => {
    const params = new URLSearchParams({ date, timezone })
    if (teamId) params.append('teamId', teamId)
    return request(`/shifts?${params.toString()}`)
  },
  
  getShiftById: (id) => request(`/shifts/${id}`),
  
  getAllStaff: () => request('/staff'),
  
  getStaffById: (id) => request(`/staff/${id}`),
  
  getShiftCodes: () => request('/shift-codes'),

  workspace: {
    getAccessPolicy: () => request('/workspace/access-policy'),

    updateAccessPolicy: (payload) => request('/workspace/access-policy', {
      method: 'PUT',
      body: payload,
    }),

    getOverview: (year, month) => {
      const params = new URLSearchParams()

      if (year != null) {
        params.set('year', String(year))
      }

      if (month != null) {
        params.set('month', String(month))
      }

      const query = params.toString()
      return request(`/workspace/overview${query ? `?${query}` : ''}`)
    },

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

    createStaffBatch: (payload) => request('/workspace/staff/batch', {
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

    reorderTeams: (teamIds) => request('/workspace/teams/reorder', {
      method: 'POST',
      body: { teamIds },
    }),

    deleteTeam: (id) => request(`/workspace/teams/${id}`, {
      method: 'DELETE',
    }),

    getAccounts: (keyword = '') => {
      const params = new URLSearchParams()

      if (keyword.trim()) {
        params.set('keyword', keyword.trim())
      }

      const query = params.toString()
      return request(`/workspace/accounts${query ? `?${query}` : ''}`)
    },

    getLinuxPasswords: ({ search = '', businessUnit = null } = {}) => {
      const params = new URLSearchParams()

      if (search.trim()) {
        params.set('search', search.trim())
      }
      if (businessUnit && `${businessUnit}`.trim()) {
        params.set('businessUnit', `${businessUnit}`.trim())
      }

      const query = params.toString()
      return request(`/workspace/linux-passwords${query ? `?${query}` : ''}`)
    },

    getLinuxPasswordDirectories: () => request('/workspace/linux-password-directories'),

    getLinuxPassword: (id) => request(`/workspace/linux-passwords/${id}`),

    createLinuxPassword: (payload) => request('/workspace/linux-passwords', {
      method: 'POST',
      body: payload,
    }),

    updateLinuxPassword: (id, payload) => request(`/workspace/linux-passwords/${id}`, {
      method: 'PUT',
      body: payload,
    }),

    deleteLinuxPassword: (id) => request(`/workspace/linux-passwords/${id}`, {
      method: 'DELETE',
    }),

    getAccount: (id) => request(`/workspace/accounts/${id}`),

    createAccount: (payload) => request('/workspace/accounts', {
      method: 'POST',
      body: payload,
    }),

    updateAccount: (id, payload) => request(`/workspace/accounts/${id}`, {
      method: 'PUT',
      body: payload,
    }),

    resetAccountPassword: (id) => request(`/workspace/accounts/${id}/reset-password`, {
      method: 'POST',
    }),

    enableAccount: (id) => request(`/workspace/accounts/${id}/enable`, {
      method: 'POST',
    }),

    disableAccount: (id) => request(`/workspace/accounts/${id}/disable`, {
      method: 'POST',
    }),

    deleteAccount: (id) => request(`/workspace/accounts/${id}`, {
      method: 'DELETE',
    }),

    getRoster: (year, month) => request(`/workspace/roster?year=${year}&month=${month}`),

    saveRoster: (payload) => request('/workspace/roster/save', {
      method: 'POST',
      body: payload,
    }),

    getValidation: (year, month, options = {}) => {
      const params = new URLSearchParams()
      if (year != null) {
        params.set('year', year)
      }
      if (month != null) {
        params.set('month', month)
      }
      if (options.summaryOnly) {
        params.set('summaryOnly', 'true')
      }
      const query = params.toString()
      return request(`/workspace/validation${query ? `?${query}` : ''}`)
    },

    resolveValidationIssues: (payload) => request('/workspace/validation/resolve', {
      method: 'POST',
      body: payload,
    }),

    previewValidationRemediation: (issueId, payload) => request(`/workspace/validation/${issueId}/preview-remediation`, {
      method: 'POST',
      body: payload,
    }),

    applyValidationRemediation: (issueId, payload) => request(`/workspace/validation/${issueId}/apply-remediation`, {
      method: 'POST',
      body: payload,
    }),

    previewImport: (formData) => request('/workspace/import-export/preview', {
      method: 'POST',
      body: formData,
    }),

    saveImportPreview: (payload) => request('/workspace/import-export/save', {
        method: 'POST',
        body: payload,
      }),

    exportRoster: (year, month) => request(`/workspace/import-export/export?year=${year}&month=${month}`, {
      responseType: 'blob',
    }),

    downloadTemplate: () => request('/workspace/import-export/template', {
      responseType: 'blob',
    }),
  },
}
