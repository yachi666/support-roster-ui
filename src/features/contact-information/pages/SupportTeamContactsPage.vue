<script setup>
import { computed, inject, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ArrowRight, CheckCircle2, CircleAlert } from 'lucide-vue-next'
import ContactInformationTable from '../components/ContactInformationTable.vue'
import { contactInformationMockTeams } from '../data/contactInformationMock'
import { CONTACT_INFORMATION_LAYOUT_KEY } from '../lib/layoutContext'

const route = useRoute()
const router = useRouter()
const layoutState = inject(CONTACT_INFORMATION_LAYOUT_KEY, { searchTerm: ref('') })
const notice = ref({ tone: '', message: '' })
let noticeTimer = null

const filteredTeams = computed(() => {
  const normalizedQuery = layoutState.searchTerm.value.trim().toLowerCase()
  if (!normalizedQuery) {
    return contactInformationMockTeams
  }

  return contactInformationMockTeams.filter((team) => {
    const haystack = [
      team.name,
      team.email,
      team.xMatter,
      team.gsd,
      team.eim,
      ...team.roles,
      ...team.staff.flatMap((member) => [member.id, member.name, member.email]),
      ...team.links.flatMap((link) => [link.label, link.url]),
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalizedQuery)
  })
})

watch(
  () => route.query.created,
  (created) => {
    if (created === '1') {
      setNotice(
        'success',
        'Mock team saved. The list still uses local demo data, so the new record is not persisted.',
      )
      router.replace({ path: route.path, query: { ...route.query, created: undefined } })
    }
  },
  { immediate: true },
)

function setNotice(tone, message) {
  if (noticeTimer) {
    clearTimeout(noticeTimer)
  }

  notice.value = { tone, message }

  noticeTimer = setTimeout(() => {
    clearNotice()
  }, 3000)
}

async function handleCopy({ text, label }) {
  try {
    await navigator.clipboard.writeText(text)
    setNotice('success', `${label} copied to clipboard.`)
  } catch {
    setNotice('error', `Could not copy ${label}. Please copy it manually.`)
  }
}

function clearNotice() {
  if (noticeTimer) {
    clearTimeout(noticeTimer)
    noticeTimer = null
  }

  notice.value = { tone: '', message: '' }
}

onUnmounted(() => {
  if (noticeTimer) {
    clearTimeout(noticeTimer)
  }
})
</script>

<template>
  <section class="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
    <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 class="text-xl font-semibold text-slate-900">System Teams</h1>
        <p class="mt-1 text-sm text-slate-500">
          Manage upstream and downstream support-team contact directories.
        </p>
      </div>
      <RouterLink
        to="/contact-information/add"
        class="inline-flex items-center gap-2 self-start rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:text-blue-700"
      >
        Add from full form
        <ArrowRight class="h-4 w-4" />
      </RouterLink>
    </div>

    <div
      v-if="notice.message"
      :class="[
        'flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm',
        notice.tone === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-amber-200 bg-amber-50 text-amber-800',
      ]"
    >
      <div class="flex items-start gap-2">
        <CheckCircle2 v-if="notice.tone === 'success'" class="mt-0.5 h-4 w-4 shrink-0" />
        <CircleAlert v-else class="mt-0.5 h-4 w-4 shrink-0" />
        <span>{{ notice.message }}</span>
      </div>
      <button type="button" class="text-current/70 transition hover:text-current" @click="clearNotice">
        Dismiss
      </button>
    </div>

    <ContactInformationTable
      :teams="filteredTeams"
      :total-count="contactInformationMockTeams.length"
      @copy="handleCopy"
    />
  </section>
</template>
