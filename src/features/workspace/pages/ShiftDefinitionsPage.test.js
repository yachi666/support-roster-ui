import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  applyReorderedSelectedTeamShifts,
  buildReorderedSelectedTeamShifts,
  sortShiftsForSelectedTeam,
} from './shiftDefinitionReorder.js'

const source = readFileSync(new URL('./ShiftDefinitionsPage.vue', import.meta.url), 'utf8')

test('shift definitions handle long codes gracefully and focus routed records', () => {
  assert.match(source, /import \{ computed, nextTick, onMounted, reactive, shallowRef, watch \} from 'vue'/)
  assert.match(source, /import \{ useRoute \} from 'vue-router'/)
  assert.match(source, /const highlightedShiftId = shallowRef\(null\)/)
  assert.match(
    source,
    /function focusShiftFromRoute\(\) \{[\s\S]*route\.query\.focusShiftId[\s\S]*openShiftDrawer\(targetShift\)/,
  )
  assert.match(source, /:data-workspace-shift-id="String\(shift\.id\)"/)
  assert.match(source, /:title="shift\.code"/)
  assert.match(
    source,
    /class="inline-flex min-h-\[32px\] max-w-\[9rem\] items-center justify-center truncate rounded border/,
  )
})

test('shift definitions enable drag sorting only for a single selected team', () => {
  assert.match(source, /const selectedTeamShifts = computed\(\(\) =>/)
  assert.match(source, /const canReorderSelectedTeam = computed\(/)
  assert.match(source, /selectedTeamShifts\.value\.length > 1 && authStore\.canEditTeam\(selectedTeamFilter\.value\)/)
  assert.doesNotMatch(source, /visibleTeamIds\.size === 1/)
  assert.match(source, /return sortShiftsForSelectedTeam\(filteredShifts, teamId\)/)
  assert.match(source, /@dragstart="handleRowDragStart\(\$event, shift\)"/)
  assert.match(
    source,
    /function handleRowDragStart\(event, shift\) \{[\s\S]*event\.dataTransfer\?\.setData\('text\/plain', String\(shift\.id\)\)/,
  )
})

test('shift definitions load the full dataset and keep search filtering on the client', () => {
  assert.match(source, /shiftDefinitions\.value = await api\.workspace\.getShiftDefinitions\(\)/)
  assert.doesNotMatch(source, /getShiftDefinitions\(searchTerm\.value\)/)
})

test('shift definitions persist full selected team order when dragging a filtered subset', () => {
  const selectedTeamShifts = [
    { id: 1, code: 'A' },
    { id: 2, code: 'B' },
    { id: 3, code: 'C' },
    { id: 4, code: 'D' },
  ]
  const reorderedVisibleShifts = [
    { id: 3, code: 'C' },
    { id: 1, code: 'A' },
  ]

  const nextSelectedTeamShifts = buildReorderedSelectedTeamShifts(
    selectedTeamShifts,
    reorderedVisibleShifts,
  )

  assert.deepEqual(
    nextSelectedTeamShifts.map((shift) => shift.id),
    [3, 2, 1, 4],
    'payload should preserve hidden team rows while reordering the visible subset',
  )
  assert.match(source, /nextSelectedTeamShifts\.map\(\(shift\) => shift\.id\)/)
})

test('shift definitions reorder helpers ignore incomplete reorder subsets instead of returning undefined rows', () => {
  const selectedTeamShifts = [
    { id: 1, code: 'A' },
    { id: 1, code: 'A-duplicate' },
    { id: 2, code: 'B' },
  ]

  assert.deepEqual(
    buildReorderedSelectedTeamShifts(selectedTeamShifts, [{ id: 1, code: 'A-reordered' }]),
    [
      { id: 1, code: 'A-reordered' },
      { id: 1, code: 'A-duplicate' },
      { id: 2, code: 'B' },
    ],
  )
})

test('shift definitions apply reordered team shifts back into the full list without dropping other rows', () => {
  const allShiftDefinitions = [
    { id: 10, code: 'X', teams: [{ id: '7', displayOrder: 9 }] },
    { id: 1, code: 'A', teams: [{ id: '7', displayOrder: 0 }] },
    { id: 2, code: 'B', teams: [{ id: '7', displayOrder: 1 }] },
    { id: 99, code: 'Y', teams: [{ id: '8', displayOrder: 4 }] },
    { id: 3, code: 'C', teams: [{ id: '7', displayOrder: 2 }] },
    { id: 4, code: 'D', teams: [{ id: '7', displayOrder: 3 }] },
  ]
  const nextSelectedTeamShifts = [
    { id: 3, code: 'C', teams: [{ id: '7', displayOrder: 2 }] },
    { id: 2, code: 'B', teams: [{ id: '7', displayOrder: 1 }] },
    { id: 1, code: 'A', teams: [{ id: '7', displayOrder: 0 }] },
    { id: 4, code: 'D', teams: [{ id: '7', displayOrder: 3 }] },
  ]

  assert.deepEqual(
    applyReorderedSelectedTeamShifts(allShiftDefinitions, nextSelectedTeamShifts, '7')
      .map((shift) => shift.teams?.find((team) => team.id === '7')?.displayOrder ?? null),
    [9, 2, 1, null, 0, 3],
  )
  assert.match(
    source,
    /shiftDefinitions\.value = applyReorderedSelectedTeamShifts\(\s*shiftDefinitions\.value,\s*nextSelectedTeamShifts,\s*selectedTeamFilter\.value,\s*\)/,
  )
})

test('shift definitions sort the selected team rows by per-team display order metadata', () => {
  const sorted = sortShiftsForSelectedTeam(
    [
      { id: 1, code: 'A', teams: [{ id: '7', displayOrder: 2 }] },
      { id: 2, code: 'B', teams: [{ id: '7', displayOrder: 0 }] },
      { id: 3, code: 'C', teams: [{ id: '7', displayOrder: 1 }] },
      { id: 4, code: 'D', teams: [{ id: '8', displayOrder: 0 }] },
    ],
    '7',
  )

  assert.deepEqual(
    sorted.map((shift) => shift.id),
    [2, 3, 1, 4],
  )
  assert.match(source, /const selectedTeamId = String\(selectedTeamFilter\.value \|\| ''\)\.trim\(\)/)
})
