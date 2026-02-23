import { addHours, setHours, setMinutes, formatISO } from 'date-fns'

export const TEAMS = [
  { id: 'incident-manager', name: 'Incident Manager', color: 'orange', order: 0 },
  { id: 'l1', name: 'L1', color: 'blue', order: 1 },
  { id: 'iccm-l2', name: 'ICCM L2', color: 'green', order: 2 },
  { id: 'emea-l2', name: 'EMEA L2', color: 'purple', order: 3 },
  { id: 'mdp-l2', name: 'MDP L2', color: 'red', order: 4 },
]

const USERS = [
  {
    id: 'u1',
    name: 'Alex Chen',
    avatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60',
  },
  {
    id: 'u2',
    name: 'Sarah Jones',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
  },
  {
    id: 'u3',
    name: 'Mike Ross',
    avatar:
      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=crop&q=60',
  },
  {
    id: 'u4',
    name: 'Emily Wang',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=60',
  },
  {
    id: 'u5',
    name: 'David Kim',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60',
  },
  {
    id: 'u6',
    name: 'Lisa Ray',
    avatar:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=60',
  },
  {
    id: 'u7',
    name: 'Tom Wilson',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
  },
  {
    id: 'u8',
    name: 'Jessica Lee',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60',
  },
]

export const generateShifts = (date) => {
  const baseDate = setMinutes(setHours(date, 0), 0)

  const im1 = {
    id: 's1',
    userId: 'u1',
    userName: 'Alex Chen',
    userAvatar: USERS[0].avatar,
    start: formatISO(addHours(baseDate, 0)),
    end: formatISO(addHours(baseDate, 12)),
    isPrimary: true,
    role: 'Incident Manager',
    contact: { slack: '@achen', email: 'achen@company.com', phone: '+1-555-0101' },
    teamId: 'incident-manager',
  }
  const im2 = {
    id: 's2',
    userId: 'u2',
    userName: 'Sarah Jones',
    userAvatar: USERS[1].avatar,
    start: formatISO(addHours(baseDate, 12)),
    end: formatISO(addHours(baseDate, 24)),
    isPrimary: true,
    role: 'Incident Manager',
    contact: { slack: '@sjones', email: 'sjones@company.com', phone: '+1-555-0102' },
    teamId: 'incident-manager',
  }

  const l1_1 = {
    id: 's3',
    userId: 'u3',
    userName: 'Mike Ross',
    userAvatar: USERS[2].avatar,
    start: formatISO(addHours(baseDate, 8)),
    end: formatISO(addHours(baseDate, 17)),
    isPrimary: true,
    role: 'L1 Support',
    contact: { slack: '@mross', email: 'mross@company.com', phone: '+1-555-0103' },
    teamId: 'l1',
  }
  const l1_2 = {
    id: 's4',
    userId: 'u4',
    userName: 'Emily Wang',
    userAvatar: USERS[3].avatar,
    start: formatISO(addHours(baseDate, 10)),
    end: formatISO(addHours(baseDate, 19)),
    isPrimary: false,
    role: 'L1 Support',
    contact: { slack: '@ewang', email: 'ewang@company.com', phone: '+1-555-0104' },
    teamId: 'l1',
  }
  const l1_3 = {
    id: 's5',
    userId: 'u5',
    userName: 'David Kim',
    userAvatar: USERS[4].avatar,
    start: formatISO(addHours(baseDate, 16)),
    end: formatISO(addHours(baseDate, 24)),
    isPrimary: false,
    role: 'L1 Support',
    contact: { slack: '@dkim', email: 'dkim@company.com', phone: '+1-555-0105' },
    teamId: 'l1',
  }

  const iccm1 = {
    id: 's6',
    userId: 'u6',
    userName: 'Lisa Ray',
    userAvatar: USERS[5].avatar,
    start: formatISO(addHours(baseDate, 20)),
    end: formatISO(addHours(baseDate, 28)),
    isPrimary: true,
    role: 'ICCM L2',
    contact: { slack: '@lray', email: 'lray@company.com', phone: '+1-555-0106' },
    teamId: 'iccm-l2',
  }

  const emea1 = {
    id: 's7',
    userId: 'u7',
    userName: 'Tom Wilson',
    userAvatar: USERS[6].avatar,
    start: formatISO(addHours(baseDate, 2)),
    end: formatISO(addHours(baseDate, 11)),
    isPrimary: true,
    role: 'EMEA L2',
    contact: { slack: '@twilson', email: 'twilson@company.com', phone: '+1-555-0107' },
    teamId: 'emea-l2',
  }

  const mdp1 = {
    id: 's8',
    userId: 'u8',
    userName: 'Jessica Lee',
    userAvatar: USERS[7].avatar,
    start: formatISO(addHours(baseDate, 9)),
    end: formatISO(addHours(baseDate, 18)),
    isPrimary: true,
    role: 'MDP L2',
    contact: { slack: '@jlee', email: 'jlee@company.com', phone: '+1-555-0108' },
    backup: { name: 'Alex Chen', contact: '@achen' },
    teamId: 'mdp-l2',
  }

  return [im1, im2, l1_1, l1_2, l1_3, iccm1, emea1, mdp1]
}
