<script setup>
import { ref, computed } from 'vue'
import Header from './Header.vue'
import Timeline from './Timeline.vue'
import { TEAMS, generateShifts } from '@/data/mockData'

const selectedDate = ref(new Date())
const selectedTimezone = ref(Intl.DateTimeFormat().resolvedOptions().timeZone)

const shifts = computed(() => generateShifts(selectedDate.value))
</script>

<template>
  <div class="flex flex-col h-full bg-slate-50 text-slate-900 font-sans">
    <Header v-model:selected-date="selectedDate" v-model:selected-timezone="selectedTimezone" />
    <div class="flex-1 overflow-hidden relative">
      <Timeline
        :selected-date="selectedDate"
        :selected-timezone="selectedTimezone"
        :teams="TEAMS"
        :shifts="shifts"
      />
    </div>
  </div>
</template>
