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
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1))
}

export function createPlannerDays(year, month) {
  const totalDays = new Date(year, month, 0).getDate()

  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(year, month - 1, index + 1)
    const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date)

    return {
      value: index + 1,
      label: weekday.slice(0, 2),
    }
  })
}