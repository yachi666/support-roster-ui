<script setup>
import { computed, reactive, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LockKeyhole, ShieldCheck } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const mode = shallowRef('login')
const pending = shallowRef(false)
const errorMessage = shallowRef('')
const formState = reactive({
  staffId: '',
  password: '',
  newPassword: '',
})

const submitLabel = computed(() => (mode.value === 'activate' ? 'Activate account' : 'Sign in'))
const redirectTarget = computed(() => {
  const candidate = typeof route.query.redirect === 'string' ? route.query.redirect : '/workspace'
  return candidate.startsWith('/workspace') ? candidate : '/workspace'
})

function switchMode(nextMode) {
  mode.value = nextMode
  errorMessage.value = ''
  formState.password = ''
  formState.newPassword = ''
}

async function submit() {
  if (pending.value) {
    return
  }

  errorMessage.value = ''

  if (!formState.staffId.trim()) {
    errorMessage.value = 'Staff ID is required.'
    return
  }

  if (mode.value === 'login' && !formState.password.trim()) {
    errorMessage.value = 'Password is required.'
    return
  }

  if (mode.value === 'activate' && formState.newPassword.trim().length < 8) {
    errorMessage.value = 'New password must be at least 8 characters.'
    return
  }

  pending.value = true
  try {
    if (mode.value === 'activate') {
      await authStore.activate({
        staffId: formState.staffId.trim(),
        newPassword: formState.newPassword.trim(),
      })
    } else {
      await authStore.login({
        staffId: formState.staffId.trim(),
        password: formState.password.trim(),
      })
    }
    await router.replace(redirectTarget.value)
  } catch (error) {
    errorMessage.value = error.message || 'Unable to sign in.'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.18),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-6 py-10">
    <div class="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
      <div class="grid w-full max-w-5xl gap-8 overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur xl:grid-cols-[1.1fr_0.9fr]">
        <section class="hidden flex-col justify-between bg-slate-950 px-10 py-12 text-white xl:flex">
          <div>
            <div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
              <ShieldCheck class="h-4 w-4" />
              Support Roster Workspace
            </div>
            <h1 class="mt-6 max-w-md text-4xl font-semibold tracking-tight">Secure access for workspace operations.</h1>
            <p class="mt-4 max-w-lg text-sm leading-7 text-slate-300">
              `viewer` remains public. Workspace access now uses staff ID based sign-in, role-aware navigation, and team-scoped editor permissions.
            </p>
          </div>

          <div class="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
            <p class="font-medium text-white">Current rollout note</p>
            <p>
              First-time activation currently works inside the intranet/test scope only. Production rollout still needs stronger activation verification.
            </p>
          </div>
        </section>

        <section class="px-6 py-8 sm:px-10 sm:py-12">
          <div class="mx-auto max-w-md">
            <div class="flex items-center gap-3 text-slate-900">
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/25">
                <LockKeyhole class="h-5 w-5" />
              </div>
              <div>
                <p class="text-sm font-medium text-teal-600">Workspace authentication</p>
                <h2 class="text-2xl font-semibold tracking-tight">Sign in with your staff ID</h2>
              </div>
            </div>

            <div class="mt-8 inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 text-sm font-medium text-slate-600">
              <button
                type="button"
                class="rounded-lg px-4 py-2 transition"
                :class="mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'"
                @click="switchMode('login')"
              >
                Sign in
              </button>
              <button
                type="button"
                class="rounded-lg px-4 py-2 transition"
                :class="mode === 'activate' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'"
                @click="switchMode('activate')"
              >
                First-time activation
              </button>
            </div>

            <div v-if="errorMessage" class="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {{ errorMessage }}
            </div>

            <form class="mt-6 space-y-5" @submit.prevent="submit">
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">Staff ID</label>
                <input
                  v-model="formState.staffId"
                  type="text"
                  autocomplete="username"
                  class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  placeholder="Enter your staff ID"
                />
              </div>

              <div v-if="mode === 'login'">
                <label class="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <input
                  v-model="formState.password"
                  type="password"
                  autocomplete="current-password"
                  class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  placeholder="Enter your password"
                />
              </div>

              <div v-else>
                <label class="mb-2 block text-sm font-medium text-slate-700">New password</label>
                <input
                  v-model="formState.newPassword"
                  type="password"
                  autocomplete="new-password"
                  class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  placeholder="Set a password with at least 8 characters"
                />
                <p class="mt-2 text-xs leading-5 text-slate-500">
                  This first-time activation flow is temporarily accepted for intranet/testing only.
                </p>
              </div>

              <button
                type="submit"
                class="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="pending"
              >
                {{ pending ? 'Working...' : submitLabel }}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
