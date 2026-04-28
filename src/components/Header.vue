<script setup>
import { RouterLink } from 'vue-router'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { format } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import {
  Calendar,
  Clock,
  ContactRound,
  Globe,
  KeyRound,
  LayoutDashboard,
  Newspaper,
  PanelRightOpen,
} from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { TIMEZONE_OPTIONS, normalizeTimezoneSelection, toIanaTimezone } from '@/lib/timezones'
import ExternalSystemsDrawer from '@/components/ExternalSystemsDrawer.vue'
import { EXTERNAL_SYSTEM_LINKS } from '@/lib/externalSystems'

const props = defineProps({
  selectedDate: { type: Date, required: true },
  selectedTimezone: { type: String, required: true },
})

const emit = defineEmits(['update:selectedDate', 'update:selectedTimezone'])
const { t } = useI18n()

const currentTime = ref(new Date())
const isExternalSystemsDrawerOpen = ref(false)
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

const openExternalSystemsDrawer = () => {
  isExternalSystemsDrawerOpen.value = true
}

const closeExternalSystemsDrawer = () => {
  isExternalSystemsDrawerOpen.value = false
}

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
  <div>
    <header
      class="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm z-20 sticky top-0"
    >
      <div class="flex flex-col">
        <h1 class="text-lg font-semibold text-gray-900 tracking-tight">
          Messaging Support Rota & Escalation Matrix
        </h1>
        <div class="flex items-center text-sm text-gray-500 mt-1 font-mono">
          <Clock class="w-3 h-3 mr-1.5" />
          <span>{{ formattedTime }} {{ timezoneLabel }}</span>
          <span class="mx-2 text-gray-300">|</span>
          <span>{{ formattedDate }}</span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="flex h-10 items-center rounded-md border border-slate-200 bg-slate-50/70 p-0.5">
          <button
            @click="setToday"
            class="h-8 rounded px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            Today
          </button>
          <div class="mx-1 h-5 w-px bg-slate-200"></div>
          <div class="relative flex h-8 items-center px-2">
            <Calendar class="absolute left-2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="date"
              :value="dateValue"
              @input="handleDateInput"
              class="h-8 cursor-pointer bg-transparent pl-7 pr-1 text-sm font-medium text-slate-700 focus:outline-none"
            />
          </div>
        </div>

        <div class="relative group">
          <div
            class="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <Globe class="h-4 w-4 text-slate-500" />
            <select
              :value="selectedTimezone"
              @change="onTimezoneChange"
              class="h-8 cursor-pointer appearance-none bg-transparent pr-6 text-sm font-semibold text-slate-700 focus:outline-none"
            >
              <option v-for="tz in TIMEZONE_OPTIONS" :key="tz.value" :value="tz.value">
                {{ tz.label }}
              </option>
            </select>
            <div class="absolute right-3 pointer-events-none">
              <svg
                class="h-3 w-3 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="ml-1 flex items-center gap-2">
          <RouterLink
            to="/contact-information"
            class="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
          >
            <ContactRound class="h-4 w-4 text-slate-500" />
            <span>{{ t('common.contactInformation') }}</span>
          </RouterLink>

          <RouterLink
            to="/linux-passwords"
            class="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
          >
            <KeyRound class="h-4 w-4 text-slate-500" />
            <span>{{ t('linuxPasswords.entryLabel') }}</span>
          </RouterLink>

          <RouterLink
            to="/workspace"
            class="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:ring-offset-2"
          >
            <LayoutDashboard class="h-4 w-4 text-teal-600" />
            <span>Workspace</span>
          </RouterLink>

          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:ring-offset-2"
            aria-label="External systems"
            title="External systems"
            @click="openExternalSystemsDrawer"
          >
            <PanelRightOpen class="h-4 w-4" aria-hidden="true" />
          </button>

          <RouterLink
            to="/product-updates"
            :aria-label="t('common.productUpdates')"
            :title="t('common.productUpdates')"
            class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2"
          >
            <Newspaper class="h-4 w-4" aria-hidden="true" />
          </RouterLink>
        </div>
      </div>
    </header>

    <ExternalSystemsDrawer
      :open="isExternalSystemsDrawerOpen"
      :systems="EXTERNAL_SYSTEM_LINKS"
      @close="closeExternalSystemsDrawer"
    />
  </div>
</template>
