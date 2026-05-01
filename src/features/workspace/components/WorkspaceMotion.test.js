import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const globalCss = readFileSync(new URL('../../../assets/main.css', import.meta.url), 'utf8')
const drawerSource = readFileSync(new URL('./WorkspaceDrawer.vue', import.meta.url), 'utf8')
const modalSource = readFileSync(new URL('./WorkspaceModal.vue', import.meta.url), 'utf8')

test('workspace motion tokens define micro, standard, and panel durations', () => {
  assert.match(globalCss, /--workspace-motion-micro:\s*140ms;/)
  assert.match(globalCss, /--workspace-motion-standard:\s*200ms;/)
  assert.match(globalCss, /--workspace-motion-panel:\s*260ms;/)
  assert.match(globalCss, /--workspace-motion-ease-out:\s*cubic-bezier\(0\.16,\s*1,\s*0\.3,\s*1\);/)
  assert.match(globalCss, /--workspace-motion-ease-in:\s*cubic-bezier\(0\.4,\s*0,\s*1,\s*1\);/)
})

test('workspace overlay transitions are centralized with reduced motion support', () => {
  assert.match(globalCss, /\.workspace-fade-enter-active,[\s\S]*\.workspace-fade-leave-active[\s\S]*transition:\s*opacity var\(--workspace-motion-standard\) var\(--workspace-motion-ease-out\)/)
  assert.match(globalCss, /\.workspace-slide-enter-active[\s\S]*transition:\s*transform var\(--workspace-motion-panel\) var\(--workspace-motion-ease-out\),\s*opacity var\(--workspace-motion-standard\) var\(--workspace-motion-ease-out\)/)
  assert.match(globalCss, /\.workspace-modal-enter-active[\s\S]*transition:\s*opacity var\(--workspace-motion-standard\) var\(--workspace-motion-ease-out\),\s*transform var\(--workspace-motion-standard\) var\(--workspace-motion-ease-out\)/)
  assert.match(globalCss, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.workspace-slide-enter-from,[\s\S]*\.workspace-modal-leave-to[\s\S]*transform:\s*none;/)
})

test('workspace drawer and modal rely on shared transition names without scoped duplicate timing', () => {
  assert.match(drawerSource, /<Transition name="workspace-fade">/)
  assert.match(drawerSource, /<Transition name="workspace-slide">/)
  assert.doesNotMatch(drawerSource, /<style scoped>[\s\S]*workspace-slide-enter-active/)

  assert.match(modalSource, /<Transition name="workspace-fade">/)
  assert.match(modalSource, /<Transition name="workspace-modal">/)
  assert.doesNotMatch(modalSource, /<style scoped>[\s\S]*workspace-modal-enter-active/)
})
