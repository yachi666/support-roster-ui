<script setup>
import { RouterLink } from 'vue-router'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { format } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { ArrowRight, Calendar, Clock, Globe } from 'lucide-vue-next'
import { TIMEZONE_OPTIONS, normalizeTimezoneSelection, toIanaTimezone } from '@/lib/timezones'

const props = defineProps({
  selectedDate: { type: Date, required: true },
  selectedTimezone: { type: String, required: true }
})

const emit = defineEmits(['update:selectedDate', 'update:selectedTimezone'])

const currentTime = ref(new Date())
let timer = null

onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const dateValue = computed(() => format(props.selectedDate, 'yyyy-MM-dd'))

const handleDateInput = (e) => {
  const date = new Date(e.target.value)
  if (!isNaN(date.getTime())) {
    emit('update:selectedDate', date)
  }
}

const setToday = () => emit('update:selectedDate', new Date())

const onTimezoneChange = (e) => emit('update:selectedTimezone', e.target.value)

const resolvedTimezone = computed(() => toIanaTimezone(props.selectedTimezone))

const formattedTime = computed(() => {
  return formatInTimeZone(currentTime.value, resolvedTimezone.value, 'HH:mm:ss')
})

const timezoneLabel = computed(() => {
  return normalizeTimezoneSelection(props.selectedTimezone)
})

const formattedDate = computed(() => {
  return format(props.selectedDate, 'EEE, MMM d, yyyy')
})
</script>

<template>
  <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm z-20 sticky top-0">
    <div class="flex flex-col">
      <h1 class="text-xl font-semibold text-gray-900 tracking-tight">On-call Overview</h1>
      <div class="flex items-center text-sm text-gray-500 mt-1 font-mono">
        <Clock class="w-3 h-3 mr-1.5" />
        <span>{{ formattedTime }} {{ timezoneLabel }}</span>
        <span class="mx-2 text-gray-300">|</span>
        <span>{{ formattedDate }}</span>
      </div>
    </div>

    <div class="flex items-center space-x-4">
      <div class="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
        <button 
          @click="setToday"
          class="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition-colors"
        >
          Today
        </button>
        <div class="h-4 w-px bg-gray-300 mx-1"></div>
        <div class="relative flex items-center px-2">
          <Calendar class="w-4 h-4 text-gray-400 absolute left-2 pointer-events-none" />
          <input 
            type="date" 
            :value="dateValue"
            @input="handleDateInput"
            class="pl-8 pr-2 py-1 bg-transparent text-sm text-gray-700 focus:outline-none font-medium cursor-pointer"
          />
        </div>
      </div>

      <div class="relative group">
        <div class="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 hover:border-gray-300 transition-colors shadow-sm">
          <Globe class="w-4 h-4 text-gray-500" />
          <select 
            :value="selectedTimezone"
            @change="onTimezoneChange"
            class="appearance-none bg-transparent text-sm font-medium text-gray-700 focus:outline-none pr-6 cursor-pointer"
          >
            <option v-for="tz in TIMEZONE_OPTIONS" :key="tz.value" :value="tz.value">
              {{ tz.label }}
            </option>
          </select>
          <div class="absolute right-3 pointer-events-none">
            <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>

      <RouterLink
        to="/workspace"
        class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
      >
        <span>Enter Workspace</span>
        <ArrowRight class="h-4 w-4" />
      </RouterLink>
    </div>
  </header>
</template>
