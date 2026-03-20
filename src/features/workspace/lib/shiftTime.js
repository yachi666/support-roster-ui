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

export function formatDurationLabel(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (!minutes) {
    return `${hours}h`
  }

  return `${hours}h ${minutes}m`
}

export function describeShiftWindow(startTime, endTime) {
  const normalizedStart = normalizeTimeValue(startTime)
  const normalizedEnd = normalizeTimeValue(endTime)

  if (!normalizedStart || !normalizedEnd) {
    return ''
  }

  const duration = calculateShiftDuration(normalizedStart, normalizedEnd)
  const suffix = duration.overnight ? 'next day' : 'same day'
  return `${normalizedStart} - ${normalizedEnd} · ${formatDurationLabel(duration.minutes)} · ${suffix}`
}

export function buildShiftTooltip(detail) {
  if (!detail?.code) {
    return ''
  }

  const lines = [detail.code]
  if (detail.meaning) {
    lines.push(detail.meaning)
  }

  const windowLabel = describeShiftWindow(detail.startTime, detail.endTime)
  if (windowLabel) {
    lines.push(windowLabel)
  }

  if (detail.timezone) {
    lines.push(detail.timezone)
  }

  return lines.join('\n')
}