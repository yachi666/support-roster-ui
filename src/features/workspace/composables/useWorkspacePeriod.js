import { computed, effectScope, readonly, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  formatWorkspaceMonthLabel,
  shiftWorkspacePeriod,
} from '../lib/period'
import { normalizeWorkspaceTimezone } from '../config/timezones'
import { currentLocale } from '@/i18n'

const initialDate = new Date()
const workspacePeriod = shallowRef({
  year: initialDate.getFullYear(),
  month: initialDate.getMonth() + 1,
})
const workspaceTimezone = shallowRef('UTC')
const workspacePeriodGuards = new Set()

let routeSyncScope = null
let syncState = {
  syncingFromRoute: false,
  syncingToRoute: false,
}

function normalizePeriodValue(value, fallback) {
  const parsed = Number(value)

  return Number.isInteger(parsed) ? parsed : fallback
}

function readPeriodFromQuery(route) {
  const nextYear = normalizePeriodValue(route.query.wy, workspacePeriod.value.year)
  const nextMonth = normalizePeriodValue(route.query.wm, workspacePeriod.value.month)
  const nextTimezone = route.query.wtz ? normalizeWorkspaceTimezone(route.query.wtz) : workspaceTimezone.value

  if (nextMonth < 1 || nextMonth > 12) {
    return null
  }

  return {
    year: nextYear,
    month: nextMonth,
    timezone: nextTimezone,
  }
}

function ensureRouteSync(route, router) {
  if (routeSyncScope) {
    return
  }

  routeSyncScope = effectScope(true)
  routeSyncScope.run(() => {
    const initialQueryState = readPeriodFromQuery(route)
    if (initialQueryState) {
      workspacePeriod.value = {
        year: initialQueryState.year,
        month: initialQueryState.month,
      }
      workspaceTimezone.value = initialQueryState.timezone
    }

    watch(
      () => [route.query.wy, route.query.wm, route.query.wtz],
      () => {
        if (syncState.syncingToRoute) {
          return
        }

        const nextQueryState = readPeriodFromQuery(route)
        if (!nextQueryState) {
          return
        }

        syncState.syncingFromRoute = true
        workspacePeriod.value = {
          year: nextQueryState.year,
          month: nextQueryState.month,
        }
        workspaceTimezone.value = nextQueryState.timezone
        syncState.syncingFromRoute = false
      },
      { immediate: true },
    )

    watch(
      [() => workspacePeriod.value.year, () => workspacePeriod.value.month, () => workspaceTimezone.value],
      ([year, month, timezone]) => {
        if (syncState.syncingFromRoute) {
          return
        }

        const nextQuery = {
          ...route.query,
          wy: String(year),
          wm: String(month),
          wtz: timezone,
        }

        const queryUnchanged =
          route.query.wy === nextQuery.wy &&
          route.query.wm === nextQuery.wm &&
          route.query.wtz === nextQuery.wtz

        if (queryUnchanged) {
          return
        }

        syncState.syncingToRoute = true
        router.replace({ query: nextQuery }).finally(() => {
          syncState.syncingToRoute = false
        })
      },
      { immediate: true },
    )
  })
}

async function canChangeWorkspacePeriod() {
  for (const guard of workspacePeriodGuards) {
    const allowed = await guard()
    if (allowed === false) {
      return false
    }
  }

  return true
}

async function setWorkspacePeriod(nextYear, nextMonth) {
  const normalizedYear = normalizePeriodValue(nextYear, workspacePeriod.value.year)
  const normalizedMonth = normalizePeriodValue(nextMonth, workspacePeriod.value.month)

  if (normalizedMonth < 1 || normalizedMonth > 12) {
    return false
  }

  const unchanged =
    normalizedYear === workspacePeriod.value.year &&
    normalizedMonth === workspacePeriod.value.month

  if (unchanged) {
    return true
  }

  const allowed = await canChangeWorkspacePeriod()
  if (!allowed) {
    return false
  }

  workspacePeriod.value = {
    year: normalizedYear,
    month: normalizedMonth,
  }

  return true
}

function setWorkspaceYear(nextYear) {
  return setWorkspacePeriod(nextYear, workspacePeriod.value.month)
}

function setWorkspaceMonth(nextMonth) {
  return setWorkspacePeriod(workspacePeriod.value.year, nextMonth)
}

function setWorkspaceTimezone(nextTimezone) {
  workspaceTimezone.value = normalizeWorkspaceTimezone(nextTimezone)
}

function goToPreviousMonth() {
  const nextPeriod = shiftWorkspacePeriod(workspacePeriod.value, -1)
  return setWorkspacePeriod(nextPeriod.year, nextPeriod.month)
}

function goToNextMonth() {
  const nextPeriod = shiftWorkspacePeriod(workspacePeriod.value, 1)
  return setWorkspacePeriod(nextPeriod.year, nextPeriod.month)
}

const year = computed(() => workspacePeriod.value.year)
const month = computed(() => workspacePeriod.value.month)
const monthLabel = computed(() => {
  currentLocale.value
  return formatWorkspaceMonthLabel(year.value, month.value)
})

export function useWorkspacePeriod() {
  const route = useRoute()
  const router = useRouter()
  ensureRouteSync(route, router)

  return {
    timezone: readonly(workspaceTimezone),
    year,
    month,
    monthLabel,
    setWorkspaceTimezone,
    setWorkspacePeriod,
    setWorkspaceYear,
    setWorkspaceMonth,
    goToPreviousMonth,
    goToNextMonth,
  }
}

export function registerWorkspacePeriodGuard(guard) {
  workspacePeriodGuards.add(guard)

  return () => {
    workspacePeriodGuards.delete(guard)
  }
}
