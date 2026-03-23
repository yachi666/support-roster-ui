<script setup>
import { ref, computed, watch, onMounted, shallowRef } from 'vue'
import { format } from 'date-fns'
import { AlertCircle, CalendarDays, LoaderCircle, RefreshCw, Users } from 'lucide-vue-next'
import Header from './Header.vue'
import Timeline from './Timeline.vue'
import { api } from '@/api'
import { normalizeTimezoneSelection, toIanaTimezone } from '@/lib/timezones'

const selectedDate = ref(new Date())
const selectedTimezone = shallowRef(normalizeTimezoneSelection(Intl.DateTimeFormat().resolvedOptions().timeZone))

const teams = ref([])
const shifts = ref([])
const loadingTeams = ref(false)
const loadingShifts = ref(false)
const teamError = ref(null)
const shiftError = ref(null)

const formattedDate = computed(() => format(selectedDate.value, 'yyyy-MM-dd'))
const formattedViewerDate = computed(() => format(selectedDate.value, 'EEE, MMM d, yyyy'))
const normalizedTimezoneLabel = computed(() => normalizeTimezoneSelection(selectedTimezone.value))
const isLoading = computed(() => loadingTeams.value || loadingShifts.value)
const hasError = computed(() => Boolean(teamError.value || shiftError.value))
const hasTeams = computed(() => teams.value.length > 0)
const hasShifts = computed(() => shifts.value.length > 0)
const isEmptyState = computed(() => !isLoading.value && !hasError.value && hasTeams.value && !hasShifts.value)
const isNoTeamsState = computed(() => !isLoading.value && !hasError.value && !hasTeams.value)
const stateTone = computed(() => {
  if (hasError.value) {
    return 'border-rose-200 bg-rose-50 text-rose-800'
  }

  return 'border-slate-200 bg-white text-slate-800'
})
const stateTitle = computed(() => {
  if (loadingTeams.value && loadingShifts.value) {
    return 'Loading teams and shifts'
  }

  if (loadingShifts.value) {
    return `Loading shifts for ${formattedViewerDate.value}`
  }

  if (loadingTeams.value) {
    return 'Loading teams'
  }

  if (teamError.value) {
    return 'Failed to load teams'
  }

  if (shiftError.value) {
    return 'Failed to load shifts'
  }

  if (isNoTeamsState.value) {
    return 'No teams available'
  }

  if (isEmptyState.value) {
    return 'No shifts scheduled'
  }

  return ''
})
const stateDescription = computed(() => {
  if (loadingTeams.value && loadingShifts.value) {
    return `Preparing the on-call overview for ${formattedViewerDate.value} in ${normalizedTimezoneLabel.value}.`
  }

  if (loadingShifts.value) {
    return `Refreshing schedule coverage for ${formattedViewerDate.value} in ${normalizedTimezoneLabel.value}.`
  }

  if (loadingTeams.value) {
    return 'Fetching the team list used to organize the timeline.'
  }

  if (teamError.value) {
    return 'The viewer could not load team metadata. Retry to restore the full timeline.'
  }

  if (shiftError.value) {
    return `The viewer could not load shift coverage for ${formattedViewerDate.value}. Retry to try again.`
  }

  if (isNoTeamsState.value) {
    return 'The API returned no teams, so there is nothing to display in the public viewer yet.'
  }

  if (isEmptyState.value) {
    return `There are currently no shifts scheduled for ${formattedViewerDate.value} in ${normalizedTimezoneLabel.value}.`
  }

  return ''
})
const stateActionLabel = computed(() => {
  if (hasError.value) {
    return 'Retry'
  }

  if (isNoTeamsState.value || isEmptyState.value) {
    return 'Reload'
  }

  return ''
})

async function fetchTeams() {
  loadingTeams.value = true
  teamError.value = null
  try {
    const data = await api.getTeams()
    teams.value = data
  } catch (err) {
    console.error('Failed to fetch teams:', err)
    teamError.value = 'Failed to load teams'
  } finally {
    loadingTeams.value = false
  }
}

async function fetchShifts() {
  loadingShifts.value = true
  shiftError.value = null
  try {
    const data = await api.getShifts(formattedDate.value, null, toIanaTimezone(selectedTimezone.value))
    shifts.value = data
  } catch (err) {
    console.error('Failed to fetch shifts:', err)
    shiftError.value = 'Failed to load shifts'
  } finally {
    loadingShifts.value = false
  }
}

async function retryViewerState() {
  await Promise.all([fetchTeams(), fetchShifts()])
}

watch([selectedDate, selectedTimezone], () => {
  fetchShifts()
})

onMounted(async () => {
  await Promise.all([fetchTeams(), fetchShifts()])
})
</script>

<template>
  <div class="flex flex-col h-full bg-slate-50 text-slate-900 font-sans">
    <Header v-model:selected-date="selectedDate" v-model:selected-timezone="selectedTimezone" />
    <div class="flex-1 overflow-hidden relative">
      <div
        v-if="isLoading || hasError || isEmptyState || isNoTeamsState"
        class="flex h-full items-center justify-center p-6"
      >
        <div :class="['w-full max-w-xl rounded-2xl border p-6 shadow-sm', stateTone]">
          <div class="flex items-start gap-4">
            <div
              :class="[
                'mt-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full',
                hasError ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600',
              ]"
            >
              <LoaderCircle v-if="isLoading" class="h-5 w-5 animate-spin" />
              <AlertCircle v-else-if="hasError" class="h-5 w-5" />
              <Users v-else-if="isNoTeamsState" class="h-5 w-5" />
              <CalendarDays v-else class="h-5 w-5" />
            </div>

            <div class="min-w-0 flex-1">
              <div class="text-base font-semibold">{{ stateTitle }}</div>
              <div class="mt-1 text-sm leading-6 opacity-90">
                {{ stateDescription }}
              </div>

              <div v-if="isLoading" class="mt-4 space-y-2">
                <div class="h-2.5 w-3/4 animate-pulse rounded-full bg-slate-200"></div>
                <div class="h-2.5 w-1/2 animate-pulse rounded-full bg-slate-200"></div>
                <div class="h-2.5 w-2/3 animate-pulse rounded-full bg-slate-200"></div>
              </div>

              <div v-else class="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100"
                  @click="retryViewerState"
                >
                  <RefreshCw class="h-4 w-4" />
                  {{ stateActionLabel }}
                </button>
                <span class="text-xs text-slate-500">
                  {{ formattedViewerDate }} · {{ normalizedTimezoneLabel }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Timeline
        v-else
        :selected-date="selectedDate"
        :selected-timezone="selectedTimezone"
        :teams="teams"
        :shifts="shifts"
      />
    </div>
  </div>
</template>
