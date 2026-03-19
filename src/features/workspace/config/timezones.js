export const WORKSPACE_STAFF_TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC' },
  { value: 'HKT', label: 'HKT' },
  { value: 'IST', label: 'IST' },
]

const TIMEZONE_NORMALIZATION_MAP = {
  UTC: 'UTC',
  GMT: 'UTC',
  'Asia/Shanghai': 'HKT',
  'Asia/Hong_Kong': 'HKT',
  'Asia/Singapore': 'HKT',
  HKT: 'HKT',
  'Asia/Kolkata': 'IST',
  'Asia/Calcutta': 'IST',
  IST: 'IST',
}

export function normalizeWorkspaceStaffTimezone(timezone) {
  const normalizedValue = TIMEZONE_NORMALIZATION_MAP[timezone]

  if (normalizedValue) {
    return normalizedValue
  }

  return 'UTC'
}