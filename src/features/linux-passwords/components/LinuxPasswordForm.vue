<script setup>
import { computed, reactive, watch } from 'vue'
import { Save } from 'lucide-vue-next'
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

const formState = reactive({
  hostname: '',
  ip: '',
  username: '',
  password: '',
  businessUnits: [],
  newDirectory: '',
  status: 'online',
})

const isEditMode = computed(() => props.mode === 'edit')

function applyServer(server) {
  formState.hostname = server?.hostname || ''
  formState.ip = server?.ip || ''
  formState.username = server?.username || ''
  formState.password = server?.password || ''
  formState.businessUnits = Array.isArray(server?.businessUnits) ? [...server.businessUnits] : []
  formState.newDirectory = ''
  formState.status = server?.status || 'online'
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

function handleSubmit() {
  const payload = {
    hostname: formState.hostname,
    ip: formState.ip,
    username: formState.username,
    password: formState.password,
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

        <label class="block">
          <span class="mb-1.5 block text-sm font-medium text-gray-700">{{ t('linuxPasswords.columns.username') }}</span>
          <input
            v-model="formState.username"
            required
            type="text"
            :placeholder="t('linuxPasswords.usernamePlaceholder')"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </label>

        <label class="block">
          <span class="mb-1.5 block text-sm font-medium text-gray-700">{{ t('linuxPasswords.columns.password') }}</span>
          <input
            v-model="formState.password"
            required
            type="password"
            :placeholder="t('linuxPasswords.passwordPlaceholder')"
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
