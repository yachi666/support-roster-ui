import { computed, ref, shallowRef, watch } from 'vue'
import { api } from '@/api'
import {
  createPlannerDays,
} from '../lib/period'
import { useWorkspacePeriod } from './useWorkspacePeriod'

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
  return Array.from({ length: totalDays }, (_, index) => scheduleMap?.[String(index + 1)] || '')
}

function normalizeGroups(groups, totalDays) {
  return (groups || []).map((group) => ({
    teamId: group.teamId,
    team: group.teamName,
    color: group.color,
    staff: (group.staff || []).map((person) => ({
      id: person.staffId,
      name: person.staffName,
      avatar: person.avatar,
      role: person.roleName || 'Unassigned',
      teamId: person.teamId ? String(person.teamId) : '',
      schedule: buildScheduleArray(person.schedule, totalDays),
    })),
  }))
}

function buildStaffIndex(groups) {
  const index = new Map()

  for (const group of groups) {
    for (const staff of group.staff) {
      index.set(staff.id, {
        group,
        staff,
      })
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
    Object.entries(optionsByTeam || {}).map(([teamId, options]) => [
      String(teamId),
      normalizeShiftCodeOptions(options),
    ]),
  )
}

function findAssignment(staffIndex, cell) {
  if (!cell) {
    return null
  }

  const indexedAssignment = staffIndex.get(cell.staffId)
  if (indexedAssignment) {
    return {
      group: indexedAssignment.group,
      staff: indexedAssignment.staff,
      day: cell.day,
      currentCode: indexedAssignment.staff.schedule[cell.day - 1] || '',
    }
  }

  return null
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
    nextUpdates.set(updateKey, {
      staffId,
      day,
      shiftCode: normalizedCode,
    })
  }

  pendingUpdates.value = nextUpdates
  return true
}

export function useRosterPlanner() {
  const { year, month, monthLabel, goToPreviousMonth, goToNextMonth } = useWorkspacePeriod()
  const rosterGroups = ref([])
  const baseGroups = ref([])
  const rosterStaffIndex = computed(() => buildStaffIndex(rosterGroups.value))
  const baseStaffIndex = computed(() => buildStaffIndex(baseGroups.value))
  const timezone = shallowRef('UTC')
  const searchTerm = shallowRef('')
  const selectedCell = ref(null)
  const drawerOpen = shallowRef(false)
  const selectedShiftCode = shallowRef('')
  const shiftCodeOptions = shallowRef(['Clear'])
  const shiftCodeOptionsByTeam = shallowRef({})
  const shiftCodeColorMap = shallowRef({})
  const shiftDetailsByTeam = shallowRef({})
  const loading = shallowRef(false)
  const saving = shallowRef(false)
  const errorMessage = shallowRef('')
  const saveErrorMessage = shallowRef('')
  const saveSuccessMessage = shallowRef('')
  const serverValidationWarning = shallowRef('')
  const pendingUpdates = ref(new Map())
  const selectedTeamIds = ref([])
  const importExportLoading = shallowRef(false)
  const importExportError = shallowRef('')

  const plannerDays = computed(() => createPlannerDays(year.value, month.value))
  const hasUnsavedChanges = computed(() => pendingUpdates.value.size > 0)
  const pendingUpdateCount = computed(() => pendingUpdates.value.size)
  const pendingUpdateKeySet = computed(() => new Set(pendingUpdates.value.keys()))

  const allTeams = computed(() => {
    const teamMap = new Map()
    rosterGroups.value.forEach(group => {
      if (!teamMap.has(group.teamId)) {
        teamMap.set(group.teamId, { id: group.teamId, name: group.team, color: group.color })
      }
    })
    return Array.from(teamMap.values())
  })

  const filteredGroups = computed(() => {
    let result = rosterGroups.value
    
    if (selectedTeamIds.value.length > 0) {
      result = result.filter(group => selectedTeamIds.value.includes(group.teamId))
    }
    
    const query = searchTerm.value.trim().toLowerCase()
    if (!query) {
      return result
    }

    return result
      .map((group) => ({
        ...group,
        staff: group.staff.filter((person) => [person.name, person.role].join(' ').toLowerCase().includes(query)),
      }))
      .filter((group) => group.staff.length > 0)
  })

  const selectedAssignment = computed(() => findAssignment(rosterStaffIndex.value, selectedCell.value))

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

  const validationWarning = computed(() => {
    return serverValidationWarning.value
  })

  let validationRequestSequence = 0

  async function refreshValidationWarning() {
    const requestSequence = ++validationRequestSequence
    serverValidationWarning.value = ''

    try {
      const response = await api.workspace.getValidation(year.value, month.value, { summaryOnly: true })
      if (requestSequence !== validationRequestSequence) {
        return
      }

      serverValidationWarning.value = response?.topIssue?.description || ''
    } catch (error) {
      if (requestSequence !== validationRequestSequence) {
        return
      }

      serverValidationWarning.value = ''
    }
  }

  async function loadRoster() {
    loading.value = true
    errorMessage.value = ''

    try {
      const response = await api.workspace.getRoster(year.value, month.value)
      const normalizedGroups = normalizeGroups(response.groups, plannerDays.value.length)

      baseGroups.value = normalizedGroups
      rosterGroups.value = cloneGroups(normalizedGroups)
      shiftCodeOptions.value = normalizeShiftCodeOptions(response.shiftCodeOptions)
      shiftCodeOptionsByTeam.value = normalizeShiftCodeOptionsByTeam(response.shiftCodeOptionsByTeam)
      shiftCodeColorMap.value = response.shiftCodeColorMap || {}
      shiftDetailsByTeam.value = response.shiftDetailsByTeam || {}
      serverValidationWarning.value = ''
      pendingUpdates.value = new Map()
      saveErrorMessage.value = ''
      saveSuccessMessage.value = ''

      if (selectedCell.value && !findAssignment(rosterStaffIndex.value, selectedCell.value)) {
        selectedCell.value = null
        drawerOpen.value = false
      }

      void refreshValidationWarning()
    } catch (error) {
      rosterGroups.value = []
      baseGroups.value = []
      shiftCodeOptions.value = ['Clear']
      shiftCodeOptionsByTeam.value = {}
      shiftCodeColorMap.value = {}
      shiftDetailsByTeam.value = {}
      validationRequestSequence += 1
      serverValidationWarning.value = ''
      pendingUpdates.value = new Map()
      errorMessage.value = error.message || 'Failed to load monthly roster.'
      saveSuccessMessage.value = ''
    } finally {
      loading.value = false
    }
  }

  watch([year, month], () => {
    selectedCell.value = null
    drawerOpen.value = false
    void loadRoster()
  }, { immediate: true })

  function openCell(staffId, day) {
    selectedCell.value = { staffId, day }
    drawerOpen.value = true
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
    const { staff, day } = selectedAssignment.value
    applyScheduleUpdate({
      rosterStaffIndex,
      baseStaffIndex,
      pendingUpdates,
      staffId: staff.id,
      day,
      shiftCode: code,
    })
    saveSuccessMessage.value = ''
    drawerOpen.value = false
  }

  function copySelectedWeekToNextWeek() {
    if (!selectedAssignment.value) {
      return null
    }

    const totalDays = plannerDays.value.length
    const currentDate = new Date(year.value, month.value - 1, selectedAssignment.value.day)
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

    saveSuccessMessage.value = ''

    return {
      copiedCount,
      firstTargetDay,
      staffId: selectedAssignment.value.staff.id,
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

    saveSuccessMessage.value = ''

    return {
      updatedCount,
      endDay: normalizedEndDay,
      staffId: selectedAssignment.value.staff.id,
    }
  }

  function discardChanges() {
    rosterGroups.value = cloneGroups(baseGroups.value)
    pendingUpdates.value = new Map()
    saveErrorMessage.value = ''
    saveSuccessMessage.value = ''
    drawerOpen.value = false
    selectedCell.value = null
  }

  async function saveChanges() {
    if (!hasUnsavedChanges.value || saving.value) {
      return
    }

    saving.value = true
    saveErrorMessage.value = ''
    saveSuccessMessage.value = ''

    try {
      const response = await api.workspace.saveRoster({
        year: year.value,
        month: month.value,
        updates: Array.from(pendingUpdates.value.values()),
      })
      const normalizedGroups = normalizeGroups(response.groups, plannerDays.value.length)

      baseGroups.value = normalizedGroups
      rosterGroups.value = cloneGroups(normalizedGroups)
      shiftCodeOptions.value = normalizeShiftCodeOptions(response.shiftCodeOptions)
      shiftCodeOptionsByTeam.value = normalizeShiftCodeOptionsByTeam(response.shiftCodeOptionsByTeam)
      shiftCodeColorMap.value = response.shiftCodeColorMap || {}
      shiftDetailsByTeam.value = response.shiftDetailsByTeam || {}
      serverValidationWarning.value = ''
      pendingUpdates.value = new Map()
      saveSuccessMessage.value = 'Roster changes saved successfully.'
      void refreshValidationWarning()
    } catch (error) {
      saveErrorMessage.value = error.message || 'Failed to save monthly roster changes.'
    } finally {
      saving.value = false
    }
  }

  function toggleTeamFilter(teamId) {
    const index = selectedTeamIds.value.indexOf(teamId)
    if (index === -1) {
      selectedTeamIds.value = [...selectedTeamIds.value, teamId]
    } else {
      selectedTeamIds.value = selectedTeamIds.value.filter(id => id !== teamId)
    }
  }

  function clearTeamFilter() {
    selectedTeamIds.value = []
  }

  async function exportRoster() {
    if (importExportLoading.value) return
    
    importExportLoading.value = true
    importExportError.value = ''
    
    try {
      const blob = await api.workspace.exportRoster(year.value, month.value)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `roster-${year.value}-${String(month.value).padStart(2, '0')}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      importExportError.value = error.message || 'Failed to export roster.'
    } finally {
      importExportLoading.value = false
    }
  }

  return {
    plannerDays,
    monthLabel,
    year,
    month,
    rosterGroups,
    filteredGroups,
    timezone,
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
    shiftCodeOptions: availableShiftCodeOptions,
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
    goToPreviousMonth,
    goToNextMonth,
    reloadRoster: loadRoster,
  }
}
