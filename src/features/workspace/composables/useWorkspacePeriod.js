import { computed, readonly, shallowRef } from 'vue'
import {
  formatWorkspaceMonthLabel,
  getCurrentWorkspacePeriod,
  shiftWorkspacePeriod,
} from '../lib/period'

const initialPeriod = getCurrentWorkspacePeriod()
const workspaceYear = shallowRef(initialPeriod.year)
const workspaceMonth = shallowRef(initialPeriod.month)

function normalizePeriodValue(value, fallback) {
  const parsed = Number(value)

  return Number.isInteger(parsed) ? parsed : fallback
}

function setWorkspacePeriod(nextYear, nextMonth) {
  const normalizedYear = normalizePeriodValue(nextYear, workspaceYear.value)
  const normalizedMonth = normalizePeriodValue(nextMonth, workspaceMonth.value)

  if (normalizedMonth < 1 || normalizedMonth > 12) {
    return
  }

  workspaceYear.value = normalizedYear
  workspaceMonth.value = normalizedMonth
}

function setWorkspaceYear(nextYear) {
  setWorkspacePeriod(nextYear, workspaceMonth.value)
}

function setWorkspaceMonth(nextMonth) {
  setWorkspacePeriod(workspaceYear.value, nextMonth)
}

function goToPreviousMonth() {
  const nextPeriod = shiftWorkspacePeriod({ year: workspaceYear.value, month: workspaceMonth.value }, -1)
  setWorkspacePeriod(nextPeriod.year, nextPeriod.month)
}

function goToNextMonth() {
  const nextPeriod = shiftWorkspacePeriod({ year: workspaceYear.value, month: workspaceMonth.value }, 1)
  setWorkspacePeriod(nextPeriod.year, nextPeriod.month)
}

const monthLabel = computed(() => formatWorkspaceMonthLabel(workspaceYear.value, workspaceMonth.value))

export function useWorkspacePeriod() {
  return {
    year: readonly(workspaceYear),
    month: readonly(workspaceMonth),
    monthLabel,
    setWorkspacePeriod,
    setWorkspaceYear,
    setWorkspaceMonth,
    goToPreviousMonth,
    goToNextMonth,
  }
}