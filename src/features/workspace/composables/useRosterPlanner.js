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
      role: person.roleName || 'Unassigned',
      schedule: buildScheduleArray(person.schedule, totalDays),
    })),
  }))
}

function findCellCode(groups, staffId, day) {
  for (const group of groups) {
    const staff = group.staff.find((entry) => entry.id === staffId)

    if (staff) {
      return staff.schedule[day - 1] || ''
    }
  }

  return ''
}

function normalizeShiftCodeOptions(options) {
  const optionSet = new Set(options || [])
  optionSet.add('Clear')
  return Array.from(optionSet)
}

function findAssignment(groups, cell) {
  if (!cell) {
    return null
  }

  for (const group of groups) {
    const staff = group.staff.find((entry) => entry.id === cell.staffId)
    if (staff) {
      return {
        group,
        staff,
        day: cell.day,
        currentCode: staff.schedule[cell.day - 1] || '',
      }
    }
  }

  return null
}

export function useRosterPlanner() {
  const { year, month, monthLabel, goToPreviousMonth, goToNextMonth } = useWorkspacePeriod()
  const rosterGroups = ref([])
  const baseGroups = ref([])
  const timezone = shallowRef('UTC')
  const searchTerm = shallowRef('')
  const selectedCell = ref(null)
  const drawerOpen = shallowRef(false)
  const selectedShiftCode = shallowRef('')
  const shiftCodeOptions = shallowRef(['Clear'])
  const shiftCodeColorMap = shallowRef({})
  const loading = shallowRef(false)
  const saving = shallowRef(false)
  const errorMessage = shallowRef('')
  const saveErrorMessage = shallowRef('')
  const serverValidationWarning = shallowRef('')
  const pendingUpdates = ref(new Map())
  const selectedTeamIds = ref([])
  const importExportLoading = shallowRef(false)
  const importExportError = shallowRef('')

  const plannerDays = computed(() => createPlannerDays(year.value, month.value))
  const hasUnsavedChanges = computed(() => pendingUpdates.value.size > 0)

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

  const selectedAssignment = computed(() => findAssignment(rosterGroups.value, selectedCell.value))

  watch([selectedAssignment, shiftCodeOptions], ([assignment, options]) => {
    selectedShiftCode.value = assignment?.currentCode || options[0] || ''
  }, { immediate: true })

  const validationWarning = computed(() => {
    if (!selectedAssignment.value) {
      return ''
    }

    return serverValidationWarning.value
  })

  async function loadRoster() {
    loading.value = true
    errorMessage.value = ''

    try {
      const response = await api.workspace.getRoster(year.value, month.value)
      const normalizedGroups = normalizeGroups(response.groups, plannerDays.value.length)

      baseGroups.value = normalizedGroups
      rosterGroups.value = cloneGroups(normalizedGroups)
      shiftCodeOptions.value = normalizeShiftCodeOptions(response.shiftCodeOptions)
      shiftCodeColorMap.value = response.shiftCodeColorMap || {}
      serverValidationWarning.value = response.validationWarning || ''
      pendingUpdates.value = new Map()
      saveErrorMessage.value = ''

      if (selectedCell.value && !findAssignment(rosterGroups.value, selectedCell.value)) {
        selectedCell.value = null
        drawerOpen.value = false
      }
    } catch (error) {
      rosterGroups.value = []
      baseGroups.value = []
      shiftCodeOptions.value = ['Clear']
      shiftCodeColorMap.value = {}
      serverValidationWarning.value = ''
      pendingUpdates.value = new Map()
      errorMessage.value = error.message || 'Failed to load monthly roster.'
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
    const updateKey = `${staff.id}:${day}`
    const nextUpdates = new Map(pendingUpdates.value)
    const originalCode = findCellCode(baseGroups.value, staff.id, day)

    staff.schedule[day - 1] = code

    if (code === originalCode) {
      nextUpdates.delete(updateKey)
    } else {
      nextUpdates.set(updateKey, {
        staffId: staff.id,
        day,
        shiftCode: code,
      })
    }

    pendingUpdates.value = nextUpdates
    drawerOpen.value = false
  }

  function discardChanges() {
    rosterGroups.value = cloneGroups(baseGroups.value)
    pendingUpdates.value = new Map()
    saveErrorMessage.value = ''
    drawerOpen.value = false
    selectedCell.value = null
  }

  async function saveChanges() {
    if (!hasUnsavedChanges.value || saving.value) {
      return
    }

    saving.value = true
    saveErrorMessage.value = ''

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
      shiftCodeColorMap.value = response.shiftCodeColorMap || {}
      serverValidationWarning.value = response.validationWarning || ''
      pendingUpdates.value = new Map()
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
    selectedCell,
    drawerOpen,
    hasUnsavedChanges,
    selectedAssignment,
    selectedShiftCode,
    validationWarning,
    shiftCodeOptions,
    shiftCodeColorMap,
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
    goToPreviousMonth,
    goToNextMonth,
    reloadRoster: loadRoster,
  }
}
