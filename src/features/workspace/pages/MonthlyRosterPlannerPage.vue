<script setup>
import {
  Download,
  Filter,
  Save,
  Search,
  Upload,
  X,
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import WorkspaceSurface from '../components/WorkspaceSurface.vue'
import AssignmentDrawer from '../components/roster/AssignmentDrawer.vue'
import RosterGrid from '../components/roster/RosterGrid.vue'
import { useRosterPlanner } from '../composables/useRosterPlanner'
import { ref } from 'vue'

const {
  plannerDays,
  monthLabel,
  year,
  month,
  filteredGroups,
  searchTerm,
  loading,
  saving,
  errorMessage,
  saveErrorMessage,
  selectedCell,
  drawerOpen,
  hasUnsavedChanges,
  selectedAssignment,
  selectedShiftCode,
  validationWarning,
  shiftCodeOptions,
  shiftCodeColorMap,
  shiftDetailsByTeam,
  allTeams,
  selectedTeamIds,
  importExportLoading,
  importExportError,
  openCell,
  closeDrawer,
  setShiftCode,
  applySelectedShift,
  discardChanges,
  saveChanges,
  toggleTeamFilter,
  clearTeamFilter,
  exportRoster,
  reloadRoster,
} = useRosterPlanner()

const showTeamFilter = ref(false)
</script>

<template>
  <div class="relative flex h-full flex-col bg-white">
    <div class="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div class="flex items-center gap-4">
        <div>
          <div class="text-xs font-semibold uppercase tracking-wide text-slate-400">Monthly Roster</div>
          <div class="text-sm font-semibold text-slate-800">{{ monthLabel }}</div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="relative">
          <label for="workspace-roster-search" class="sr-only">Filter roster staff</label>
          <Search class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            id="workspace-roster-search"
            name="workspace-roster-search"
            v-model="searchTerm"
            type="text"
            placeholder="Filter staff..."
            class="w-48 rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
        <div class="relative">
          <button 
            class="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            :class="{ 'border-teal-500 bg-teal-50': selectedTeamIds.length > 0 }"
            @click="showTeamFilter = !showTeamFilter"
          >
            <Filter class="h-3.5 w-3.5" />
            Teams {{ selectedTeamIds.length > 0 ? `(${selectedTeamIds.length})` : '(All)' }}
          </button>
          <div 
            v-if="showTeamFilter" 
            class="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Filter by Team</span>
              <button 
                v-if="selectedTeamIds.length > 0"
                class="text-xs text-teal-600 hover:text-teal-700"
                @click="clearTeamFilter"
              >
                Clear
              </button>
            </div>
            <div class="space-y-1 max-h-64 overflow-auto">
              <label 
                v-for="team in allTeams" 
                :key="team.id"
                class="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-slate-50 cursor-pointer"
              >
                <input 
                  type="checkbox" 
                  :checked="selectedTeamIds.includes(team.id)"
                  @change="toggleTeamFilter(team.id)"
                  class="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span 
                  class="w-2 h-2 rounded-full flex-shrink-0"
                  :style="{ backgroundColor: team.color || '#94a3b8' }"
                ></span>
                <span class="text-sm text-slate-700">{{ team.name }}</span>
              </label>
            </div>
          </div>
        </div>
        <div class="h-4 w-px bg-slate-200"></div>
        <RouterLink
          to="/workspace/import-export"
          class="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          <Upload class="h-3.5 w-3.5" />
          Import
        </RouterLink>
        <button 
          class="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="importExportLoading"
          @click="exportRoster"
        >
          <Download class="h-3.5 w-3.5" />
          {{ importExportLoading ? 'Exporting...' : 'Export' }}
        </button>
      </div>
    </div>

    <WorkspaceSurface v-if="errorMessage" tone="muted" class="m-4 border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
      <div class="flex items-center justify-between gap-4">
        <span>{{ errorMessage }}</span>
        <button class="rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100" @click="reloadRoster">
          Retry
        </button>
      </div>
    </WorkspaceSurface>

    <div v-if="saveErrorMessage" class="mx-4 mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      {{ saveErrorMessage }}
    </div>

    <div v-if="importExportError" class="mx-4 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      <div class="flex items-center justify-between gap-4">
        <span>{{ importExportError }}</span>
        <button class="rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100" @click="importExportError = ''">
          Dismiss
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex flex-1 items-center justify-center p-8 text-sm text-slate-500">
      Loading monthly roster for {{ monthLabel }}...
    </div>
    <div v-else-if="!filteredGroups.length" class="flex flex-1 items-center justify-center p-8 text-sm text-slate-500">
      No roster data returned for {{ monthLabel }}.
    </div>
    <RosterGrid
      v-else
      :days="plannerDays"
      :groups="filteredGroups"
      :selected-cell="selectedCell"
      :shift-code-color-map="shiftCodeColorMap"
      :shift-details-by-team="shiftDetailsByTeam"
      @select-cell="openCell($event.staffId, $event.day)"
    />

    <Transition name="status-bar">
      <div
        v-if="hasUnsavedChanges"
        class="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-6 rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-white shadow-lg shadow-slate-900/20"
      >
        <div class="flex items-center gap-2">
          <div class="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></div>
          <span class="text-sm font-medium">You have unsaved changes</span>
        </div>
        <div class="flex items-center gap-2">
          <button class="rounded-md px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-slate-700" @click="discardChanges">
            Discard
          </button>
          <button class="flex items-center gap-1.5 rounded-md bg-teal-500 px-4 py-1.5 text-xs font-semibold text-slate-900 shadow-sm transition-colors hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-70" :disabled="saving" @click="saveChanges">
            <Save class="h-3.5 w-3.5" />
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </Transition>

    <AssignmentDrawer
      v-model="drawerOpen"
      :assignment="selectedAssignment"
      :selected-shift-code="selectedShiftCode"
      :shift-code-options="shiftCodeOptions"
      :validation-warning="validationWarning"
      :year="year"
      :month="month"
      @select-code="setShiftCode"
      @apply="applySelectedShift"
    />
  </div>
</template>

<style scoped>
.status-bar-enter-active,
.status-bar-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.status-bar-enter-from,
.status-bar-leave-to {
  opacity: 0;
  transform: translate(-50%, 16px);
}
</style>
