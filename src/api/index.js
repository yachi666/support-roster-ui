const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText || 'An error occurred',
      }))
      throw new Error(error.message || 'Request failed')
    }

    return await response.json()
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
}
