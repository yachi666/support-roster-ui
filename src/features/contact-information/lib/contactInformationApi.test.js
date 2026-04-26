import test from 'node:test'
import assert from 'node:assert/strict'
import { buildContactInformationListQuery } from './contactInformationApi.js'

test('contact information api builds keyword and pagination query params', () => {
  assert.equal(
    buildContactInformationListQuery({ keyword: 'payments', page: 2, pageSize: 25 }),
    'keyword=payments&page=2&pageSize=25',
  )
})
