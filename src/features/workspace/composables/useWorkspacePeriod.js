import { computed, readonly, shallowRef } from 'vue'
import {
  formatWorkspaceMonthLabel,
  shiftWorkspacePeriod,
} from '../lib/period'
import { normalizeWorkspaceTimezone } from '../config/timezones'

const initialDate = new Date()
const workspacePeriod = shallowRef({
  year: initialDate.getFullYear(),
  month: initialDate.getMonth() + 1,
})
const workspaceTimezone = shallowRef('UTC')

function normalizePeriodValue(value, fallback) {
  const parsed = Number(value)

  return Number.isInteger(parsed) ? parsed : fallback
}

function setWorkspacePeriod(nextYear, nextMonth) {
  const normalizedYear = normalizePeriodValue(nextYear, workspacePeriod.value.year)
  const normalizedMonth = normalizePeriodValue(nextMonth, workspacePeriod.value.month)

  if (normalizedMonth < 1 || normalizedMonth > 12) {
    return
  }

  workspacePeriod.value = {
    year: normalizedYear,
    month: normalizedMonth,
  }
}

function setWorkspaceYear(nextYear) {
  setWorkspacePeriod(nextYear, workspacePeriod.value.month)
}

function setWorkspaceMonth(nextMonth) {
  setWorkspacePeriod(workspacePeriod.value.year, nextMonth)
}

function setWorkspaceTimezone(nextTimezone) {
  workspaceTimezone.value = normalizeWorkspaceTimezone(nextTimezone)
}

function goToPreviousMonth() {
  const nextPeriod = shiftWorkspacePeriod(workspacePeriod.value, -1)
  setWorkspacePeriod(nextPeriod.year, nextPeriod.month)
}

function goToNextMonth() {
  const nextPeriod = shiftWorkspacePeriod(workspacePeriod.value, 1)
  setWorkspacePeriod(nextPeriod.year, nextPeriod.month)
}

const year = computed(() => workspacePeriod.value.year)
const month = computed(() => workspacePeriod.value.month)
const monthLabel = computed(() => formatWorkspaceMonthLabel(year.value, month.value))

export function useWorkspacePeriod() {
  return {
    timezone: readonly(workspaceTimezone),
    year,
    month,
    monthLabel,
    setWorkspaceTimezone,
    setWorkspacePeriod,
    setWorkspaceYear,
    setWorkspaceMonth,
    goToPreviousMonth,
    goToNextMonth,
  }
}