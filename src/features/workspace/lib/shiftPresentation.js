import { hexToRgba } from './color.js'
import { describeShiftWindow } from './shiftTime.js'

function buildPresentation(colorHex, detail = null) {
  return {
    meta: detail,
    cellStyle: colorHex
      ? {
          backgroundColor: hexToRgba(colorHex, 0.15),
          borderColor: hexToRgba(colorHex, 0.4),
          color: colorHex,
        }
      : null,
    cardStyle: colorHex
      ? {
          borderColor: hexToRgba(colorHex, 0.26),
          background: `linear-gradient(135deg, ${hexToRgba(colorHex, 0.14)} 0%, rgba(255, 255, 255, 0.98) 72%)`,
        }
      : null,
    badgeStyle: colorHex
      ? {
          backgroundColor: hexToRgba(colorHex, 0.14),
          borderColor: hexToRgba(colorHex, 0.24),
          color: colorHex,
        }
      : null,
    windowLabel: detail ? describeShiftWindow(detail.startTime, detail.endTime) : '',
  }
}

export function buildShiftPresentationByTeam({
  shiftDetailsByTeam = {},
  shiftCodeColorMap = {},
} = {}) {
  const fallbackShiftPresentationByCode = Object.fromEntries(
    Object.entries(shiftCodeColorMap || {}).map(([code, colorHex]) => [
      code,
      buildPresentation(colorHex),
    ]),
  )

  const shiftPresentationByTeam = Object.fromEntries(
    Object.entries(shiftDetailsByTeam || {}).map(([teamId, teamDetails]) => [
      String(teamId),
      Object.fromEntries(
        Object.entries(teamDetails || {}).map(([code, detail]) => [
          code,
          buildPresentation(detail?.colorHex || shiftCodeColorMap?.[code], detail || null),
        ]),
      ),
    ]),
  )

  return { shiftPresentationByTeam, fallbackShiftPresentationByCode }
}

export function getShiftPresentation({
  shiftPresentationByTeam = {},
  fallbackShiftPresentationByCode = {},
  teamId,
  code,
} = {}) {
  if (!code) {
    return null
  }

  const normalizedTeamId = String(teamId)
  return (
    shiftPresentationByTeam?.[normalizedTeamId]?.[code] ||
    fallbackShiftPresentationByCode?.[code] ||
    null
  )
}
