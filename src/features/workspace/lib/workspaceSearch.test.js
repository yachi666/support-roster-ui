import assert from 'node:assert/strict'
import test from 'node:test'
import {
  filterOverviewContent,
  filterTeamsByQuery,
  normalizeWorkspaceSearchValue,
} from './workspaceSearch.js'

test('normalizeWorkspaceSearchValue trims and lowercases search input', () => {
  assert.equal(normalizeWorkspaceSearchValue('  AP   L2  '), 'ap l2')
  assert.equal(normalizeWorkspaceSearchValue(null), '')
})

test('filterOverviewContent keeps only matching stats, actions, and activity entries', () => {
  const result = filterOverviewContent(
    {
      stats: [
        { label: 'Roster Completion', value: '95%', trend: 'Healthy month' },
        { label: 'Validation Signals', value: '2', trend: 'Needs review' },
      ],
      quickActions: [
        { title: 'Open roster', subtitle: 'Adjust monthly coverage' },
        { title: 'Import workbook', subtitle: 'Upload spreadsheet' },
      ],
      activity: [
        { user: 'Alice', action: 'saved roster', time: '10m ago' },
        { user: 'Bob', action: 'updated teams', time: '1h ago' },
      ],
    },
    'roster',
  )

  assert.deepEqual(result.stats.map((item) => item.label), ['Roster Completion'])
  assert.deepEqual(result.quickActions.map((item) => item.title), ['Open roster'])
  assert.deepEqual(result.activity.map((item) => item.user), ['Alice'])
})

test('filterTeamsByQuery matches team name and description', () => {
  const result = filterTeamsByQuery(
    [
      { id: 1, name: 'China Support', description: 'Primary APAC team' },
      { id: 2, name: 'EMEA Escalation', description: 'Secondary coverage' },
    ],
    'apac',
  )

  assert.deepEqual(result.map((item) => item.id), [1])
})
