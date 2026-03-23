const MINUTES_PER_DAY = 24 * 60

export function normalizeTimeValue(value) {
  if (!value) {
    return ''
  }

  const [hours = '00', minutes = '00'] = String(value).split(':')
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
}

export function toMinutes(value) {
  const normalized = normalizeTimeValue(value)
  if (!normalized) {
    return 0
  }

  const [hours = '00', minutes = '00'] = normalized.split(':')
  return Number(hours) * 60 + Number(minutes)
}

export function minutesToTime(value) {
  const safeValue = ((value % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY
  const hours = Math.floor(safeValue / 60)
  const minutes = safeValue % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function addMinutesToTime(value, minutes) {
  return minutesToTime(toMinutes(value) + minutes)
}

export function createTimeOptions(stepMinutes = 30) {
  return Array.from({ length: MINUTES_PER_DAY / stepMinutes }, (_, index) => {
    const value = minutesToTime(index * stepMinutes)
    return { value, label: value }
  })
}

export function normalizeDurationMinutes(value) {
  const minutes = Number(value)
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return 0
  }
  return Math.min(MINUTES_PER_DAY, Math.round(minutes))
}

export function calculateShiftDuration(startTime, endTime) {
  const startMinutes = toMinutes(startTime)
  let endMinutes = toMinutes(endTime)
  let overnight = false

  if (endMinutes <= startMinutes) {
    endMinutes += MINUTES_PER_DAY
    overnight = true
  }

  return {
    minutes: endMinutes - startMinutes,
    overnight,
  }
}

export function calculateShiftWindow(startTime, durationOrEndTime) {
  const normalizedStart = normalizeTimeValue(startTime)
  if (!normalizedStart) {
    return {
      startTime: '',
      endTime: '',
      durationMinutes: 0,
      overnight: false,
    }
  }

  const durationMinutes = typeof durationOrEndTime === 'number'
      || /^\d+$/.test(String(durationOrEndTime ?? ''))
    ? normalizeDurationMinutes(durationOrEndTime)
    : calculateShiftDuration(normalizedStart, durationOrEndTime).minutes

  if (!durationMinutes) {
    return {
      startTime: normalizedStart,
      endTime: '',
      durationMinutes: 0,
      overnight: false,
    }
  }

  return {
    startTime: normalizedStart,
    endTime: addMinutesToTime(normalizedStart, durationMinutes),
    durationMinutes,
    overnight: durationMinutes === MINUTES_PER_DAY || toMinutes(normalizedStart) + durationMinutes > MINUTES_PER_DAY,
  }
}

export function formatDurationLabel(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (!minutes) {
    return `${hours}h`
  }

  return `${hours}h ${minutes}m`
}

export function describeShiftWindow(startTime, durationOrEndTime) {
  const window = calculateShiftWindow(startTime, durationOrEndTime)
  if (!window.startTime || !window.endTime || !window.durationMinutes) {
    return ''
  }

  const suffix = window.overnight ? 'next day' : 'same day'
  return `${window.startTime} - ${window.endTime} · ${formatDurationLabel(window.durationMinutes)} · ${suffix}`
}

export function buildShiftTooltip(detail) {
  if (!detail?.code) {
    return ''
  }

  const lines = [detail.code]
  if (detail.meaning) {
    lines.push(detail.meaning)
  }

  const windowLabel = describeShiftWindow(detail.startTime, detail.durationMinutes ?? detail.endTime)
  if (windowLabel) {
    lines.push(windowLabel)
  }

  if (detail.timezone) {
    lines.push(detail.timezone)
  }

  return lines.join('\n')
}
