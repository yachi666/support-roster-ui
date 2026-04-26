<script setup>
import { computed } from 'vue'
import { ExternalLink, Link as LinkIcon, Copy, Settings } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import StaffIdHoverCard from './StaffIdHoverCard.vue'

const props = defineProps({
  teams: {
    type: Array,
    required: true,
  },
  totalCount: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['copy'])

const displayedEntryStart = computed(() => (props.teams.length ? 1 : 0))

function emitCopy(text, label) {
  emit('copy', { text, label })
}

function roleBadgeClass(role) {
  return cn(
    'rounded border px-2 py-0.5 text-xs font-medium',
    role === 'Upstream'
      ? 'border-blue-200 bg-blue-50 text-blue-700'
      : 'border-purple-200 bg-purple-50 text-purple-700',
  )
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="sticky top-0 z-20 bg-slate-50">
          <tr>
            <th scope="col" class="sticky left-0 z-30 bg-slate-50 px-4 py-3 text-left font-medium whitespace-nowrap text-slate-500 shadow-[1px_0_0_0_#e2e8f0]">
              Team Name
            </th>
            <th scope="col" class="px-4 py-3 text-left font-medium whitespace-nowrap text-slate-500">Role</th>
            <th scope="col" class="min-w-[240px] px-4 py-3 text-left font-medium text-slate-500">Staff ID</th>
            <th scope="col" class="px-4 py-3 text-left font-medium whitespace-nowrap text-slate-500">Team Email</th>
            <th scope="col" class="px-4 py-3 text-left font-medium whitespace-nowrap text-slate-500">xMatter Group</th>
            <th scope="col" class="px-4 py-3 text-left font-medium whitespace-nowrap text-slate-500">GSD Group</th>
            <th scope="col" class="px-4 py-3 text-left font-medium whitespace-nowrap text-slate-500">EIM ID</th>
            <th scope="col" class="px-4 py-3 text-left font-medium whitespace-nowrap text-slate-500">Other</th>
            <th scope="col" class="px-4 py-3 text-right font-medium whitespace-nowrap text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white">
          <tr
            v-for="team in props.teams"
            :key="team.id"
            class="group transition-colors hover:bg-slate-50/60"
          >
            <td class="sticky left-0 z-10 bg-white px-4 py-3 whitespace-nowrap shadow-[1px_0_0_0_#e2e8f0] transition-colors group-hover:bg-slate-50/60">
              <span class="font-semibold text-slate-900">{{ team.name }}</span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="role in team.roles"
                  :key="role"
                  :class="roleBadgeClass(role)"
                >
                  {{ role }}
                </span>
              </div>
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-1.5">
                <StaffIdHoverCard
                  v-for="member in team.staff"
                  :key="member.id"
                  :member="member"
                />
              </div>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <a
                :href="`mailto:${team.email}`"
                class="text-sm text-blue-600 transition-colors hover:text-blue-800 hover:underline"
              >
                {{ team.email }}
              </a>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="group/copy flex items-center gap-2">
                <span class="rounded border border-slate-100 bg-slate-50 px-1.5 py-1 font-mono text-xs text-slate-600">
                  {{ team.xMatter }}
                </span>
                <button
                  type="button"
                  class="text-slate-400 opacity-0 transition-all hover:text-blue-600 focus:opacity-100 group-hover/copy:opacity-100"
                  aria-label="Copy xMatter Group ID"
                  title="Copy xMatter Group ID"
                  @click="emitCopy(team.xMatter, 'xMatter Group ID')"
                >
                  <Copy class="h-4 w-4" />
                </button>
              </div>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="group/copy flex items-center gap-2">
                <span class="rounded border border-slate-100 bg-slate-50 px-1.5 py-1 font-mono text-xs text-slate-600">
                  {{ team.gsd }}
                </span>
                <button
                  type="button"
                  class="text-slate-400 opacity-0 transition-all hover:text-blue-600 focus:opacity-100 group-hover/copy:opacity-100"
                  aria-label="Copy GSD Group ID"
                  title="Copy GSD Group ID"
                  @click="emitCopy(team.gsd, 'GSD Group ID')"
                >
                  <Copy class="h-4 w-4" />
                </button>
              </div>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span class="font-mono text-xs text-slate-600">{{ team.eim }}</span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="flex flex-wrap gap-2">
                <a
                  v-for="link in team.links"
                  :key="`${team.id}-${link.label}`"
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
                >
                  <LinkIcon class="h-3.5 w-3.5" />
                  {{ link.label }}
                  <ExternalLink class="h-3 w-3 opacity-60" />
                </a>
              </div>
            </td>
            <td class="px-4 py-3 text-right whitespace-nowrap">
              <button
                type="button"
                class="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Open team actions"
              >
                <Settings class="h-4 w-4" />
              </button>
            </td>
          </tr>
          <tr v-if="!props.teams.length">
            <td colspan="9" class="px-6 py-12 text-center text-sm text-slate-500">
              No teams match the current search.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
      <div>Showing {{ displayedEntryStart }} to {{ props.teams.length }} of {{ props.totalCount }} entries</div>
        <div class="flex items-center gap-2">
          <button class="cursor-not-allowed rounded border border-slate-200 bg-white px-2 py-1 text-slate-400 disabled:opacity-100" type="button" disabled>
            Previous
          </button>
          <button class="cursor-not-allowed rounded border border-slate-200 bg-white px-2 py-1 text-slate-400 disabled:opacity-100" type="button" disabled>
            Next
          </button>
        </div>
      </div>
  </div>
</template>
