export const mockServers = [
  { id: 'srv-1', hostname: 'fin-db-01', ip: '10.0.10.5', username: 'postgres', passwordHash: 'P@ssw0rdFin1!', businessUnits: ['Finance', 'Database'], status: 'online' },
  { id: 'srv-2', hostname: 'fin-app-01', ip: '10.0.10.15', username: 'root', passwordHash: 'RootFin@123', businessUnits: ['Finance'], status: 'online' },
  { id: 'srv-3', hostname: 'fin-web-01', ip: '10.0.10.20', username: 'admin', passwordHash: 'Admin#Web!F', businessUnits: ['Finance', 'Web'], status: 'maintenance' },
  { id: 'srv-4', hostname: 'mkt-cache-01', ip: '10.0.20.10', username: 'redis', passwordHash: 'MktRedisX89', businessUnits: ['Marketing'], status: 'online' },
  { id: 'srv-5', hostname: 'mkt-web-01', ip: '10.0.20.11', username: 'ubuntu', passwordHash: 'Ubu!Mkt2026', businessUnits: ['Marketing', 'Web'], status: 'offline' },
  { id: 'srv-6', hostname: 'mkt-web-02', ip: '10.0.20.12', username: 'ubuntu', passwordHash: 'Ubu!Mkt2026_2', businessUnits: ['Marketing', 'Web'], status: 'online' },
  { id: 'srv-7', hostname: 'infra-proxy-01', ip: '10.0.1.2', username: 'admin', passwordHash: 'Proxy@Infra99', businessUnits: ['Infrastructure', 'Web'], status: 'online' },
  { id: 'srv-8', hostname: 'infra-dns-01', ip: '10.0.1.5', username: 'bind', passwordHash: 'Dns#Infra21', businessUnits: ['Infrastructure'], status: 'online' },
  { id: 'srv-9', hostname: 'hr-app-01', ip: '10.0.30.15', username: 'root', passwordHash: 'Hr@AppRoot1', businessUnits: ['Human Resources'], status: 'online' },
  { id: 'srv-10', hostname: 'hr-db-01', ip: '10.0.30.5', username: 'mysql', passwordHash: 'Hr#DbPass!', businessUnits: ['Human Resources', 'Database'], status: 'maintenance' },
]
