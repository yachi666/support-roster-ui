<script setup>
import { computed, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { AlertTriangle, Building2, Save, Search, Undo2, Users, X } from 'lucide-vue-next'
import WorkspaceModal from './WorkspaceModal.vue'
import AssignmentDrawer from './roster/AssignmentDrawer.vue'
import RosterGrid from './roster/RosterGrid.vue'
import { createPlannerDays } from '../lib/period'
import { removePreviewTeams, resolvePreviewTeamKey, restorePreviewTeam } from '../lib/previewTeams'
import { useWorkspacePageSearch } from '../composables/useWorkspacePageSearch'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  preview: { type: Object, default: null },
  saving: { type: Boolean, default: false },
  canSave: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'save'])
const { t } = useI18n()

function cloneGroups(groups) {
  return groups.map((group) => ({
    ...group,
    staff: group.staff.map((person) => ({
      ...person,
      schedule: [...person.schedule],
    })),
  }))
}

function buildScheduleArray(scheduleMap, totalDays) {
  return Array.from({ length: totalDays }, (_, index) => scheduleMap?.[String(index + 1)] || scheduleMap?.[index + 1] || '')
}

function normalizeGroups(groups, totalDays) {
  return (groups || []).map((group, index) => ({
    teamId: group.teamId,
    previewTeamKey: resolvePreviewTeamKey(group, index),
    team: group.teamName,
    color: group.color,
    newTeam: Boolean(group.newTeam),
    staff: (group.staff || []).map((person) => ({
      id: person.previewStaffId,
      existingStaffId: person.staffRecordId,
      staffId: person.staffId,
      name: person.staffName,
      avatar: person.avatar,
      role: person.roleName || 'Unassigned',
      teamId: group.teamId ? String(group.teamId) : '',
      teamName: group.teamName,
      newStaff: Boolean(person.newStaff),
      schedule: buildScheduleArray(person.schedule, totalDays),
    })),
  }))
}

function buildStaffIndex(groups) {
  const index = new Map()
  for (const group of groups) {
    for (const staff of group.staff) {
      index.set(staff.id, { group, staff })
    }
  }
  return index
}

function findCellCode(staffIndex, staffId, day) {
  return staffIndex.get(staffId)?.staff?.schedule?.[day - 1] || ''
}

function normalizeShiftCodeOptions(options) {
  const optionSet = new Set(options || [])
  optionSet.add('Clear')
  return Array.from(optionSet)
}

function normalizeShiftCodeOptionsByTeam(optionsByTeam) {
  return Object.fromEntries(
    Object.entries(optionsByTeam || {}).map(([teamId, options]) => [String(teamId), normalizeShiftCodeOptions(options)]),
  )
}

function findAssignment(staffIndex, cell) {
  if (!cell) {
    return null
  }

  const indexedAssignment = staffIndex.get(cell.staffId)
  if (!indexedAssignment) {
    return null
  }

  return {
    group: indexedAssignment.group,
    staff: indexedAssignment.staff,
    day: cell.day,
    currentCode: indexedAssignment.staff.schedule[cell.day - 1] || '',
  }
}

function applyScheduleUpdate({ rosterStaffIndex, baseStaffIndex, pendingUpdates, staffId, day, shiftCode }) {
  const assignment = findAssignment(rosterStaffIndex.value, { staffId, day })
  if (!assignment) {
    return false
  }

  const normalizedCode = shiftCode || ''
  const updateKey = `${staffId}:${day}`
  const nextUpdates = new Map(pendingUpdates.value)
  const originalCode = findCellCode(baseStaffIndex.value, staffId, day)

  assignment.staff.schedule[day - 1] = normalizedCode

  if (normalizedCode === originalCode) {
    nextUpdates.delete(updateKey)
  } else {
    nextUpdates.set(updateKey, { staffId, day, shiftCode: normalizedCode })
  }

  pendingUpdates.value = nextUpdates
  return true
}

const rosterGroups = ref([])
const baseGroups = ref([])
const searchTerm = useWorkspacePageSearch()
const selectedTeamIds = ref([])
const removedTeamIds = ref([])
const selectedCell = ref(null)
const selectedRange = ref(null)
const drawerOpen = shallowRef(false)
const selectedShiftCode = shallowRef('')
const pendingUpdates = ref(new Map())

const plannerDays = computed(() => createPlannerDays(props.preview?.year || 2026, props.preview?.month || 1))
const rosterStaffIndex = computed(() => buildStaffIndex(rosterGroups.value))
const baseStaffIndex = computed(() => buildStaffIndex(baseGroups.value))
const selectedAssignment = computed(() => findAssignment(rosterStaffIndex.value, selectedCell.value))
const shiftCodeOptions = computed(() => normalizeShiftCodeOptions(props.preview?.shiftCodeOptions || []))
const shiftCodeOptionsByTeam = computed(() => normalizeShiftCodeOptionsByTeam(props.preview?.shiftCodeOptionsByTeam || {}))
const shiftCodeColorMap = computed(() => props.preview?.shiftCodeColorMap || {})
const shiftDetailsByTeam = computed(() => props.preview?.shiftDetailsByTeam || {})
const pendingUpdateKeySet = computed(() => new Set(pendingUpdates.value.keys()))
const hasUnsavedChanges = computed(() => pendingUpdates.value.size > 0)
const pendingUpdateCount = computed(() => pendingUpdates.value.size)

const activePreviewState = computed(() => removePreviewTeams(rosterGroups.value, removedTeamIds.value))

const allTeams = computed(() => {
  const teamMap = new Map()
  activePreviewState.value.groups.forEach((group) => {
    if (!teamMap.has(group.previewTeamKey)) {
      teamMap.set(group.previewTeamKey, {
        id: group.previewTeamKey,
        name: group.team,
        newTeam: group.newTeam,
      })
    }
  })
  return Array.from(teamMap.values())
})

const removedTeams = computed(() => activePreviewState.value.removedTeams)

const filteredGroups = computed(() => {
  let result = activePreviewState.value.groups
  if (selectedTeamIds.value.length > 0) {
    result = result.filter(group => selectedTeamIds.value.includes(group.previewTeamKey))
  }

  const query = searchTerm.value.trim().toLowerCase()
  if (!query) {
    return result
  }

  return result
    .map(group => ({
      ...group,
      staff: group.staff.filter((person) => [person.name, person.staffId, person.role].join(' ').toLowerCase().includes(query)),
    }))
    .filter(group => group.staff.length > 0)
})

const visibleStaffRows = computed(() =>
  filteredGroups.value.flatMap(group => group.staff.map(person => ({ staffId: person.id, teamId: group.teamId }))),
)

const availableShiftCodeOptions = computed(() => {
  const teamId = selectedAssignment.value?.group?.teamId || selectedAssignment.value?.staff?.teamId
  const teamScopedOptions = teamId ? shiftCodeOptionsByTeam.value[String(teamId)] : null
  const options = teamScopedOptions && teamScopedOptions.length ? teamScopedOptions : shiftCodeOptions.value

  if (selectedAssignment.value?.currentCode && !options.includes(selectedAssignment.value.currentCode)) {
    return normalizeShiftCodeOptions([...options, selectedAssignment.value.currentCode])
  }

  return options
})

watch([selectedAssignment, availableShiftCodeOptions], ([assignment, options]) => {
  selectedShiftCode.value = assignment?.currentCode || options[0] || ''
}, { immediate: true })

watch(
  () => [props.modelValue, props.preview],
  ([isOpen, preview]) => {
    if (!isOpen || !preview) {
      return
    }

    const normalizedGroups = normalizeGroups(preview.groups, plannerDays.value.length)
    baseGroups.value = normalizedGroups
    rosterGroups.value = cloneGroups(normalizedGroups)
    selectedCell.value = null
    selectedRange.value = null
    drawerOpen.value = false
    pendingUpdates.value = new Map()
    selectedTeamIds.value = []
    removedTeamIds.value = []
  },
  { immediate: true },
)

function closeModal() {
  emit('update:modelValue', false)
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

function openCell(staffId, day) {
  selectedCell.value = { staffId, day }
  drawerOpen.value = true
}

function openSelectedCell(payload) {
  const staffId = payload?.staffId || selectedCell.value?.staffId
  const day = payload?.day || selectedCell.value?.day
  if (!staffId || !day) {
    return
  }
  openCell(staffId, day)
}

function closeDrawer() {
  drawerOpen.value = false
}

function setShiftCode(code) {
  selectedShiftCode.value = code
}

function applySelectedShift() {
  if (!selectedAssignment.value) {
    return
  }
  const code = selectedShiftCode.value === 'Clear' ? '' : selectedShiftCode.value
  applyScheduleUpdate({
    rosterStaffIndex,
    baseStaffIndex,
    pendingUpdates,
    staffId: selectedAssignment.value.staff.id,
    day: selectedAssignment.value.day,
    shiftCode: code,
  })
  drawerOpen.value = false
}

function applyAndAdvanceDay() {
  if (!selectedCell.value) {
    return
  }
  const { staffId, day } = selectedCell.value
  applySelectedShift()
  const nextDay = day + 1
  if (nextDay <= plannerDays.value.length) {
    openCell(staffId, nextDay)
  }
}

function copySelectedWeekToNextWeek() {
  if (!selectedAssignment.value) {
    return null
  }

  const totalDays = plannerDays.value.length
  const currentDate = new Date(props.preview.year, props.preview.month - 1, selectedAssignment.value.day)
  const dayOfWeek = currentDate.getDay()
  const mondayOffset = (dayOfWeek + 6) % 7
  const sourceWeekStart = Math.max(1, selectedAssignment.value.day - mondayOffset)
  const sourceWeekEnd = Math.min(totalDays, sourceWeekStart + 6)

  let copiedCount = 0
  let firstTargetDay = null

  for (let sourceDay = sourceWeekStart; sourceDay <= sourceWeekEnd; sourceDay += 1) {
    const targetDay = sourceDay + 7
    if (targetDay > totalDays) {
      continue
    }
    const sourceCode = selectedAssignment.value.staff.schedule[sourceDay - 1] || ''
    const didApply = applyScheduleUpdate({
      rosterStaffIndex,
      baseStaffIndex,
      pendingUpdates,
      staffId: selectedAssignment.value.staff.id,
      day: targetDay,
      shiftCode: sourceCode,
    })
    if (didApply) {
      copiedCount += 1
      if (firstTargetDay == null) {
        firstTargetDay = targetDay
      }
    }
  }

  if (!copiedCount || firstTargetDay == null) {
    return null
  }

  return { copiedCount, firstTargetDay, staffId: selectedAssignment.value.staff.id }
}

function copyWeekForward() {
  const result = copySelectedWeekToNextWeek()
  if (result) {
    openCell(result.staffId, result.firstTargetDay)
  }
}

function applySelectedRange(endDay) {
  if (!selectedAssignment.value) {
    return null
  }

  const totalDays = plannerDays.value.length
  const normalizedEndDay = Math.min(Math.max(Number(endDay), selectedAssignment.value.day), totalDays)
  const code = selectedShiftCode.value === 'Clear' ? '' : selectedShiftCode.value
  let updatedCount = 0

  for (let day = selectedAssignment.value.day; day <= normalizedEndDay; day += 1) {
    const didApply = applyScheduleUpdate({
      rosterStaffIndex,
      baseStaffIndex,
      pendingUpdates,
      staffId: selectedAssignment.value.staff.id,
      day,
      shiftCode: code,
    })
    if (didApply) {
      updatedCount += 1
    }
  }

  if (!updatedCount) {
    return null
  }

  return { updatedCount, endDay: normalizedEndDay, staffId: selectedAssignment.value.staff.id }
}

function applyRangeForward(endDay) {
  const result = applySelectedRange(endDay)
  if (result) {
    openCell(result.staffId, result.endDay)
  }
}

function toggleTeamFilter(teamId) {
  selectedTeamIds.value = selectedTeamIds.value.includes(teamId)
    ? selectedTeamIds.value.filter(id => id !== teamId)
    : [...selectedTeamIds.value, teamId]
}

function removeTeam(teamId) {
  const normalizedTeamId = String(teamId)
  if (removedTeamIds.value.includes(normalizedTeamId)) {
    return
  }

  removedTeamIds.value = [...removedTeamIds.value, normalizedTeamId]
  selectedTeamIds.value = selectedTeamIds.value.filter((id) => String(id) !== normalizedTeamId)

  if (selectedAssignment.value?.group?.previewTeamKey === normalizedTeamId) {
    selectedCell.value = null
    selectedRange.value = null
    drawerOpen.value = false
  }
}

function restoreTeam(teamId) {
  removedTeamIds.value = restorePreviewTeam(removedTeamIds.value, teamId)
}

function buildSavePayload() {
  return {
    year: props.preview.year,
    month: props.preview.month,
    rows: activePreviewState.value.groups.flatMap(group =>
      group.staff.map(person => ({
        staffId: person.staffId,
        teamName: group.team,
        schedule: Object.fromEntries(person.schedule.map((code, index) => [index + 1, code || ''])),
      })),
    ),
  }
}

function savePreview() {
  emit('save', buildSavePayload())
}
</script>

<template>
  <WorkspaceModal
    :model-value="modelValue"
    :title="t('workspace.importExport.previewModal.title')"
    width="min(1480px, 96vw)"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #subtitle>
      <p v-if="preview" class="mt-1 text-sm text-slate-500">
        {{ t('workspace.importExport.previewModal.subtitle', { month: `${preview.year}-${String(preview.month).padStart(2, '0')}` }) }}
      </p>
    </template>

    <div v-if="preview" class="space-y-5">
      <div class="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div class="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <AlertTriangle class="h-4 w-4 text-amber-500" />
            {{ t('workspace.importExport.previewModal.summaryTitle') }}
          </div>
          <div class="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
            <span class="rounded-full border border-slate-200 bg-white px-3 py-1.5">{{ t('workspace.importExport.previewModal.parsed', { count: preview.totalRecords || 0 }) }}</span>
            <span class="rounded-full border border-slate-200 bg-white px-3 py-1.5">{{ t('workspace.importExport.previewModal.ready', { count: preview.validRecords || 0 }) }}</span>
            <span class="rounded-full border border-slate-200 bg-white px-3 py-1.5">{{ t('workspace.importExport.previewModal.review', { count: preview.invalidRecords || 0 }) }}</span>
            <span v-if="hasUnsavedChanges" class="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-700">
              {{ t('workspace.importExport.previewModal.unsaved', { count: pendingUpdateCount }) }}
            </span>
          </div>
          <p v-if="preview.validationWarning" class="mt-3 text-sm text-slate-600">
            {{ preview.validationWarning }}
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div class="rounded-2xl border border-slate-200 bg-white p-4">
            <div class="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Users class="h-4 w-4 text-teal-500" />
              {{ t('workspace.importExport.previewModal.newStaffTitle') }}
            </div>
            <p class="mt-2 text-xs leading-6 text-slate-500">
              <template v-if="preview.newStaffIds?.length">
                {{ t('workspace.importExport.previewModal.newStaffHint', { count: preview.newStaffIds.length }) }}
              </template>
              <template v-else>
                {{ t('workspace.importExport.previewModal.none') }}
              </template>
            </p>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-4">
            <div class="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Building2 class="h-4 w-4 text-sky-500" />
              {{ t('workspace.importExport.previewModal.newTeamTitle') }}
            </div>
            <p class="mt-2 text-xs leading-6 text-slate-500">
              <template v-if="preview.newTeamNames?.length">
                {{ t('workspace.importExport.previewModal.newTeamHint', { count: preview.newTeamNames.length }) }}
              </template>
              <template v-else>
                {{ t('workspace.importExport.previewModal.none') }}
              </template>
            </p>
          </div>
        </div>
      </div>

      <div class="grid gap-3 xl:grid-cols-[1fr_auto] xl:items-center">
        <div class="relative max-w-sm">
          <label for="import-preview-search" class="sr-only">{{ t('workspace.importExport.previewModal.search') }}</label>
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="import-preview-search"
            v-model="searchTerm"
            type="text"
            :placeholder="t('workspace.importExport.previewModal.searchPlaceholder')"
            class="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div class="flex flex-wrap gap-2">
          <div
            v-for="team in allTeams"
            :key="team.id"
            :class="[
              'inline-flex items-center overflow-hidden rounded-full border bg-white text-xs font-medium transition-colors',
              selectedTeamIds.includes(team.id)
                ? 'border-slate-900 text-white'
                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900',
            ]"
          >
            <button
              type="button"
              :class="[
                'px-3 py-1.5 transition-colors',
                selectedTeamIds.includes(team.id)
                  ? 'bg-slate-900 text-white'
                  : 'bg-white',
              ]"
              @click="toggleTeamFilter(team.id)"
            >
              {{ team.name
              }}<span v-if="team.newTeam"> · {{ t('workspace.importExport.previewModal.newTag') }}</span>
            </button>
            <button
              type="button"
              class="border-l border-slate-200/80 px-2 py-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
              :aria-label="t('workspace.importExport.previewModal.removeTeam', { name: team.name })"
              @click="removeTeam(team.id)"
            >
              <X class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div v-if="removedTeams.length" class="flex flex-wrap gap-2">
          <span class="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
            {{ t('workspace.importExport.previewModal.removedTeams', { count: removedTeams.length }) }}
          </span>
          <button
            v-for="team in removedTeams"
            :key="`removed-${team.previewTeamKey}`"
            type="button"
            class="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50"
            @click="restoreTeam(team.previewTeamKey)"
          >
            <Undo2 class="h-3.5 w-3.5" />
            {{ team.team }}
          </button>
        </div>
      </div>

      <div v-if="preview.issues?.length" class="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <div class="text-sm font-semibold text-amber-900">{{ t('workspace.importExport.previewModal.issueTitle') }}</div>
            <div class="mt-1 text-xs text-amber-700">{{ t('workspace.importExport.previewModal.issueHint') }}</div>
          </div>
          <div class="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-medium text-amber-700">
            {{ t('workspace.importExport.previewModal.issueCount', { count: preview.issues.length }) }}
          </div>
        </div>
        <div class="mt-3 max-h-36 space-y-2 overflow-y-auto pr-1 text-sm text-amber-900">
          <div v-for="issue in preview.issues" :key="issue.id || `${issue.type}-${issue.description}`" class="rounded-xl border border-amber-200 bg-white/80 px-3 py-2">
            <div class="font-medium">{{ issue.type }}</div>
            <div class="mt-1 text-xs leading-5 text-amber-700">{{ issue.description }}</div>
          </div>
        </div>
      </div>

      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <RosterGrid
          :days="plannerDays"
          :groups="filteredGroups"
          :selected-cell="selectedCell"
          :selected-range="selectedRange"
          :year="preview.year"
          :month="preview.month"
          :shift-code-color-map="shiftCodeColorMap"
          :shift-details-by-team="shiftDetailsByTeam"
          :pending-update-key-set="pendingUpdateKeySet"
          @select-cell="({ staffId, day }) => selectCell(staffId, day)"
          @select-range="selectRange"
          @navigate-cell="handleGridNavigation"
          @open-selected-cell="openSelectedCell"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between gap-3">
        <button
          type="button"
          class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          @click="closeModal"
        >
          {{ t('common.cancel') }}
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="!canSave || saving"
          @click="savePreview"
        >
          <Save class="h-4 w-4" />
          {{ saving ? t('workspace.importExport.previewModal.saving') : t('workspace.importExport.previewModal.save') }}
        </button>
      </div>
    </template>
  </WorkspaceModal>

  <AssignmentDrawer
    :model-value="drawerOpen"
    :assignment="selectedAssignment"
    :selected-range="selectedRange"
    :selected-shift-code="selectedShiftCode"
    :shift-code-options="availableShiftCodeOptions"
    :validation-warning="preview?.validationWarning || ''"
    :readonly="!canSave"
    :year="preview?.year || 2026"
    :month="preview?.month || 1"
    @update:model-value="closeDrawer"
    @select-code="setShiftCode"
    @apply="applySelectedShift"
    @apply-and-next="applyAndAdvanceDay"
    @copy-week="copyWeekForward"
    @apply-range="applyRangeForward"
    @clear-range="clearRangeSelection"
  />
</template>
