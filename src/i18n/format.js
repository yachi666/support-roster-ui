import { currentLocale } from './index'

function resolveLocale(locale) {
  return locale || currentLocale.value || 'en'
}

export function formatLocalizedDate(date, options, locale) {
  return new Intl.DateTimeFormat(resolveLocale(locale), options).format(date)
}

export function formatLocalizedParts(date, options, locale) {
  return new Intl.DateTimeFormat(resolveLocale(locale), options).formatToParts(date)
}

export function getLocalizedMonthOptions(locale) {
  return Array.from({ length: 12 }, (_, index) => ({
    value: index + 1,
    label: formatLocalizedDate(new Date(2024, index, 1), { month: 'short' }, locale),
  }))
}
