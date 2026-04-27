import { computed, proxyRefs, reactive, ref, shallowRef } from 'vue'

const DEFAULT_FILTERS = Object.freeze({
  keyword: '',
  staffId: '',
  staffName: '',
  hostname: '',
  ip: '',
  username: '',
  action: '',
  result: '',
  from: '',
  to: '',
})

function cleanParams(filters, page, pageSize) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    const normalizedValue = String(value || '').trim()
    if (normalizedValue) {
      params.set(key, normalizedValue)
    }
  }
  params.set('page', String(page))
  params.set('pageSize', String(pageSize))
  return Object.fromEntries(params.entries())
}

export function createLinuxPasswordAuditsModel({ api, t }) {
  const filters = reactive({ ...DEFAULT_FILTERS })
  const items = ref([])
  const page = shallowRef(1)
  const pageSize = shallowRef(20)
  const total = shallowRef(0)
  const isLoading = shallowRef(false)
  const statusMessage = shallowRef('')

  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
  const hasActiveFilters = computed(() =>
    Object.values(filters).some((value) => String(value || '').trim()),
  )
  const resultSummary = computed(() => t('linuxPasswords.audit.showing', {
    count: items.value.length,
    total: total.value,
  }))

  async function loadAudits() {
    isLoading.value = true
    statusMessage.value = ''
    try {
      const response = await api.workspace.getLinuxPasswordAccessAudits(cleanParams(filters, page.value, pageSize.value))
      items.value = Array.isArray(response?.items) ? response.items : []
      total.value = Number(response?.total || 0)
      page.value = Number(response?.page || page.value)
      pageSize.value = Number(response?.pageSize || pageSize.value)
    } catch (error) {
      statusMessage.value = error?.message || t('linuxPasswords.audit.loadFailed')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function searchAudits() {
    page.value = 1
    await loadAudits()
  }

  async function resetFilters() {
    Object.assign(filters, DEFAULT_FILTERS)
    page.value = 1
    await loadAudits()
  }

  async function goToPage(nextPage) {
    const normalizedPage = Math.min(Math.max(Number(nextPage) || 1, 1), totalPages.value)
    if (normalizedPage === page.value) {
      return
    }
    page.value = normalizedPage
    await loadAudits()
  }

  return proxyRefs({
    filters,
    goToPage,
    hasActiveFilters,
    isLoading,
    items,
    loadAudits,
    page,
    pageSize,
    resetFilters,
    resultSummary,
    searchAudits,
    statusMessage,
    total,
    totalPages,
  })
}
