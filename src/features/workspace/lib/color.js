const LEGACY_COLOR_TOKEN_MAP = {
  blue: '#3b82f6',
  green: '#10b981',
  orange: '#f97316',
  purple: '#8b5cf6',
  red: '#ef4444',
}

export const WORKSPACE_COLOR_SWATCHES = [
  '#14b8a6',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#ef4444',
  '#64748b',
  '#0f172a',
]

export const WORKSPACE_COLOR_SWATCH_GROUPS = [
  {
    id: 'cool',
    colors: ['#14b8a6', '#3b82f6', '#8b5cf6'],
  },
  {
    id: 'warm',
    colors: ['#ec4899', '#f97316', '#eab308', '#ef4444'],
  },
  {
    id: 'grounded',
    colors: ['#22c55e', '#64748b', '#0f172a'],
  },
]

export function isHexColor(value) {
  if (typeof value !== 'string') {
    return false
  }

  return /^#?([0-9a-fA-F]{6})$/.test(value.trim())
}

export function normalizeHexColor(value) {
  if (!isHexColor(value)) {
    return ''
  }

  const trimmed = value.trim()
  return `#${trimmed.replace(/^#/, '').toLowerCase()}`
}

export function resolveWorkspaceColor(value, fallback = '#94a3b8') {
  const normalized = normalizeHexColor(value)
  if (normalized) {
    return normalized
  }

  const legacyColor =
    LEGACY_COLOR_TOKEN_MAP[
      String(value || '')
        .trim()
        .toLowerCase()
    ]
  if (legacyColor) {
    return legacyColor
  }

  return fallback
}

export function hexToRgb(hex) {
  const normalized = normalizeHexColor(hex)
  if (!normalized) {
    return null
  }

  const matched = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized)
  if (!matched) {
    return null
  }

  return {
    r: Number.parseInt(matched[1], 16),
    g: Number.parseInt(matched[2], 16),
    b: Number.parseInt(matched[3], 16),
  }
}

export function hexToRgba(hex, alpha = 1) {
  const rgb = hexToRgb(hex)
  if (!rgb) {
    return null
  }

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

function toRelativeLuminanceChannel(channel) {
  const normalized = channel / 255
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
}

export function getContrastRatio(colorA, colorB) {
  const rgbA = hexToRgb(colorA)
  const rgbB = hexToRgb(colorB)

  if (!rgbA || !rgbB) {
    return null
  }

  const luminanceA =
    0.2126 * toRelativeLuminanceChannel(rgbA.r) +
    0.7152 * toRelativeLuminanceChannel(rgbA.g) +
    0.0722 * toRelativeLuminanceChannel(rgbA.b)
  const luminanceB =
    0.2126 * toRelativeLuminanceChannel(rgbB.r) +
    0.7152 * toRelativeLuminanceChannel(rgbB.g) +
    0.0722 * toRelativeLuminanceChannel(rgbB.b)

  const lighter = Math.max(luminanceA, luminanceB)
  const darker = Math.min(luminanceA, luminanceB)

  return (lighter + 0.05) / (darker + 0.05)
}

export function getReadableTextColor(
  backgroundColor,
  darkColor = '#0f172a',
  lightColor = '#ffffff',
) {
  const lightContrast = getContrastRatio(backgroundColor, lightColor)
  const darkContrast = getContrastRatio(backgroundColor, darkColor)

  if (lightContrast == null || darkContrast == null) {
    return darkColor
  }

  return lightContrast >= darkContrast ? lightColor : darkColor
}

export function hasLowContrastOnWhite(color, minimumRatio = 3) {
  const contrast = getContrastRatio(color, '#ffffff')
  if (contrast == null) {
    return false
  }

  return contrast < minimumRatio
}
