<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { format } from 'date-fns'
import Header from './Header.vue'
import Timeline from './Timeline.vue'
import { api } from '@/api'

const selectedDate = ref(new Date())
const selectedTimezone = ref(Intl.DateTimeFormat().resolvedOptions().timeZone)

const teams = ref([])
const shifts = ref([])
const loading = ref(false)
const error = ref(null)

const formattedDate = computed(() => format(selectedDate.value, 'yyyy-MM-dd'))

async function fetchTeams() {
  try {
    const data = await api.getTeams()
    teams.value = data
  } catch (err) {
    console.error('Failed to fetch teams:', err)
    error.value = 'Failed to load teams'
  }
}

async function fetchShifts() {
  loading.value = true
  error.value = null
  try {
    const data = await api.getShifts(formattedDate.value, null, selectedTimezone.value)
    shifts.value = data
  } catch (err) {
    console.error('Failed to fetch shifts:', err)
    error.value = 'Failed to load shifts'
  } finally {
    loading.value = false
  }
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
      <div v-if="loading" class="flex items-center justify-center h-full">
        <div class="text-gray-500">Loading...</div>
      </div>
      <div v-else-if="error" class="flex items-center justify-center h-full">
        <div class="text-red-500">{{ error }}</div>
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
