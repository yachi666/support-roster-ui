import { createI18n } from 'vue-i18n'
import en from './locales/en'
import zhCN from './locales/zh-CN'

const LOCALE_STORAGE_KEY = 'support-roster-ui-locale'
export const DEFAULT_LOCALE = 'zh-CN'
export const SUPPORTED_LOCALES = ['zh-CN', 'en']

function normalizeLocale(locale) {
  return SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE
}

function readInitialLocale() {
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  if (stored) {
    return normalizeLocale(stored)
  }

  const browserLocale = window.navigator.language || DEFAULT_LOCALE
  if (browserLocale.toLowerCase().startsWith('zh')) {
    return 'zh-CN'
  }

  return 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: readInitialLocale(),
  fallbackLocale: 'en',
  messages: {
    en,
    'zh-CN': zhCN,
  },
})

export const currentLocale = i18n.global.locale

export function setLocale(locale) {
  const normalizedLocale = normalizeLocale(locale)
  currentLocale.value = normalizedLocale
  window.localStorage.setItem(LOCALE_STORAGE_KEY, normalizedLocale)
  document.documentElement.lang = normalizedLocale
}

document.documentElement.lang = currentLocale.value
