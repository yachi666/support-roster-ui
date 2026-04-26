# Viewer Teams Icon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the viewer employee tooltip's text-based Microsoft Teams contact button with the provided Teams PNG icon while keeping the existing Teams chat link behavior intact.

**Architecture:** Keep the change local to the viewer timeline tooltip in `src/components/Timeline.vue`. Add the provided PNG as a static app asset, cover the UI change with a focused source-level test in the repo's existing `node:test` style, and verify the final component still builds cleanly in Vite.

**Tech Stack:** Vue 3 SFCs, Vite, Tailwind utility classes, Node `node:test`

---

## File Map

- `src/components/Timeline.vue` — renders the viewer shift blocks and the employee tooltip; this is where the Teams action markup changes.
- `src/components/Timeline.test.js` — new focused source-level test that guards the icon import and accessible icon-link markup.
- `src/assets/teams-contact-icon.png` — the provided Teams PNG saved into the frontend asset pipeline.

### Task 1: Replace the tooltip Teams CTA with the provided icon

**Files:**
- Create: `src/components/Timeline.test.js`
- Create: `src/assets/teams-contact-icon.png`
- Modify: `src/components/Timeline.vue`
- Test: `src/components/Timeline.test.js`

- [ ] **Step 1: Write the failing test**

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./Timeline.vue', import.meta.url), 'utf8')

test('timeline tooltip renders teams contact as an icon-only link with accessible labeling', () => {
  assert.match(source, /import teamsContactIcon from '@\/assets\/teams-contact-icon\.png'/)
  assert.match(source, /:aria-label="`Contact \$\{layoutShift\.shift\.userName\} in Teams`"/)
  assert.match(
    source,
    /<img\s+[^>]*:src="teamsContactIcon"[^>]*alt=""[^>]*aria-hidden="true"[^>]*class="h-7 w-7 rounded-full object-cover"/s,
  )
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd support-roster-ui && node --test src/components/Timeline.test.js`

Expected: `FAIL` because `Timeline.vue` does not yet import `teams-contact-icon.png`, does not expose the `aria-label`, and does not render the `<img :src="teamsContactIcon" ...>` markup.

- [ ] **Step 3: Write the minimal implementation**

Save the provided attachment as the app asset:

```bash
cd support-roster-ui
mkdir -p src/assets
cp "/Users/lzn/Downloads/下载.png" src/assets/teams-contact-icon.png
```

Update the import list and add the asset import near the top of `src/components/Timeline.vue`:

```vue
<script setup>
import { ref, computed, onMounted, onUnmounted, useTemplateRef } from 'vue'
import { format, addHours, differenceInMinutes } from 'date-fns'
import { fromZonedTime } from 'date-fns-tz'
import { User, Mail, Phone, MessageSquare, Star, Clock } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { cn } from '@/lib/utils'
import { toIanaTimezone } from '@/lib/timezones'
import { hexToRgba } from '@/features/workspace/lib/color'
import { buildMicrosoftTeamsChatUrl } from '@/lib/microsoftTeams'
import teamsContactIcon from '@/assets/teams-contact-icon.png'
```

Replace the current full-width Teams action block inside the tooltip contact section with this icon link:

```vue
<a
  v-if="getMicrosoftTeamsUrl(layoutShift.shift)"
  :href="getMicrosoftTeamsUrl(layoutShift.shift)"
  target="_blank"
  rel="noreferrer"
  :aria-label="`Contact ${layoutShift.shift.userName} in Teams`"
  :title="`Contact ${layoutShift.shift.userName} in Teams`"
  class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#7b83eb]/25 bg-[#eef0ff] transition-transform transition-colors hover:scale-[1.02] hover:border-[#6264a7]/40 hover:bg-[#e3e6ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6264a7]/50 focus-visible:ring-offset-1"
>
  <img
    :src="teamsContactIcon"
    alt=""
    aria-hidden="true"
    class="h-7 w-7 rounded-full object-cover"
  />
</a>
```

Leave the existing email, phone, and Slack rows untouched so only the Teams entry changes.

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd support-roster-ui && node --test src/components/Timeline.test.js`

Expected: `PASS`

- [ ] **Step 5: Commit**

```bash
cd support-roster-ui
git add src/components/Timeline.vue src/components/Timeline.test.js src/assets/teams-contact-icon.png
git commit -m "feat: replace viewer teams button with icon" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 2: Verify the tooltip change against existing Teams behavior and the Vite build

**Files:**
- Modify: `src/components/Timeline.vue` (only if verification reveals an unused import or class issue)
- Test: `src/components/Timeline.test.js`
- Test: `src/lib/microsoftTeams.test.js`

- [ ] **Step 1: Run the focused regression suite**

Run: `cd support-roster-ui && node --test src/components/Timeline.test.js src/lib/microsoftTeams.test.js`

Expected: `PASS` for the new tooltip icon test and the existing Teams URL generation tests.

- [ ] **Step 2: Run the production build**

Run: `cd support-roster-ui && npm run build`

Expected: Vite completes successfully with no Vue compile errors and no unused-import failure caused by removing the old Teams text button.

- [ ] **Step 3: If the build reports stale icon imports, trim them**

If `Timeline.vue` still imports `MessagesSquare` or `ExternalLink`, reduce the icon import line to this exact list:

```vue
import { User, Mail, Phone, MessageSquare, Star, Clock } from 'lucide-vue-next'
```

- [ ] **Step 4: Re-run the regression suite and build**

Run:

```bash
cd support-roster-ui && node --test src/components/Timeline.test.js src/lib/microsoftTeams.test.js && npm run build
```

Expected: all commands succeed.

- [ ] **Step 5: Commit only if Task 2 changed code**

```bash
cd support-roster-ui
git add src/components/Timeline.vue src/components/Timeline.test.js src/assets/teams-contact-icon.png
git commit -m "test: verify viewer teams icon replacement" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```
