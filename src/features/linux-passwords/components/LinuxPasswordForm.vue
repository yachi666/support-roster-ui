<script setup>
import { computed, reactive, watch } from 'vue'
import { Plus, Save, Trash2 } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { mergeLinuxPasswordDirectories } from '../lib/linuxPasswords.js'

const props = defineProps({
  availableUnits: {
    type: Array,
    required: true,
  },
  mode: {
    type: String,
    default: 'create',
  },
  initialServer: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['submit', 'cancel'])
const { t } = useI18n()

let credentialKeyCounter = 0

const formState = reactive({
  hostname: '',
  ip: '',
  credentials: [],
  businessUnits: [],
  newDirectory: '',
  status: 'online',
})

const isEditMode = computed(() => props.mode === 'edit')

function applyServer(server) {
  formState.hostname = server?.hostname || ''
  formState.ip = server?.ip || ''
  formState.credentials = Array.isArray(server?.credentials) && server.credentials.length
    ? server.credentials.map((credential) => ({
        _localKey: ++credentialKeyCounter,
        id: credential.id,
        username: credential.username || '',
        password: '',
        notes: credential.notes || '',
      }))
    : [createCredential()]
  formState.businessUnits = Array.isArray(server?.businessUnits) ? [...server.businessUnits] : []
  formState.newDirectory = ''
  formState.status = server?.status || 'online'
}

function createCredential() {
  return {
    _localKey: ++credentialKeyCounter,
    id: null,
    username: '',
    password: '',
    notes: '',
  }
}

watch(
  () => [props.mode, props.initialServer],
  () => {
    if (props.mode === 'edit' && props.initialServer) {
      applyServer(props.initialServer)
      return
    }
    applyServer(null)
  },
  { immediate: true },
)

function toggleBusinessUnit(businessUnit) {
  if (formState.businessUnits.includes(businessUnit)) {
    formState.businessUnits = formState.businessUnits.filter((value) => value !== businessUnit)
    return
  }

  formState.businessUnits = [...formState.businessUnits, businessUnit]
}

function addCredential() {
  formState.credentials = [...formState.credentials, createCredential()]
}

function removeCredential(index) {
  if (formState.credentials.length <= 1) {
    return
  }
  formState.credentials = formState.credentials.filter((_, credentialIndex) => credentialIndex !== index)
}

function handleSubmit() {
  const payload = {
    hostname: formState.hostname,
    ip: formState.ip,
    credentials: formState.credentials,
    businessUnits: mergeLinuxPasswordDirectories(formState.businessUnits, formState.newDirectory),
  }

  if (isEditMode.value) {
    payload.status = formState.status
  }

  emit('submit', payload)
}
</script>

<template>
  <form class="mx-auto max-w-3xl rounded-lg border border-gray-200 bg-white shadow-sm" @submit.prevent="handleSubmit">
    <div class="border-b border-gray-100 p-6">
      <h2 class="text-lg font-semibold text-gray-800">
        {{ isEditMode ? t('linuxPasswords.editServer') : t('linuxPasswords.formTitle') }}
      </h2>
      <p class="mt-1 text-sm text-gray-500">{{ t('linuxPasswords.formDescription') }}</p>
    </div>

    <div class="space-y-6 p-6">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <label class="block">
          <span class="mb-1.5 block text-sm font-medium text-gray-700">{{ t('linuxPasswords.columns.hostname') }}</span>
          <input
            v-model="formState.hostname"
            required
            type="text"
            :placeholder="t('linuxPasswords.hostnamePlaceholder')"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </label>

        <label class="block">
          <span class="mb-1.5 block text-sm font-medium text-gray-700">{{ t('linuxPasswords.columns.ipAddress') }}</span>
          <input
            v-model="formState.ip"
            required
            type="text"
            :placeholder="t('linuxPasswords.ipPlaceholder')"
            class="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </label>

        <label v-if="isEditMode" class="block">
          <span class="mb-1.5 block text-sm font-medium text-gray-700">{{ t('common.status') }}</span>
          <select
            v-model="formState.status"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="online">{{ t('linuxPasswords.status.online') }}</option>
            <option value="maintenance">{{ t('linuxPasswords.status.maintenance') }}</option>
            <option value="offline">{{ t('linuxPasswords.status.offline') }}</option>
          </select>
        </label>
      </div>

      <section class="rounded-md border border-slate-200 bg-slate-50/60">
        <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h3 class="text-sm font-semibold text-slate-800">{{ t('linuxPasswords.loginAccounts') }}</h3>
            <p class="mt-0.5 text-xs text-slate-500">{{ t('linuxPasswords.loginAccountsHint') }}</p>
          </div>
          <button
            type="button"
            class="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-700"
            @click="addCredential"
          >
            <Plus class="h-3.5 w-3.5" />
            {{ t('linuxPasswords.addCredential') }}
          </button>
        </div>

        <div class="divide-y divide-slate-200">
          <div
            v-for="(credential, index) in formState.credentials"
            :key="credential._localKey"
            class="grid grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[1fr_1fr_auto]"
          >
            <label class="block">
              <span class="mb-1.5 block text-sm font-medium text-gray-700">{{ t('linuxPasswords.columns.username') }}</span>
              <input
                v-model="credential.username"
                required
                type="text"
                :placeholder="t('linuxPasswords.usernamePlaceholder')"
                class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </label>

            <label class="block">
              <span class="mb-1.5 block text-sm font-medium text-gray-700">{{ t('linuxPasswords.columns.password') }}</span>
              <input
                v-model="credential.password"
                :required="!isEditMode || !credential.id"
                type="password"
                :placeholder="isEditMode && credential.id ? t('linuxPasswords.passwordUnchangedPlaceholder') : t('linuxPasswords.passwordPlaceholder')"
                class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </label>

            <button
              type="button"
              class="mt-6 inline-flex h-9 items-center justify-center rounded-md border border-red-200 bg-white px-3 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="formState.credentials.length <= 1"
              @click="removeCredential(index)"
            >
              <Trash2 class="h-4 w-4" />
              <span class="sr-only">{{ t('linuxPasswords.removeCredential') }}</span>
            </button>

            <label class="block md:col-span-3">
              <span class="mb-1.5 block text-sm font-medium text-gray-700">{{ t('common.notes') }}</span>
              <input
                v-model="credential.notes"
                type="text"
                :placeholder="t('linuxPasswords.credentialNotesPlaceholder')"
                class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </label>
          </div>
        </div>
      </section>

      <div>
        <div class="mb-3 text-sm font-medium text-gray-700">{{ t('linuxPasswords.assignFolders') }}</div>
        <p class="mb-3 text-xs text-gray-500">{{ t('linuxPasswords.assignFoldersHint') }}</p>
        <label class="mb-4 block">
          <span class="mb-1.5 block text-sm font-medium text-gray-700">{{ t('linuxPasswords.newDirectoryLabel') }}</span>
          <input
            v-model="formState.newDirectory"
            type="text"
            :placeholder="t('linuxPasswords.newDirectoryPlaceholder')"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <span class="mt-1.5 block text-xs text-gray-500">{{ t('linuxPasswords.newDirectoryHint') }}</span>
        </label>
        <div class="flex flex-wrap gap-2.5">
          <label
            v-for="businessUnit in props.availableUnits"
            :key="businessUnit"
            class="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors"
            :class="formState.businessUnits.includes(businessUnit) ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'"
          >
            <input
              type="checkbox"
              :checked="formState.businessUnits.includes(businessUnit)"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/30"
              @change="toggleBusinessUnit(businessUnit)"
            />
            <span>{{ businessUnit }}</span>
          </label>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
      <button
        type="button"
        class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        @click="$emit('cancel')"
      >
        {{ t('common.cancel') }}
      </button>
      <button
        type="submit"
        class="flex items-center gap-1.5 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
      >
        <Save class="h-4 w-4" />
        {{ isEditMode ? t('linuxPasswords.saveChanges') : t('linuxPasswords.saveMachine') }}
      </button>
    </div>
  </form>
</template>
