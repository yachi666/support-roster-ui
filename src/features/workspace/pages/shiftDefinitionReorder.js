export function sortShiftsForSelectedTeam(shifts, teamId) {
  if (!teamId) {
    return [...shifts]
  }

  return [...shifts]
    .map((shift, index) => ({
      shift,
      index,
      displayOrder: getShiftDisplayOrderForTeam(shift, teamId),
    }))
    .sort((left, right) => {
      if (left.displayOrder !== right.displayOrder) {
        return left.displayOrder - right.displayOrder
      }
      return left.index - right.index
    })
    .map((entry) => entry.shift)
}

export function buildReorderedSelectedTeamShifts(selectedTeamShifts, nextVisibleShifts) {
  const nextVisibleShiftIds = new Set(nextVisibleShifts.map((shift) => shift.id))
  let nextVisibleShiftIndex = 0

  return selectedTeamShifts.map((shift) => {
    if (!nextVisibleShiftIds.has(shift.id)) {
      return shift
    }

    const nextShift = nextVisibleShifts[nextVisibleShiftIndex]
    nextVisibleShiftIndex += 1
    return nextShift || shift
  })
}

export function applyReorderedSelectedTeamShifts(shiftDefinitions, nextOrderedShifts, teamId) {
  const normalizedTeamId = String(teamId || '')
  const nextOrderByShiftId = new Map(
    nextOrderedShifts.map((shift, index) => [String(shift.id), index]),
  )

  return shiftDefinitions.map((shift) => {
    const nextDisplayOrder = nextOrderByShiftId.get(String(shift.id))

    if (nextDisplayOrder == null) {
      return shift
    }

    const nextTeams = Array.isArray(shift.teams)
      ? shift.teams.map((team) =>
          String(team.id) === normalizedTeamId
            ? { ...team, displayOrder: nextDisplayOrder }
            : team,
        )
      : shift.teams

    return {
      ...shift,
      teams: nextTeams,
    }
  })
}

function getShiftDisplayOrderForTeam(shift, teamId) {
  const team = Array.isArray(shift?.teams)
    ? shift.teams.find((item) => String(item.id) === String(teamId))
    : null
  const displayOrder = Number(team?.displayOrder)

  return Number.isFinite(displayOrder) ? displayOrder : Number.MAX_SAFE_INTEGER
}
