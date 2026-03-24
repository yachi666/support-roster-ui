import { currentLocale } from '@/i18n'
import { formatLocalizedDate } from '@/i18n/format'

export function getCurrentWorkspacePeriod() {
  const now = new Date()

  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  }
}

export function shiftWorkspacePeriod(period, delta) {
  const shiftedDate = new Date(period.year, period.month - 1 + delta, 1)

  return {
    year: shiftedDate.getFullYear(),
    month: shiftedDate.getMonth() + 1,
  }
}

export function formatWorkspaceMonthLabel(year, month) {
  return formatLocalizedDate(new Date(year, month - 1, 1), {
    month: 'long',
    year: 'numeric',
  }, currentLocale.value)
}

export function createPlannerDays(year, month) {
  const totalDays = new Date(year, month, 0).getDate()

  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(year, month - 1, index + 1)
    const weekday = formatLocalizedDate(date, { weekday: 'short' }, currentLocale.value)

    return {
      value: index + 1,
      label: weekday.slice(0, 2),
    }
  })
}
