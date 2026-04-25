export const contactInformationPresetRoles = ['Upstream', 'Downstream']

export const contactInformationAvailableStaffIds = [
  'S-10492',
  'S-94281',
  'S-55219',
  'S-33910',
  'S-88211',
  'S-10293',
  'S-77210',
  'S-66129',
  'S-55201',
  'S-11928',
]

export const contactInformationMockTeams = [
  {
    id: 't1',
    name: 'Payments Core',
    roles: ['Upstream', 'Downstream'],
    staff: [
      {
        id: 'S-10492',
        name: 'Alex Chen',
        email: 'alex.c@company.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100',
      },
      {
        id: 'S-94281',
        name: 'Sarah Jenkins',
        email: 'sarah.j@company.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100',
      },
    ],
    email: 'payments-core@company.com',
    xMatter: 'XM-PAY-01',
    gsd: 'GSD-PAY-882',
    eim: 'EIM-9331',
    links: [{ label: 'Wiki', url: '#' }],
  },
  {
    id: 't2',
    name: 'Authentication API',
    roles: ['Upstream'],
    staff: [
      {
        id: 'S-55219',
        name: 'Marcus Johnson',
        email: 'marcus.j@company.com',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100',
      },
    ],
    email: 'auth-api@company.com',
    xMatter: 'XM-AUTH-09',
    gsd: 'GSD-SEC-112',
    eim: 'EIM-1102',
    links: [{ label: 'Docs', url: '#' }],
  },
  {
    id: 't3',
    name: 'Data Platform',
    roles: ['Downstream'],
    staff: [
      {
        id: 'S-33910',
        name: 'Elena Rodriguez',
        email: 'elena.r@company.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100',
      },
      {
        id: 'S-88211',
        name: 'David Kim',
        email: 'david.k@company.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100',
      },
      {
        id: 'S-10293',
        name: 'Priya Patel',
        email: 'priya.p@company.com',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100',
      },
    ],
    email: 'data-plat@company.com',
    xMatter: 'XM-DATA-44',
    gsd: 'GSD-DAT-550',
    eim: 'EIM-8840',
    links: [{ label: 'Dashboard', url: '#' }],
  },
  {
    id: 't4',
    name: 'Merchant Services',
    roles: ['Upstream', 'Downstream'],
    staff: [
      {
        id: 'S-77210',
        name: 'James Wilson',
        email: 'james.w@company.com',
        avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?auto=format&fit=crop&q=80&w=100&h=100',
      },
    ],
    email: 'merchant-svcs@company.com',
    xMatter: 'XM-MERCH-02',
    gsd: 'GSD-MER-991',
    eim: 'EIM-4412',
    links: [{ label: 'Portal', url: '#' }],
  },
  {
    id: 't5',
    name: 'Notification Engine',
    roles: ['Downstream'],
    staff: [
      {
        id: 'S-66129',
        name: 'Anita Smith',
        email: 'anita.s@company.com',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=100&h=100',
      },
      {
        id: 'S-55201',
        name: 'Tom Baker',
        email: 'tom.b@company.com',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100&h=100',
      },
    ],
    email: 'notify-eng@company.com',
    xMatter: 'XM-NOTF-11',
    gsd: 'GSD-MSG-332',
    eim: 'EIM-5591',
    links: [{ label: 'API Specs', url: '#' }],
  },
  {
    id: 't6',
    name: 'Risk & Compliance',
    roles: ['Upstream'],
    staff: [
      {
        id: 'S-11928',
        name: 'Rachel Green',
        email: 'rachel.g@company.com',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100',
      },
    ],
    email: 'risk-comp@company.com',
    xMatter: 'XM-RISK-05',
    gsd: 'GSD-RSK-100',
    eim: 'EIM-2201',
    links: [{ label: 'Wiki', url: '#' }],
  },
]
