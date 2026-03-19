export const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC' },
  { value: 'HKT', label: 'HKT' },
  { value: 'IST', label: 'IST' },
]

const TIMEZONE_NORMALIZATION_MAP = {
  UTC: 'UTC',
  GMT: 'UTC',
  HKT: 'HKT',
  IST: 'IST',
  'Asia/Hong_Kong': 'HKT',
  'Asia/Shanghai': 'HKT',
  'Asia/Singapore': 'HKT',
  'Asia/Tokyo': 'HKT',
  'Asia/Seoul': 'HKT',
  'Asia/Kolkata': 'IST',
  'Asia/Calcutta': 'IST',
  'Asia/Colombo': 'IST',
  'Europe/London': 'UTC',
  'America/New_York': 'UTC',
  'America/Los_Angeles': 'UTC',
}

const TIMEZONE_IANA_MAP = {
  UTC: 'UTC',
  HKT: 'Asia/Hong_Kong',
  IST: 'Asia/Kolkata',
}

export function normalizeTimezoneSelection(timezone) {
  return TIMEZONE_NORMALIZATION_MAP[timezone] || 'UTC'
}

export function toIanaTimezone(timezone) {
  const normalizedTimezone = normalizeTimezoneSelection(timezone)

  return TIMEZONE_IANA_MAP[normalizedTimezone] || 'UTC'
}