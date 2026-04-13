import assert from 'node:assert/strict'
import test from 'node:test'
import { buildMicrosoftTeamsChatUrl } from './microsoftTeams.js'

test('buildMicrosoftTeamsChatUrl returns empty string when email is missing', () => {
  assert.equal(buildMicrosoftTeamsChatUrl(''), '')
  assert.equal(buildMicrosoftTeamsChatUrl(null), '')
})

test('buildMicrosoftTeamsChatUrl trims and encodes company email', () => {
  assert.equal(
    buildMicrosoftTeamsChatUrl(' alice.chen+apac@company.com '),
    'https://teams.microsoft.com/l/chat/0/0?users=alice.chen%2Bapac%40company.com',
  )
})
