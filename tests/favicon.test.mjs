import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

test('index.html links the PNG favicon asset used by the app shell', () => {
  const indexHtml = readFileSync(path.join(projectRoot, 'index.html'), 'utf8')

  assert.match(indexHtml, /<link rel="icon" type="image\/png" href="\/favicon\.png">/)
})

test('public favicon PNG exists for Vite to serve from the app root', () => {
  assert.equal(existsSync(path.join(projectRoot, 'public', 'favicon.png')), true)
})
