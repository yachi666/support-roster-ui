const AUTH_TOKEN_KEY = 'support-roster-auth-token'

function normalizeAuthToken(token) {
  if (!token) {
    return ''
  }

  return String(token).replace(/^Bearer\s+/i, '').trim()
}

export function getAuthToken() {
  return normalizeAuthToken(window.localStorage.getItem(AUTH_TOKEN_KEY) || '')
}

export function getAuthTokenHeader() {
  const token = getAuthToken()
  return token ? `Bearer ${token}` : ''
}

export function setAuthToken(token) {
  const normalizedToken = normalizeAuthToken(token)

  if (!normalizedToken) {
    clearAuthToken()
    return
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, normalizedToken)
}

export function clearAuthToken() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
}
