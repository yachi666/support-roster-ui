const BASE_UNITS = ['Finance', 'Marketing', 'Infrastructure', 'Human Resources', 'Database', 'Web']

export function mergeLinuxPasswordDirectories(selectedDirectories = [], typedDirectory = '') {
  const merged = [
    ...selectedDirectories,
    typedDirectory,
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean)

  return merged.length ? Array.from(new Set(merged)) : ['Uncategorized']
}

export function listLinuxPasswordUnits(servers = []) {
  return Array.from(new Set([
    ...BASE_UNITS,
    ...servers.flatMap((server) => server.businessUnits || []),
  ])).sort()
}

export function filterLinuxPasswordServers(servers = [], { selectedUnit = 'All', search = '' } = {}) {
  const normalizedSearch = String(search || '').trim().toLowerCase()

  return servers.filter((server) => {
    const matchesUnit = selectedUnit === 'All' || (server.businessUnits || []).includes(selectedUnit)
    const matchesSearch = !normalizedSearch
      || server.hostname.toLowerCase().includes(normalizedSearch)
      || server.ip.includes(normalizedSearch)

    return matchesUnit && matchesSearch
  })
}

export function createLinuxPasswordServer({ hostname, ip, username, password, folders }) {
  return {
    id: `srv-${Date.now()}`,
    hostname: String(hostname || '').trim(),
    ip: String(ip || '').trim(),
    username: String(username || '').trim(),
    passwordHash: String(password || ''),
    businessUnits: mergeLinuxPasswordDirectories(folders),
    status: 'online',
  }
}
