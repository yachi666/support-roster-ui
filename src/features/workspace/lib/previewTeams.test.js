import assert from 'node:assert/strict'
import test from 'node:test'
import { removePreviewTeams, resolvePreviewTeamKey, restorePreviewTeam } from './previewTeams.js'

const previewGroups = [
  {
    teamId: 'team-1',
    team: 'China Support',
    staff: [{ id: 's-1', name: 'Alice' }],
  },
  {
    teamId: 'team-2',
    team: 'EMEA Escalation',
    staff: [{ id: 's-2', name: 'Bob' }],
  },
]

test('removePreviewTeams removes selected teams from preview groups', () => {
  const result = removePreviewTeams(previewGroups, [resolvePreviewTeamKey(previewGroups[1])])

  assert.deepEqual(result.groups.map((group) => group.teamId), ['team-1'])
  assert.deepEqual(result.removedTeams.map((group) => group.teamId), ['team-2'])
})

test('restorePreviewTeam removes a team id from removed ids', () => {
  assert.deepEqual(restorePreviewTeam(['team-1', 'team-2'], 'team-1'), ['team-2'])
})

test('removePreviewTeams treats preview-only teams with empty persisted ids as distinct teams', () => {
  const result = removePreviewTeams(
    [
      {
        teamId: null,
        previewTeamKey: 'preview:new-team-a',
        team: 'New Team A',
        staff: [{ id: 's-1', name: 'Alice' }],
      },
      {
        teamId: null,
        previewTeamKey: 'preview:new-team-b',
        team: 'New Team B',
        staff: [{ id: 's-2', name: 'Bob' }],
      },
    ],
    ['preview:new-team-a'],
  )

  assert.deepEqual(result.groups.map((group) => group.team), ['New Team B'])
  assert.deepEqual(result.removedTeams.map((group) => group.team), ['New Team A'])
})
