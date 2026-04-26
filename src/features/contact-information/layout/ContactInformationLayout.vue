<script setup>
import { computed, provide, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { Building2, ExternalLink, KeyRound, LayoutDashboard, Plus, Search } from 'lucide-vue-next'
import { CONTACT_INFORMATION_LAYOUT_KEY } from '../lib/layoutContext'

const route = useRoute()
const router = useRouter()
const normalizedKeyword = computed(() => String(route.query.keyword || '').trim())
const searchTerm = ref(normalizedKeyword.value)
const showAddAction = computed(() => route.name !== 'contact-information-add')
const topActionLinkBaseClass = 'inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition-colors'
const topActionSecondaryClass = 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
const topActionPrimaryClass = 'border border-teal-200 bg-teal-50 text-teal-700 hover:border-teal-300 hover:bg-teal-100'

watch(normalizedKeyword, (next) => {
  if (next !== searchTerm.value) {
    searchTerm.value = next
  }
})

watch(searchTerm, (next, previous) => {
  if (next === previous) {
    return
  }

  const normalizedNext = String(next || '').trim()
  if (normalizedNext === normalizedKeyword.value) {
    return
  }

  router.replace({
    path: route.path,
    query: {
      ...route.query,
      keyword: normalizedNext || undefined,
      page: undefined,
    },
  })
})

provide(CONTACT_INFORMATION_LAYOUT_KEY, { searchTerm })
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div class="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div class="flex min-w-0 flex-1 items-center gap-4 sm:gap-6">
          <RouterLink
            to="/contact-information"
            class="flex shrink-0 items-center gap-2 text-slate-900 transition-colors hover:text-blue-600"
          >
            <span class="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 shadow-sm">
              <Building2 class="h-5 w-5 text-white" />
            </span>
            <span class="text-lg font-semibold tracking-tight">TeamDirectory</span>
          </RouterLink>

          <label
            class="relative hidden w-full max-w-md items-center rounded-md border border-transparent bg-slate-100 transition-all focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100 md:flex"
          >
            <Search class="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
            <input
              v-model="searchTerm"
              type="text"
              aria-label="Search teams, staff IDs, or links"
              placeholder="Search team or ID..."
              class="w-full rounded-md bg-transparent py-2 pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            >
          </label>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <RouterLink
            to="/linux-passwords"
            :class="[topActionLinkBaseClass, topActionSecondaryClass]"
          >
            <KeyRound class="h-4 w-4 text-slate-500" />
            Linux Passwords
          </RouterLink>

          <RouterLink
            to="/viewer"
            :class="[topActionLinkBaseClass, topActionSecondaryClass]"
          >
            <ExternalLink class="h-4 w-4 text-slate-500" />
            Public Viewer
          </RouterLink>

          <RouterLink
            to="/workspace"
            :class="[topActionLinkBaseClass, topActionPrimaryClass]"
          >
            <LayoutDashboard class="h-4 w-4 text-teal-600" />
            Workspace
          </RouterLink>

          <RouterLink
            v-if="showAddAction"
            to="/contact-information/add"
            class="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
          >
            <Plus class="h-4 w-4" />
            Add Team
          </RouterLink>
        </div>
      </div>
    </header>

    <main class="mx-auto flex min-h-[calc(100vh-65px)] w-full max-w-[1600px] flex-col">
      <RouterView />
    </main>
  </div>
</template>
