<script setup>
import { Copy, Eye, EyeOff, HardDrive, Pencil, Terminal, Trash2 } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  servers: {
    type: Array,
    required: true,
  },
  visiblePasswords: {
    type: Object,
    required: true,
  },
  revealedPasswords: {
    type: Object,
    required: true,
  },
  copiedServerId: {
    type: String,
    default: '',
  },
  canManageServers: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggle-password', 'copy-password', 'launch-winscp', 'edit-server', 'delete-server'])
const { t } = useI18n()

function getStatusClass(status) {
  if (status === 'online') return 'bg-green-500'
  if (status === 'maintenance') return 'bg-amber-400'
  return 'bg-red-500'
}

function getStatusLabel(status) {
  return t(`linuxPasswords.status.${status || 'offline'}`)
}
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
    <table class="w-full border-collapse text-left text-sm">
      <thead>
        <tr class="border-b border-gray-200 bg-[#fafafa] font-medium text-gray-600">
          <th class="px-4 py-3">{{ t('linuxPasswords.columns.hostname') }}</th>
          <th class="px-4 py-3">{{ t('linuxPasswords.columns.ipAddress') }}</th>
          <th class="px-4 py-3">{{ t('linuxPasswords.columns.accounts') }}</th>
          <th class="px-4 py-3 text-right">{{ t('linuxPasswords.columns.actions') }}</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <tr v-for="server in props.servers" :key="server.id" class="group transition-colors hover:bg-[#f8fcfd]">
          <td class="px-4 py-3">
            <div class="flex items-center gap-2 font-medium text-gray-800">
              <div class="h-2 w-2 rounded-full" :class="getStatusClass(server.status)"></div>
              {{ server.hostname }}
            </div>
            <div class="ml-4 mt-1 flex flex-wrap gap-1">
              <span
                v-for="unit in server.businessUnits"
                :key="unit"
                class="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500"
                >
                  {{ unit }}
                </span>
                <span class="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] text-gray-500">
                  {{ getStatusLabel(server.status) }}
                </span>
            </div>
          </td>
          <td class="px-4 py-3 align-top font-mono text-[13px] text-gray-600">{{ server.ip }}</td>
          <td class="px-4 py-3 align-top">
            <div class="space-y-2">
              <div
                v-for="credential in server.credentials"
                :key="credential.id"
                class="grid max-w-[460px] grid-cols-[minmax(92px,130px)_minmax(150px,1fr)_auto] items-center gap-2 rounded border border-gray-200 bg-gray-50 px-2 py-1.5"
              >
                <div class="min-w-0">
                  <div class="truncate text-sm font-medium text-gray-700">{{ credential.username }}</div>
                  <div v-if="credential.notes" class="truncate text-[11px] text-gray-400">{{ credential.notes }}</div>
                </div>
                <span class="truncate font-mono text-[13px] text-gray-700">
                  {{ props.visiblePasswords[credential.id] ? props.revealedPasswords[credential.id] : '••••••••••••' }}
                </span>
                <div class="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    class="rounded p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700"
                    :title="t('common.view')"
                    @click="$emit('toggle-password', credential)"
                  >
                    <EyeOff v-if="props.visiblePasswords[credential.id]" class="h-3.5 w-3.5" />
                    <Eye v-else class="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    class="rounded p-1 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    :title="t('linuxPasswords.copyPassword')"
                    @click="$emit('copy-password', { ...server, credential })"
                  >
                    <Copy class="h-3.5 w-3.5" />
                  </button>
                </div>
                <div v-if="props.copiedServerId === credential.id" class="col-span-3 text-[11px] text-blue-600">
                  {{ t('linuxPasswords.copied') }}
                </div>
              </div>
              <div v-if="!server.credentials?.length" class="rounded border border-dashed border-gray-200 px-3 py-2 text-xs text-gray-400">
                {{ t('linuxPasswords.noCredentials') }}
              </div>
            </div>
          </td>
          <td class="px-4 py-3 text-right align-top">
            <div class="flex items-center justify-end gap-2">
              <button
                type="button"
                class="flex items-center gap-1.5 rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:border-blue-300 hover:bg-gray-50 hover:text-blue-600"
                @click="$emit('launch-winscp', server)"
              >
                <Terminal class="h-3.5 w-3.5 text-blue-600" />
                <span>{{ t('linuxPasswords.winscp') }}</span>
              </button>
              <button
                v-if="props.canManageServers"
                type="button"
                class="flex items-center gap-1.5 rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:border-emerald-300 hover:bg-gray-50 hover:text-emerald-600"
                @click="$emit('edit-server', server)"
              >
                <Pencil class="h-3.5 w-3.5 text-emerald-600" />
                <span>{{ t('common.edit') }}</span>
              </button>
              <button
                v-if="props.canManageServers"
                type="button"
                class="flex items-center gap-1.5 rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:border-red-300 hover:bg-gray-50 hover:text-red-600"
                @click="$emit('delete-server', server)"
              >
                <Trash2 class="h-3.5 w-3.5 text-red-600" />
                <span>{{ t('common.delete') }}</span>
              </button>
            </div>
          </td>
        </tr>

        <tr v-if="!props.servers.length">
          <td colspan="4" class="px-4 py-12 text-center text-gray-500">
            <div class="flex flex-col items-center justify-center gap-2">
              <HardDrive class="h-8 w-8 text-gray-300" />
              <span>{{ t('linuxPasswords.emptyState') }}</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="props.servers.length" class="flex justify-between border-t border-gray-100 bg-[#fafafa] px-4 py-3 text-xs text-gray-500">
      <span>{{ t('linuxPasswords.showingServers', { count: props.servers.length }) }}</span>
      <span>{{ t('linuxPasswords.systemActive') }}</span>
    </div>
  </div>
</template>
