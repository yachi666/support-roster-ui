import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildShiftPresentationByTeam,
  getShiftPresentation,
} from './shiftPresentation.js'

test('builds team-aware shift presentation and fallback code colors', () => {
  const { shiftPresentationByTeam, fallbackShiftPresentationByCode } = buildShiftPresentationByTeam({
    shiftDetailsByTeam: {
      '7': {
        DS: {
          label: 'Day Support',
          colorHex: '#38bdf8',
          startTime: '09:00',
          endTime: '18:00',
        },
      },
    },
    shiftCodeColorMap: {
      NS: '#818cf8',
    },
  })

  assert.equal(shiftPresentationByTeam['7'].DS.meta.label, 'Day Support')
  assert.match(shiftPresentationByTeam['7'].DS.windowLabel, /09:00.*18:00/)
  assert.equal(shiftPresentationByTeam['7'].DS.cellStyle.color, '#38bdf8')

  const fallback = getShiftPresentation({
    shiftPresentationByTeam,
    fallbackShiftPresentationByCode,
    teamId: '7',
    code: 'NS',
  })

  assert.equal(fallback.badgeStyle.color, '#818cf8')
  assert.equal(fallback.cellStyle.color, '#818cf8')
})
