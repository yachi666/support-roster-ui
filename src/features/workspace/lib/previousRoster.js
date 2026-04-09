export function getPreviousMonthPeriod(year, month) {
  if (month === 1) {
    return {
      year: year - 1,
      month: 12,
    }
  }

  return {
    year,
    month: month - 1,
  }
}

function buildStaffScheduleIndex(groups) {
  const staffScheduleIndex = new Map()

  for (const group of groups || []) {
    for (const person of group.staff || []) {
      staffScheduleIndex.set(String(person.id), person.schedule || [])
    }
  }

  return staffScheduleIndex
}

export function buildPreviousMonthCopyUpdates({
  currentGroups,
  previousGroups,
  targetDayCount,
  canCopyTeam = () => true,
}) {
  const previousScheduleIndex = buildStaffScheduleIndex(previousGroups)
  const updates = []

  for (const group of currentGroups || []) {
    if (!canCopyTeam(group?.teamId)) {
      continue
    }

    for (const person of group.staff || []) {
      const currentSchedule = person.schedule || []
      const previousSchedule = previousScheduleIndex.get(String(person.id))

      if (!previousSchedule) {
        continue
      }

      const comparableDayCount = Math.min(
        Number(targetDayCount) || 0,
        currentSchedule.length,
        previousSchedule.length,
      )

      for (let dayIndex = 0; dayIndex < comparableDayCount; dayIndex += 1) {
        if (currentSchedule[dayIndex]) {
          continue
        }

        const previousCode = previousSchedule[dayIndex] || ''
        if (!previousCode) {
          continue
        }

        updates.push({
          staffId: person.id,
          day: dayIndex + 1,
          shiftCode: previousCode,
        })
      }
    }
  }

  return updates
}
