<script setup>
import {
  AlertTriangle,
  Download,
  Filter,
  Save,
  Search,
  Upload,
} from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { onBeforeRouteLeave, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import WorkspaceSurface from '../components/WorkspaceSurface.vue'
import AssignmentDrawer from '../components/roster/AssignmentDrawer.vue'
import RosterGrid from '../components/roster/RosterGrid.vue'
import { useRosterPlanner } from '../composables/useRosterPlanner'
import { registerWorkspacePeriodGuard } from '../composables/useWorkspacePeriod'

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
  saveSuccessMessage,
  selectedCell,
  drawerOpen,
  hasUnsavedChanges,
  pendingUpdateCount,
  pendingUpdateKeySet,
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
  copySelectedWeekToNextWeek,
  applySelectedRange,
  discardChanges,
  saveChanges,
  toggleTeamFilter,
  clearTeamFilter,
  exportRoster,
  reloadRoster,
} = useRosterPlanner()
const authStore = useAuthStore()
const { t } = useI18n()

const showTeamFilter = ref(false)
const selectedRange = ref(null)
const hasRangeSelection = computed(() => {
  return Boolean(
    selectedRange.value &&
    selectedRange.value.staffId &&
    selectedRange.value.endDay > selectedRange.value.startDay,
  )
})
const selectedRangeSummary = computed(() => {
  if (!hasRangeSelection.value) {
    return ''
  }

  return t('workspace.roster.selectedDays', {
    startDay: selectedRange.value.startDay,
    endDay: selectedRange.value.endDay,
  })
})

const activeFilterSummary = computed(() => {
  const filters = []

  if (searchTerm.value.trim()) {
    filters.push(t('workspace.roster.searchSummary', { value: searchTerm.value.trim() }))
  }

  if (selectedTeamIds.value.length > 0) {
    filters.push(t('workspace.roster.teamFilterSummary', { count: selectedTeamIds.value.length }))
  }

  return filters
})
const selectedAssignmentEditable = computed(() => {
  const teamId = selectedAssignment.value?.group?.teamId || selectedAssignment.value?.staff?.teamId
  return authStore.canEditTeam(teamId)
})

const visibleStaffRows = computed(() =>
  filteredGroups.value.flatMap((group) =>
    group.staff.map((person) => ({
      staffId: person.id,
      teamId: group.teamId,
    })),
  ),
)

function confirmDiscardPendingChanges() {
  if (!hasUnsavedChanges.value) {
    return true
  }

  return window.confirm(t('workspace.roster.leavePrompt', { count: pendingUpdateCount.value }))
}

function selectCell(staffId, day) {
  selectedCell.value = { staffId, day }
  selectedRange.value = { staffId, startDay: day, endDay: day }
}

function selectRange({ staffId, startDay, endDay, openEditor = false }) {
  selectedCell.value = { staffId, day: startDay }
  selectedRange.value = { staffId, startDay, endDay }

  if (openEditor) {
    openCell(staffId, startDay)
  }
}

function clearRangeSelection() {
  if (!selectedCell.value?.staffId || !selectedCell.value?.day) {
    selectedRange.value = null
    return
  }

  selectedRange.value = {
    staffId: selectedCell.value.staffId,
    startDay: selectedCell.value.day,
    endDay: selectedCell.value.day,
  }
}

function handleGridNavigation({ rowDelta, dayDelta, staffId, day }) {
  const rows = visibleStaffRows.value
  if (!rows.length) {
    return
  }

  const currentIndex = rows.findIndex((row) => row.staffId === (staffId || selectedCell.value?.staffId))
  const safeIndex = currentIndex === -1 ? 0 : currentIndex
  const nextIndex = Math.min(Math.max(safeIndex + rowDelta, 0), rows.length - 1)
  const nextDay = Math.min(Math.max((day || selectedCell.value?.day || 1) + dayDelta, 1), plannerDays.value.length)

  selectCell(rows[nextIndex].staffId, nextDay)
}

function openSelectedCell(payload) {
  const staffId = payload?.staffId || selectedCell.value?.staffId
  const day = payload?.day || selectedCell.value?.day

  if (!staffId || !day) {
    return
  }

  openCell(staffId, day)
}

function applyAndAdvanceDay() {
  if (!selectedAssignmentEditable.value || !selectedCell.value) {
    return
  }

  const { staffId, day } = selectedCell.value
  applySelectedShift()

  const nextDay = day + 1
  if (nextDay > plannerDays.value.length) {
    return
  }

  openCell(staffId, nextDay)
}

function copyWeekForward() {
  if (!selectedAssignmentEditable.value) {
    return
  }
  const result = copySelectedWeekToNextWeek()
  if (!result) {
    return
  }

  openCell(result.staffId, result.firstTargetDay)
}

function applyRangeForward(endDay) {
  if (!selectedAssignmentEditable.value) {
    return
  }
  const result = applySelectedRange(endDay)
  if (!result) {
    return
  }

  openCell(result.staffId, result.endDay)
}

let unregisterPeriodGuard = null

function handleBeforeUnload(event) {
  if (!hasUnsavedChanges.value) {
    return
  }

  event.preventDefault()
  event.returnValue = ''
}

onMounted(() => {
  unregisterPeriodGuard = registerWorkspacePeriodGuard(() => confirmDiscardPendingChanges())
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  unregisterPeriodGuard?.()
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

onBeforeRouteLeave(() => confirmDiscardPendingChanges())
</script>

<template>
  <div class="relative flex h-full flex-col bg-white">
    <div class="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div class="flex items-center gap-4">
          <div>
            <div class="text-xs font-semibold uppercase tracking-wide text-slate-400">{{ t('workspace.roster.title') }}</div>
            <div class="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <span>{{ monthLabel }}</span>
              <span v-if="hasUnsavedChanges" class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-700">
                {{ t('workspace.roster.headerUnsaved', { count: pendingUpdateCount }) }}
              </span>
            </div>
          </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="relative">
          <label for="workspace-roster-search" class="sr-only">{{ t('workspace.roster.filterStaff') }}</label>
          <Search class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            id="workspace-roster-search"
            name="workspace-roster-search"
            v-model="searchTerm"
            type="text"
            :placeholder="t('workspace.roster.filterPlaceholder')"
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
            {{ selectedTeamIds.length > 0 ? t('workspace.roster.teamButton', { count: selectedTeamIds.length }) : t('workspace.roster.teamButtonAll') }}
          </button>
          <div 
            v-if="showTeamFilter" 
            class="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ t('workspace.roster.filterByTeam') }}</span>
              <button 
                v-if="selectedTeamIds.length > 0"
                class="text-xs text-teal-600 hover:text-teal-700"
                @click="clearTeamFilter"
              >
                {{ t('workspace.roster.clear') }}
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
          v-if="authStore.canWriteWorkspace"
          to="/workspace/import-export"
          class="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          <Upload class="h-3.5 w-3.5" />
          {{ t('workspace.roster.import') }}
        </RouterLink>
        <button 
          class="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="importExportLoading"
          @click="exportRoster"
        >
          <Download class="h-3.5 w-3.5" />
          {{ importExportLoading ? t('workspace.roster.exporting') : t('workspace.roster.export') }}
        </button>
      </div>
    </div>

    <div v-if="hasUnsavedChanges || activeFilterSummary.length || validationWarning || hasRangeSelection" class="border-b border-slate-200 bg-slate-50/80 px-4 py-3">
      <div class="flex flex-wrap items-center gap-2">
        <span class="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
          {{ monthLabel }}
        </span>
        <span v-if="hasUnsavedChanges" class="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-800">
          {{ t('workspace.roster.pendingEdits', { count: pendingUpdateCount }) }}
        </span>
        <span
          v-for="item in activeFilterSummary"
          :key="item"
          class="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600"
        >
          {{ item }}
        </span>
        <span class="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
          {{ t('workspace.roster.keyboardHint') }}
        </span>
        <span
          v-if="hasRangeSelection"
          class="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700"
        >
          {{ selectedRangeSummary }}
        </span>
        <button
          v-if="hasRangeSelection"
          class="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800"
          @click="clearRangeSelection"
        >
          {{ t('workspace.roster.clearRange') }}
        </button>
      </div>
      <div v-if="validationWarning" class="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        <AlertTriangle class="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
        <span>{{ validationWarning }}</span>
      </div>
    </div>

    <WorkspaceSurface v-if="errorMessage" tone="muted" class="m-4 border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
      <div class="flex items-center justify-between gap-4">
        <span>{{ errorMessage }}</span>
        <button class="rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100" @click="reloadRoster">
          {{ t('workspace.roster.retry') }}
        </button>
      </div>
    </WorkspaceSurface>

    <div v-if="saveErrorMessage" class="mx-4 mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      {{ saveErrorMessage }}
    </div>

    <div v-if="saveSuccessMessage" class="mx-4 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      {{ saveSuccessMessage }}
    </div>

    <div v-if="importExportError" class="mx-4 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      <div class="flex items-center justify-between gap-4">
        <span>{{ importExportError }}</span>
        <button class="rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100" @click="importExportError = ''">
          {{ t('workspace.roster.dismiss') }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex flex-1 items-center justify-center p-8 text-sm text-slate-500">
      {{ t('workspace.roster.loading', { monthLabel }) }}
    </div>
    <div v-else-if="!filteredGroups.length" class="flex flex-1 items-center justify-center p-8 text-sm text-slate-500">
      {{ t('workspace.roster.empty', { monthLabel }) }}
    </div>
    <RosterGrid
      v-else
      :days="plannerDays"
      :groups="filteredGroups"
      :selected-cell="selectedCell"
      :selected-range="selectedRange"
      :year="year"
      :month="month"
      :shift-code-color-map="shiftCodeColorMap"
      :shift-details-by-team="shiftDetailsByTeam"
      :pending-update-key-set="pendingUpdateKeySet"
      @select-cell="selectCell($event.staffId, $event.day)"
      @select-range="selectRange"
      @navigate-cell="handleGridNavigation"
      @open-selected-cell="openSelectedCell"
    />

    <Transition name="status-bar">
      <div
        v-if="hasUnsavedChanges && authStore.canWriteWorkspace"
        class="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-6 rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-white shadow-lg shadow-slate-900/20"
      >
        <div class="flex items-center gap-2">
          <div class="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></div>
          <span class="text-sm font-medium">{{ t('workspace.roster.unsavedChanges', { count: pendingUpdateCount }) }}</span>
        </div>
        <div class="flex items-center gap-2">
          <button class="rounded-md px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-slate-700" @click="discardChanges">
            {{ t('workspace.roster.discard') }}
          </button>
          <button class="flex items-center gap-1.5 rounded-md bg-teal-500 px-4 py-1.5 text-xs font-semibold text-slate-900 shadow-sm transition-colors hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-70" :disabled="saving || !authStore.canWriteWorkspace" @click="authStore.canWriteWorkspace && saveChanges()">
            <Save class="h-3.5 w-3.5" />
            {{ !authStore.canWriteWorkspace ? t('common.readonlyMode') : saving ? t('common.saving') : t('workspace.roster.saveChanges') }}
          </button>
        </div>
      </div>
    </Transition>

    <AssignmentDrawer
      v-model="drawerOpen"
      :assignment="selectedAssignment"
      :readonly="!selectedAssignmentEditable"
      :selected-range="selectedRange"
      :selected-shift-code="selectedShiftCode"
      :shift-code-options="shiftCodeOptions"
      :validation-warning="validationWarning"
      :year="year"
      :month="month"
      @select-code="selectedAssignmentEditable && setShiftCode($event)"
      @apply="selectedAssignmentEditable && applySelectedShift()"
      @apply-and-next="applyAndAdvanceDay"
      @copy-week="copyWeekForward"
      @apply-range="applyRangeForward"
      @clear-range="selectedAssignmentEditable && clearRangeSelection()"
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
