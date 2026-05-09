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

export function applyReorderedSelectedTeamShifts(shiftDefinitions, nextOrderedShifts) {
  const nextOrderedShiftIds = new Set(nextOrderedShifts.map((shift) => shift.id))
  let nextOrderedShiftIndex = 0

  return shiftDefinitions.map((shift) => {
    if (!nextOrderedShiftIds.has(shift.id)) {
      return shift
    }

    const nextShift = nextOrderedShifts[nextOrderedShiftIndex]
    nextOrderedShiftIndex += 1
    return nextShift || shift
  })
}
