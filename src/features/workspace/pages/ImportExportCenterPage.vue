<script setup>
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Download, FileSpreadsheet, UploadCloud } from 'lucide-vue-next'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import WorkspacePageHeader from '../components/WorkspacePageHeader.vue'
import WorkspaceSurface from '../components/WorkspaceSurface.vue'
import ImportRosterPreviewModal from '../components/ImportRosterPreviewModal.vue'
import { useWorkspacePeriod } from '../composables/useWorkspacePeriod'

const fileStatus = shallowRef('idle')
const dragActive = shallowRef(false)
const previewResult = shallowRef(null)
const previewOpen = shallowRef(false)
const errorMessage = shallowRef('')
const successMessage = shallowRef('')
const fileName = shallowRef('')
const exportPending = shallowRef(false)
const templatePending = shallowRef(false)
const savePending = shallowRef(false)
const { year, month, monthLabel } = useWorkspacePeriod()
const authStore = useAuthStore()
const { t } = useI18n()
let mappingTimer = 0

const issueSummary = computed(() => ({
  high: (previewResult.value?.issues || []).filter(issue => issue.severity === 'high').length,
  medium: (previewResult.value?.issues || []).filter(issue => issue.severity === 'medium').length,
  low: (previewResult.value?.issues || []).filter(issue => issue.severity === 'low').length,
}))

function clearTimer() {
  if (mappingTimer) {
    window.clearTimeout(mappingTimer)
    mappingTimer = 0
  }
}

async function uploadFile(file) {
  if (!authStore.canWriteWorkspace) {
    errorMessage.value = t('workspace.importExport.readonlyPreviewError')
    return
  }

  clearTimer()
  previewResult.value = null
  previewOpen.value = false
  errorMessage.value = ''
  successMessage.value = ''
  fileName.value = file.name
  fileStatus.value = 'uploading'
  mappingTimer = window.setTimeout(() => {
    if (fileStatus.value === 'uploading') {
      fileStatus.value = 'mapping'
    }
  }, 250)

  try {
    const formData = new FormData()
    formData.set('file', file)
    formData.set('year', String(year.value))
    formData.set('month', String(month.value))

    previewResult.value = await api.workspace.previewImport(formData)
    previewOpen.value = true
    fileStatus.value = 'success'
  } catch (error) {
    errorMessage.value = error.message || t('workspace.importExport.previewFailedMessage')
    fileStatus.value = 'error'
  } finally {
    clearTimer()
  }
}

function handleFileChange(event) {
  const file = event.target.files?.[0]
  if (file) {
    void uploadFile(file)
  }
  event.target.value = ''
}

function handleDrop(event) {
  dragActive.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    void uploadFile(file)
  }
}

async function savePreview(payload) {
  if (savePending.value || !authStore.canWriteWorkspace) {
    return
  }

  savePending.value = true
  errorMessage.value = ''
  try {
    const response = await api.workspace.saveImportPreview(payload)
    successMessage.value = t('workspace.importExport.saveSuccess', {
      applied: response?.appliedStaffCount || 0,
      teams: response?.createdTeamCount || 0,
      staff: response?.createdStaffCount || 0,
      monthLabel: monthLabel.value,
    })
    previewOpen.value = false
    previewResult.value = null
    fileStatus.value = 'applied'
  } catch (error) {
    errorMessage.value = error.message || t('workspace.importExport.saveFailed')
  } finally {
    savePending.value = false
  }
}

async function exportRoster() {
  exportPending.value = true
  errorMessage.value = ''

  try {
    const blob = await api.workspace.exportRoster(year.value, month.value)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `workspace-roster-${year.value}-${String(month.value).padStart(2, '0')}.xlsx`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    errorMessage.value = error.message || t('workspace.importExport.exportFailed')
  } finally {
    exportPending.value = false
  }
}

async function downloadTemplate() {
  templatePending.value = true
  errorMessage.value = ''

  try {
    const blob = await api.workspace.downloadTemplate()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `import-template-${year.value}-${String(month.value).padStart(2, '0')}.xlsx`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    errorMessage.value = error.message || t('workspace.importExport.templateFailed')
  } finally {
    templatePending.value = false
  }
}

function resetImport() {
  clearTimer()
  fileStatus.value = 'idle'
  previewResult.value = null
  previewOpen.value = false
  errorMessage.value = ''
  successMessage.value = ''
  fileName.value = ''
}

watch([year, month], () => {
  resetImport()
})

onBeforeUnmount(clearTimer)
</script>

<template>
  <div class="flex h-full flex-col bg-slate-50">
    <div class="flex-1 overflow-auto p-6 xl:p-8">
      <div class="mx-auto flex max-w-[1280px] flex-col gap-6">
        <WorkspacePageHeader
          :title="t('workspace.importExport.title')"
          :description="t('workspace.importExport.description', { monthLabel })"
        >
          <template #actions>
            <button
              class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="templatePending"
              @click="downloadTemplate"
            >
              <Download class="h-4 w-4" />
              {{ templatePending ? t('workspace.importExport.downloadingTemplate') : t('workspace.importExport.downloadTemplate') }}
            </button>
            <button
              class="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="exportPending"
              @click="exportRoster"
            >
              <FileSpreadsheet class="h-4 w-4" />
              {{ exportPending ? t('workspace.importExport.exporting') : t('workspace.importExport.exportExcel') }}
            </button>
          </template>
        </WorkspacePageHeader>

        <label for="workspace-import-file" class="sr-only">{{ t('workspace.importExport.uploadRosterFile') }}</label>
        <input id="workspace-import-file" type="file" accept=".xlsx,.xls" class="sr-only" @change="handleFileChange" />

        <WorkspaceSurface v-if="errorMessage" tone="muted" class="border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          {{ errorMessage }}
        </WorkspaceSurface>

        <WorkspaceSurface v-if="successMessage" class="border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-700">
          {{ successMessage }}
        </WorkspaceSurface>

        <div class="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <WorkspaceSurface class="p-0 overflow-hidden">
            <div class="bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_28%),linear-gradient(180deg,#ffffff,rgba(248,250,252,0.98))] px-6 py-8 lg:px-8">
              <div class="max-w-3xl">
                <div class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {{ t('workspace.importExport.simpleFlowBadge') }}
                </div>
                <h2 class="mt-4 text-3xl font-semibold tracking-tight text-slate-950 lg:text-[2.35rem]">
                  {{ t('workspace.importExport.simpleFlowTitle') }}
                </h2>
                <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-600 lg:text-[15px]">
                  {{ t('workspace.importExport.simpleFlowDescription', { monthLabel }) }}
                </p>

                <div class="mt-6 grid gap-3 sm:grid-cols-3">
                  <div class="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                    <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">1</div>
                    <div class="mt-2 text-sm font-semibold text-slate-900">{{ t('workspace.importExport.stepUpload') }}</div>
                    <div class="mt-1 text-xs leading-6 text-slate-500">{{ t('workspace.importExport.stepUploadHint') }}</div>
                  </div>
                  <div class="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                    <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">2</div>
                    <div class="mt-2 text-sm font-semibold text-slate-900">{{ t('workspace.importExport.stepPreview') }}</div>
                    <div class="mt-1 text-xs leading-6 text-slate-500">{{ t('workspace.importExport.stepPreviewHint') }}</div>
                  </div>
                  <div class="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                    <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">3</div>
                    <div class="mt-2 text-sm font-semibold text-slate-900">{{ t('workspace.importExport.stepSave') }}</div>
                    <div class="mt-1 text-xs leading-6 text-slate-500">{{ t('workspace.importExport.stepSaveHint') }}</div>
                  </div>
                </div>
              </div>
            </div>
          </WorkspaceSurface>

          <WorkspaceSurface class="space-y-4">
            <div>
              <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{{ t('workspace.importExport.currentStatus') }}</div>
              <div class="mt-2 text-lg font-semibold text-slate-900">{{ fileName || t('workspace.importExport.noFileYet') }}</div>
              <div class="mt-1 text-sm text-slate-500">{{ t('workspace.importExport.currentStatusHint', { monthLabel }) }}</div>
            </div>

            <div class="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{{ t('workspace.importExport.issueSummary.high') }}</div>
                <div class="mt-2 text-2xl font-semibold text-slate-900">{{ issueSummary.high }}</div>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{{ t('workspace.importExport.issueSummary.medium') }}</div>
                <div class="mt-2 text-2xl font-semibold text-slate-900">{{ issueSummary.medium }}</div>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{{ t('workspace.importExport.issueSummary.low') }}</div>
                <div class="mt-2 text-2xl font-semibold text-slate-900">{{ issueSummary.low }}</div>
              </div>
            </div>
          </WorkspaceSurface>
        </div>

        <WorkspaceSurface
          class="border-2 border-dashed p-0 transition-colors"
          :class="dragActive ? 'border-teal-300 bg-teal-50/70' : 'border-slate-200 bg-white'"
          @dragenter.prevent="dragActive = true"
          @dragover.prevent="dragActive = true"
          @dragleave.prevent="dragActive = false"
          @drop.prevent="handleDrop"
        >
          <div class="flex flex-col items-center justify-center px-6 py-14 text-center">
            <UploadCloud class="h-12 w-12 text-teal-500" />
            <h3 class="mt-4 text-lg font-semibold text-slate-800">{{ t('workspace.importExport.clickOrDrop') }}</h3>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{{ t('workspace.importExport.uploadHint', { monthLabel }) }}</p>
            <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
              <label for="workspace-import-file" class="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                <UploadCloud class="h-4 w-4" />
                {{ t('workspace.importExport.browseFiles') }}
              </label>
              <button
                v-if="previewResult"
                type="button"
                class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                @click="previewOpen = true"
              >
                {{ t('workspace.importExport.reopenPreview') }}
              </button>
              <button
                v-if="fileStatus !== 'idle'"
                type="button"
                class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                @click="resetImport"
              >
                {{ t('workspace.importExport.resetImport') }}
              </button>
            </div>
            <div v-if="fileStatus === 'uploading' || fileStatus === 'mapping'" class="mt-4 text-sm text-slate-500">
              {{ fileStatus === 'uploading' ? t('workspace.importExport.uploadingWorkbook') : t('workspace.importExport.runningChecks') }}
            </div>
          </div>
        </WorkspaceSurface>
      </div>
    </div>
  </div>

  <ImportRosterPreviewModal
    :model-value="previewOpen"
    :preview="previewResult"
    :saving="savePending"
    :can-save="authStore.canWriteWorkspace"
    @update:model-value="previewOpen = $event"
    @save="savePreview"
  />
</template>
