import { TIMEZONE_OPTIONS, normalizeTimezoneSelection } from '@/lib/timezones'

export const WORKSPACE_TIMEZONE_OPTIONS = TIMEZONE_OPTIONS

export const WORKSPACE_STAFF_TIMEZONE_OPTIONS = WORKSPACE_TIMEZONE_OPTIONS

export function normalizeWorkspaceTimezone(timezone) {
  return normalizeTimezoneSelection(timezone)
}

export function normalizeWorkspaceStaffTimezone(timezone) {
  return normalizeWorkspaceTimezone(timezone)
}