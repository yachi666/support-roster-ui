<script setup>
import { computed, reactive, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LockKeyhole, ShieldCheck } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { SUPPORTED_LOCALES, currentLocale, setLocale } from '@/i18n'
import { useAuthStore } from '@/stores/auth'
import {
  WORKSPACE_ENTRY_PATH,
  resolveSafeAppRedirectPath,
} from '@/features/workspace/config/navigation'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const mode = shallowRef('login')
const pending = shallowRef(false)
const errorMessage = shallowRef('')
const formState = reactive({
  staffId: '',
  password: '',
  newPassword: '',
})

const submitLabel = computed(() =>
  mode.value === 'activate' ? t('auth.submitActivate') : t('auth.submitSignIn'),
)
const localeOptions = computed(() =>
  SUPPORTED_LOCALES.map((locale) => ({
    value: locale,
    label: locale === 'zh-CN' ? t('common.chinese') : t('common.english'),
  })),
)
const redirectTarget = computed(() => {
  const candidate =
    typeof route.query.redirect === 'string' ? route.query.redirect : WORKSPACE_ENTRY_PATH
  return resolveSafeAppRedirectPath(candidate, WORKSPACE_ENTRY_PATH)
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
    errorMessage.value = t('auth.errors.staffIdRequired')
    return
  }

  if (mode.value === 'login' && !formState.password.length) {
    errorMessage.value = t('auth.errors.passwordRequired')
    return
  }

  if (mode.value === 'activate' && formState.newPassword.length < 4) {
    errorMessage.value = t('auth.errors.newPasswordMin')
    return
  }

  pending.value = true
  try {
    if (mode.value === 'activate') {
      await authStore.activate({
        staffId: formState.staffId.trim(),
        newPassword: formState.newPassword,
      })
    } else {
      await authStore.login({
        staffId: formState.staffId.trim(),
        password: formState.password,
      })
    }
    await router.replace(redirectTarget.value)
  } catch (error) {
    errorMessage.value = error.message || t('auth.errors.signInFailed')
  } finally {
    pending.value = false
  }
}

function handleLocaleChange(event) {
  setLocale(event.target.value)
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-5 py-6 text-slate-900 sm:px-8">
    <div class="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
      <header class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div
            class="flex h-9 w-9 items-center justify-center rounded-lg border border-teal-200 bg-white text-teal-700 shadow-sm"
          >
            <ShieldCheck class="h-4 w-4" />
          </div>
          <div>
            <p class="text-sm font-semibold leading-5 text-slate-900">Workspace</p>
            <p class="text-xs leading-4 text-slate-500">{{ t('auth.hero.badge') }}</p>
          </div>
        </div>

        <select
          :value="currentLocale"
          class="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 outline-none transition hover:border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
          @change="handleLocaleChange"
        >
          <option
            v-for="localeOption in localeOptions"
            :key="localeOption.value"
            :value="localeOption.value"
          >
            {{ localeOption.label }}
          </option>
        </select>
      </header>

      <main
        class="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-16"
      >
        <section class="max-w-2xl">
          <div
            class="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700 shadow-sm"
          >
            <ShieldCheck class="h-3.5 w-3.5" />
            {{ t('auth.hero.badge') }}
          </div>
          <h1
            class="mt-5 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl"
          >
            {{ t('auth.hero.title') }}
          </h1>
          <p class="mt-4 max-w-xl text-base leading-7 text-slate-600">
            {{ t('auth.hero.description') }}
          </p>
        </section>

        <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div class="flex items-start gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white"
            >
              <LockKeyhole class="h-4 w-4" />
            </div>
            <div>
              <p class="text-sm font-semibold text-teal-700">{{ t('auth.card.eyebrow') }}</p>
              <h2 class="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                {{ t('auth.card.title') }}
              </h2>
            </div>
          </div>

          <div
            class="mt-7 grid grid-cols-2 rounded-md border border-slate-200 bg-slate-100 p-1 text-sm font-semibold text-slate-600"
          >
            <button
              type="button"
              class="rounded px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              :class="
                mode === 'login' ? 'bg-white text-slate-950 shadow-sm' : 'hover:text-slate-950'
              "
              @click="switchMode('login')"
            >
              {{ t('auth.card.signInTab') }}
            </button>
            <button
              type="button"
              class="rounded px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              :class="
                mode === 'activate' ? 'bg-white text-slate-950 shadow-sm' : 'hover:text-slate-950'
              "
              @click="switchMode('activate')"
            >
              {{ t('auth.card.activateTab') }}
            </button>
          </div>

          <div
            v-if="errorMessage"
            class="mt-5 rounded-md border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700"
          >
            {{ errorMessage }}
          </div>

          <form class="mt-5 space-y-4" @submit.prevent="submit">
            <div>
              <label class="mb-2 block text-sm font-semibold text-slate-700">{{
                t('auth.card.staffId')
              }}</label>
              <input
                v-model="formState.staffId"
                type="text"
                autocomplete="username"
                class="h-11 w-full rounded-md border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
                :placeholder="t('auth.card.staffIdPlaceholder')"
              />
            </div>

            <div v-if="mode === 'login'">
              <label class="mb-2 block text-sm font-semibold text-slate-700">{{
                t('auth.card.password')
              }}</label>
              <input
                v-model="formState.password"
                type="password"
                autocomplete="current-password"
                class="h-11 w-full rounded-md border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
                :placeholder="t('auth.card.passwordPlaceholder')"
              />
            </div>

            <div v-else>
              <label class="mb-2 block text-sm font-semibold text-slate-700">{{
                t('auth.card.newPassword')
              }}</label>
              <input
                v-model="formState.newPassword"
                type="password"
                autocomplete="new-password"
                class="h-11 w-full rounded-md border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
                :placeholder="t('auth.card.newPasswordPlaceholder')"
              />
              <p class="mt-2 text-xs leading-5 text-slate-500">
                {{ t('auth.card.intranetHint') }}
              </p>
            </div>

            <button
              type="submit"
              class="inline-flex h-11 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="pending"
            >
              {{ pending ? t('auth.working') : submitLabel }}
            </button>
          </form>
        </section>
      </main>
    </div>
  </div>
</template>
