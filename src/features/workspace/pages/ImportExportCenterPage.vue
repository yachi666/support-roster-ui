<script setup>
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { RouterLink } from 'vue-router'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Download,
  FileSpreadsheet,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  UploadCloud,
} from 'lucide-vue-next'
import { api } from '@/api'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import WorkspacePageHeader from '../components/WorkspacePageHeader.vue'
import WorkspaceSurface from '../components/WorkspaceSurface.vue'
import { useWorkspacePeriod } from '../composables/useWorkspacePeriod'

const fileStatus = shallowRef('idle')
const dragActive = shallowRef(false)
const previewResult = shallowRef(null)
const applyResult = shallowRef(null)
const errorMessage = shallowRef('')
const successMessage = shallowRef('')
const fileName = shallowRef('')
const exportPending = shallowRef(false)
const templatePending = shallowRef(false)
const { year, month, monthLabel } = useWorkspacePeriod()
const authStore = useAuthStore()
let mappingTimer = 0

const templateShiftDefinitions = [
  { team: 'L1, AP L2', code: 'A', meaning: '00:00-07:00', startTime: '00:00', endTime: '07:00', timezone: 'HKT', showOnRosterPage: 'Y', remark: '' },
  { team: 'L1', code: 'B', meaning: '06:30-15:30', startTime: '06:30', endTime: '15:30', timezone: 'HKT', showOnRosterPage: 'Y', remark: '' },
  { team: 'L1', code: 'D', meaning: '15:30-00:30', startTime: '15:30', endTime: '00:30', timezone: 'HKT', showOnRosterPage: 'Y', remark: '' },
  { team: 'AP L2', code: 'DS', meaning: 'Day Shift', startTime: '09:30', endTime: '18:30', timezone: 'HKT', showOnRosterPage: 'Y', remark: '' },
  { team: 'AP L2', code: 'NS', meaning: 'Night Shift', startTime: '18:30', endTime: '09:30', timezone: 'HKT', showOnRosterPage: 'Y', remark: '' },
]

const templateStaffShifts = [
  { name: 'John Doe', staffId: '1001', team: 'L1', region: 'China', contact: '', notes: '', day1: 'A', day2: 'B', day3: 'D' },
  { name: 'Jane Smith', staffId: '1002', team: 'AP L2', region: 'China', contact: '', notes: '', day1: 'DS', day2: 'NS', day3: 'DS' },
]

const templateColorDefinitions = [
  { code: 'A', colorName: 'Orange', rgb: '255 165 0', hex: '#FFA500' },
  { code: 'B', colorName: 'DarkOrange', rgb: '255 140 0', hex: '#FF8C00' },
  { code: 'DS', colorName: 'OrangeRed', rgb: '255 69 0', hex: '#FF4500' },
  { code: 'NS', colorName: 'Red', rgb: '255 0 0', hex: '#FF0000' },
]

const stepStates = computed(() => ({
  upload: fileStatus.value !== 'idle',
  mapping: ['mapping', 'success', 'applying', 'applied'].includes(fileStatus.value),
  apply: ['success', 'applying', 'applied'].includes(fileStatus.value),
}))

const templateSheetCards = computed(() => [
  {
    title: 'Shift Definitions',
    subtitle: 'Define codes, time windows, timezones, and whether a code appears on the roster page.',
    count: `${templateShiftDefinitions.length} sample rows`,
  },
  {
    title: 'Staff Shifts',
    subtitle: 'Provide staff identity and one code per day across the target month.',
    count: `${templateStaffShifts.length} sample rows`,
  },
  {
    title: 'Color Definitions',
    subtitle: 'Map shift codes to consistent color tokens used by the viewer and workspace grid.',
    count: `${templateColorDefinitions.length} sample rows`,
  },
])

const previewIssues = computed(() =>
  (previewResult.value?.issues || []).map((issue) => ({
    ...issue,
    severity: ['high', 'medium', 'low'].includes(issue.severity) ? issue.severity : 'low',
  })),
)

const issueSummary = computed(() => ({
  high: previewIssues.value.filter((issue) => issue.severity === 'high').length,
  medium: previewIssues.value.filter((issue) => issue.severity === 'medium').length,
  low: previewIssues.value.filter((issue) => issue.severity === 'low').length,
}))

const topPreviewIssue = computed(() =>
  [...previewIssues.value].sort((left, right) => {
    const leftWeight = left.severity === 'high' ? 0 : left.severity === 'medium' ? 1 : 2
    const rightWeight = right.severity === 'high' ? 0 : right.severity === 'medium' ? 1 : 2
    return leftWeight - rightWeight
  })[0] ?? null,
)

const previewHealth = computed(() => {
  if (!previewResult.value) {
    return {
      tone: 'neutral',
      label: 'Waiting for file',
      description: 'Upload a workbook to generate a preview batch, issue list, and apply decision.',
    }
  }

  if ((previewResult.value.invalidRecords || 0) > 0 || issueSummary.value.high > 0) {
    return {
      tone: 'warning',
      label: 'Review before apply',
      description: 'The preview found invalid rows or blocking issues. Review the issue list before applying.',
    }
  }

  if ((previewResult.value.validRecords || 0) > 0) {
    return {
      tone: 'good',
      label: 'Ready to apply',
      description: 'The preview returned valid rows and no blocking issues. You can apply this batch when ready.',
    }
  }

  return {
    tone: 'neutral',
    label: 'No importable rows',
    description: 'The workbook uploaded successfully, but the preview did not yield rows that can be applied.',
  }
})

const previewSummaryCards = computed(() => [
  {
    label: 'Parsed rows',
    value: previewResult.value?.totalRecords || 0,
    tone: 'neutral',
    description: 'All rows the server parsed from the workbook.',
  },
  {
    label: 'Ready to apply',
    value: previewResult.value?.validRecords || 0,
    tone: 'good',
    description: 'Rows that passed validation and can be applied.',
  },
  {
    label: 'Need review',
    value: previewResult.value?.invalidRecords || 0,
    tone: 'warning',
    description: 'Rows blocked by validation findings or mapping issues.',
  },
])

const canApplyPreview = computed(() =>
  !authStore.isReadonly && Boolean(previewResult.value?.batchId) && ['success', 'applied'].includes(fileStatus.value),
)

const currentBatchDisplay = computed(() => previewResult.value?.batchId || 'Not created yet')
const latestFileDisplay = computed(() => fileName.value || 'No file uploaded')

function clearTimer() {
  if (mappingTimer) {
    window.clearTimeout(mappingTimer)
    mappingTimer = 0
  }
}

async function uploadFile(file) {
  if (authStore.isReadonly) {
    errorMessage.value = 'Readonly users cannot preview imports.'
    return
  }
  clearTimer()
  previewResult.value = null
  applyResult.value = null
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
    fileStatus.value = 'success'
  } catch (error) {
    errorMessage.value = error.message || 'Failed to preview import file.'
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

async function applyChanges() {
  if (!previewResult.value?.batchId || fileStatus.value === 'applying' || authStore.isReadonly) {
    return
  }

  fileStatus.value = 'applying'
  errorMessage.value = ''

  try {
    applyResult.value = await api.workspace.applyImport(previewResult.value.batchId)
    successMessage.value = `${applyResult.value?.appliedRecords || 0} records were applied to ${monthLabel.value}.`
    fileStatus.value = 'applied'
  } catch (error) {
    errorMessage.value = error.message || 'Failed to apply import batch.'
    fileStatus.value = 'success'
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
    errorMessage.value = error.message || 'Failed to export monthly roster.'
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
    link.download = 'import-template.xlsx'
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    errorMessage.value = error.message || 'Failed to download import template.'
  } finally {
    templatePending.value = false
  }
}

function resetImport() {
  clearTimer()
  fileStatus.value = 'idle'
  previewResult.value = null
  applyResult.value = null
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
          title="Import / Export Center"
          :description="`Preflight workbook imports, inspect issues before apply, and export the active roster for ${monthLabel}.`"
        >
          <template #actions>
            <button
              class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="templatePending"
              @click="downloadTemplate"
            >
              <Download class="h-4 w-4" />
              {{ templatePending ? 'Downloading...' : 'Download Template' }}
            </button>
            <button
              class="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="exportPending"
              @click="exportRoster"
            >
              <FileSpreadsheet class="h-4 w-4" />
              {{ exportPending ? 'Exporting...' : 'Export Excel' }}
            </button>
          </template>
        </WorkspacePageHeader>

        <label for="workspace-import-file" class="sr-only">Upload roster Excel file</label>
        <input id="workspace-import-file" name="workspace-import-file" type="file" accept=".xlsx,.xls" class="sr-only" @change="handleFileChange" />

        <WorkspaceSurface v-if="errorMessage" tone="muted" class="border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          {{ errorMessage }}
        </WorkspaceSurface>

        <WorkspaceSurface v-if="successMessage" class="border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-700">
          {{ successMessage }}
        </WorkspaceSurface>

        <div class="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
          <WorkspaceSurface
            :padded="false"
            class="overflow-hidden border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_28%),linear-gradient(180deg,#ffffff,rgba(248,250,252,0.98))]"
          >
            <div class="grid gap-8 px-6 py-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-8">
              <div class="space-y-5">
                <div class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <Sparkles class="h-3.5 w-3.5 text-teal-500" />
                  Import preflight desk
                </div>

                <div>
                  <h2 class="max-w-2xl text-3xl font-semibold tracking-tight text-slate-950 lg:text-[2.4rem]">
                    {{ previewHealth.label }}
                  </h2>
                  <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-600 lg:text-[15px]">
                    {{ previewHealth.description }}
                  </p>
                </div>

                <div class="grid gap-3 sm:grid-cols-3">
                  <div class="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                    <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Target month</div>
                    <div class="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{{ monthLabel }}</div>
                    <div class="mt-1 text-xs leading-6 text-slate-500">Uploads and exports stay aligned with the shared workspace period.</div>
                  </div>
                  <div class="min-w-0 rounded-2xl border border-white/80 bg-white/85 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                    <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Preview batch</div>
                    <div class="mt-2 break-all font-mono text-sm font-semibold leading-6 text-slate-950">{{ currentBatchDisplay }}</div>
                    <div class="mt-1 text-xs leading-6 text-slate-500">Created after preview and reused by the apply action.</div>
                  </div>
                  <div class="min-w-0 rounded-2xl border border-white/80 bg-white/85 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                    <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Latest file</div>
                    <div class="mt-2 break-words text-base font-semibold leading-6 tracking-tight text-slate-950">{{ latestFileDisplay }}</div>
                    <div class="mt-1 text-xs leading-6 text-slate-500">The preflight desk always reflects the latest uploaded workbook.</div>
                  </div>
                </div>
              </div>

              <div class="rounded-[28px] border border-slate-200 bg-white/85 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
                <div class="flex items-center justify-between gap-3">
                  <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Workflow</div>
                  <span
                    :class="[
                      'inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
                      previewHealth.tone === 'good'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : previewHealth.tone === 'warning'
                          ? 'border-amber-200 bg-amber-50 text-amber-700'
                          : 'border-slate-200 bg-slate-100 text-slate-700',
                    ]"
                  >
                    {{ previewHealth.label }}
                  </span>
                </div>

                <div class="mt-5 space-y-4">
                  <div class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">1 · Download template</div>
                    <div class="mt-1 text-sm font-semibold text-slate-900">Use the official workbook shape</div>
                    <div class="mt-1 text-xs leading-6 text-slate-500">Keep team names, shift codes, and sheet names aligned with the template reference below.</div>
                  </div>
                  <div class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">2 · Preview import</div>
                    <div class="mt-1 text-sm font-semibold text-slate-900">Generate a validation batch first</div>
                    <div class="mt-1 text-xs leading-6 text-slate-500">The server returns parsed counts plus issue details before any roster data is applied.</div>
                  </div>
                  <div class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">3 · Apply only when ready</div>
                    <div class="mt-1 text-sm font-semibold text-slate-900">Use preview findings as the decision gate</div>
                    <div class="mt-1 text-xs leading-6 text-slate-500">If the preview shows blocking issues, open Validation Center before applying.</div>
                  </div>
                </div>
              </div>
            </div>
          </WorkspaceSurface>

          <WorkspaceSurface :padded="false" class="overflow-hidden">
            <div class="border-b border-slate-100 px-6 py-5">
              <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Template guide</div>
              <h2 class="mt-2 text-lg font-semibold tracking-tight text-slate-900">Workbook shape at a glance</h2>
            </div>
            <div class="space-y-3 p-4">
              <div
                v-for="sheet in templateSheetCards"
                :key="sheet.title"
                class="rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#fff,rgba(248,250,252,0.96))] p-4 shadow-sm"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <div class="text-sm font-semibold text-slate-900">{{ sheet.title }}</div>
                    <div class="mt-1 text-xs leading-6 text-slate-500">{{ sheet.subtitle }}</div>
                  </div>
                  <span class="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {{ sheet.count }}
                  </span>
                </div>
              </div>
            </div>
          </WorkspaceSurface>
        </div>

        <WorkspaceSurface :padded="false" class="overflow-hidden">
          <div class="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div class="flex items-center gap-2">
                <UploadCloud class="h-5 w-5 text-slate-400" />
                <h2 class="text-base font-semibold text-slate-800">Import workbook</h2>
              </div>

              <div class="flex items-center gap-2 text-xs text-slate-500">
                <span class="rounded-full border border-slate-200 bg-white px-3 py-1.5">Upload</span>
                <span class="text-slate-300">→</span>
                <span class="rounded-full border border-slate-200 bg-white px-3 py-1.5">Preview</span>
                <span class="text-slate-300">→</span>
                <span class="rounded-full border border-slate-200 bg-white px-3 py-1.5">Apply</span>
              </div>
            </div>
          </div>

          <div class="space-y-6 p-6">
            <div class="mx-auto flex max-w-2xl items-center">
              <div class="flex flex-1 flex-col items-center gap-2">
                <div :class="cn('flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors', stepStates.upload ? 'border-teal-500 bg-teal-50 text-teal-600' : 'border-slate-300 bg-white text-slate-400')">1</div>
                <span :class="cn('text-xs font-medium', stepStates.upload ? 'text-teal-700' : 'text-slate-500')">Upload</span>
              </div>
              <div class="-mt-6 h-px w-16 bg-slate-200"></div>
              <div class="flex flex-1 flex-col items-center gap-2">
                <div :class="cn('flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors', stepStates.mapping ? 'border-teal-500 bg-teal-50 text-teal-600' : 'border-slate-300 bg-white text-slate-400')">2</div>
                <span :class="cn('text-xs font-medium', stepStates.mapping ? 'text-teal-700' : 'text-slate-500')">Preview</span>
              </div>
              <div class="-mt-6 h-px w-16 bg-slate-200"></div>
              <div class="flex flex-1 flex-col items-center gap-2">
                <div :class="cn('flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors', stepStates.apply ? 'border-teal-500 bg-teal-50 text-teal-600' : 'border-slate-300 bg-white text-slate-400')">3</div>
                <span :class="cn('text-xs font-medium', stepStates.apply ? 'text-teal-700' : 'text-slate-500')">Apply</span>
              </div>
            </div>

            <div
              v-if="fileStatus === 'idle'"
              :class="cn(
                'cursor-pointer rounded-[28px] border-2 border-dashed p-12 text-center transition-colors',
                dragActive ? 'border-teal-400 bg-teal-50/60' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
              )"
              @dragover.prevent="dragActive = true"
              @dragleave="dragActive = false"
              @drop.prevent="handleDrop"
            >
              <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-slate-100 bg-white shadow-sm">
                <FileSpreadsheet class="h-8 w-8 text-emerald-500" />
              </div>
              <h3 class="mb-1 text-lg font-semibold text-slate-700">Click to upload or drag & drop</h3>
              <p class="mx-auto mb-6 max-w-sm text-sm text-slate-500">
                Upload a roster workbook for {{ monthLabel }}. The server will preview row counts and validation issues before anything is applied.
              </p>
              <label v-if="!authStore.isReadonly" for="workspace-import-file" class="inline-flex cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
                Browse files
              </label>
            </div>

            <div v-else-if="fileStatus === 'uploading'" class="flex flex-col items-center justify-center rounded-[28px] border border-slate-200 bg-slate-50 p-12">
              <RefreshCw class="mb-4 h-8 w-8 animate-spin text-teal-500" />
              <h3 class="text-base font-semibold text-slate-700">Uploading workbook...</h3>
              <p class="mt-2 text-sm text-slate-500">{{ fileName }}</p>
              <div class="mt-4 h-2 w-64 overflow-hidden rounded-full bg-slate-200">
                <div class="h-full w-1/2 animate-pulse bg-teal-500"></div>
              </div>
            </div>

            <div v-else-if="fileStatus === 'mapping'" class="flex flex-col items-center justify-center rounded-[28px] border border-slate-200 bg-slate-50 p-12">
              <RefreshCw class="mb-4 h-8 w-8 animate-spin text-teal-500" />
              <h3 class="text-base font-semibold text-slate-700">Running preflight checks...</h3>
              <p class="mt-2 text-sm text-slate-500">Parsing workbook structure, validating rows, and preparing the preview batch.</p>
            </div>

            <div v-else-if="fileStatus === 'error'" class="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-center">
              <AlertTriangle class="mx-auto mb-3 h-8 w-8 text-rose-500" />
              <h3 class="text-base font-semibold text-rose-800">Import preview failed</h3>
              <p class="mt-2 text-sm text-rose-700">{{ errorMessage }}</p>
              <button class="mt-5 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100" @click="resetImport">
                Reset
              </button>
            </div>

            <div v-else class="space-y-6">
              <div class="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div
                  :class="[
                    'flex flex-col gap-4 border-b p-6 lg:flex-row lg:items-center lg:justify-between',
                    previewHealth.tone === 'good'
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : previewHealth.tone === 'warning'
                        ? 'border-amber-200 bg-amber-50/50'
                        : 'border-slate-200 bg-slate-50/60',
                  ]"
                >
                  <div class="flex items-center gap-3">
                    <div
                      :class="[
                        'flex h-11 w-11 items-center justify-center rounded-full',
                        previewHealth.tone === 'good'
                          ? 'bg-emerald-100 text-emerald-600'
                          : previewHealth.tone === 'warning'
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-slate-100 text-slate-600',
                      ]"
                    >
                      <CheckCircle2 v-if="previewHealth.tone === 'good'" class="h-5 w-5" />
                      <ShieldAlert v-else-if="previewHealth.tone === 'warning'" class="h-5 w-5" />
                      <FileSpreadsheet v-else class="h-5 w-5" />
                    </div>
                    <div>
                      <h3 class="text-base font-semibold text-slate-800">{{ fileStatus === 'applied' ? 'Import applied' : previewHealth.label }}</h3>
                      <p class="mt-0.5 break-words text-sm leading-6 text-slate-500">{{ latestFileDisplay }} · Batch {{ currentBatchDisplay }}</p>
                    </div>
                  </div>

                  <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span class="rounded-full border border-slate-200 bg-white px-3 py-1.5">{{ previewResult?.totalRecords || 0 }} parsed</span>
                    <span class="rounded-full border border-slate-200 bg-white px-3 py-1.5">{{ previewResult?.validRecords || 0 }} ready</span>
                    <span class="rounded-full border border-slate-200 bg-white px-3 py-1.5">{{ previewResult?.invalidRecords || 0 }} blocked</span>
                  </div>
                </div>

                <div class="grid gap-4 p-6 xl:grid-cols-[1.2fr_0.8fr]">
                  <div class="space-y-4">
                    <div class="grid gap-4 md:grid-cols-3">
                      <div
                        v-for="card in previewSummaryCards"
                        :key="card.label"
                        class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                      >
                        <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{{ card.label }}</div>
                        <div class="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{{ card.value }}</div>
                        <div class="mt-1 text-xs leading-6 text-slate-500">{{ card.description }}</div>
                      </div>
                    </div>

                    <div
                      v-if="topPreviewIssue"
                      class="rounded-2xl border border-amber-200 bg-amber-50/70 p-5"
                    >
                      <div class="flex flex-wrap items-center gap-2">
                        <span
                          :class="[
                                'inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
                            topPreviewIssue.severity === 'high'
                              ? 'border-rose-200 bg-rose-50 text-rose-700'
                              : topPreviewIssue.severity === 'medium'
                                ? 'border-amber-200 bg-amber-50 text-amber-700'
                                : 'border-sky-200 bg-sky-50 text-sky-700',
                          ]"
                        >
                          {{ topPreviewIssue.severity }}
                        </span>
                        <span class="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                          {{ topPreviewIssue.team || topPreviewIssue.type || topPreviewIssue.date || 'Issue' }}
                        </span>
                      </div>
                      <div class="mt-3 text-sm font-semibold text-slate-900">{{ topPreviewIssue.type || 'Top preview issue' }}</div>
                      <div class="mt-1 text-sm leading-7 text-slate-600">{{ topPreviewIssue.description }}</div>
                      <RouterLink
                        to="/workspace/validation"
                        class="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-100"
                      >
                        Open Validation Center
                        <ArrowRight class="h-3.5 w-3.5" />
                      </RouterLink>
                    </div>

                    <div class="rounded-2xl border border-slate-200 bg-white p-5">
                      <div class="flex items-center justify-between gap-3">
                        <div>
                          <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Preview issue list</div>
                          <div class="mt-1 text-sm font-semibold text-slate-900">Findings returned by the preview API</div>
                        </div>
                        <span class="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {{ previewIssues.length }} issue{{ previewIssues.length === 1 ? '' : 's' }}
                        </span>
                      </div>

                      <ul class="mt-4 space-y-3">
                        <li v-if="!previewIssues.length" class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-500">
                          No validation issues were returned. This batch is ready for final review and apply.
                        </li>
                        <li
                          v-for="issue in previewIssues"
                          :key="issue.id || `${issue.type}-${issue.description}`"
                          class="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                        >
                          <div class="flex flex-wrap items-center gap-2">
                            <span
                              :class="[
                                'inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
                                issue.severity === 'high'
                                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                                  : issue.severity === 'medium'
                                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                                    : 'border-sky-200 bg-sky-50 text-sky-700',
                              ]"
                            >
                              {{ issue.severity }}
                            </span>
                            <span class="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                              {{ issue.team || issue.type || issue.date || '-' }}
                            </span>
                          </div>
                          <div class="text-sm font-medium text-slate-800">{{ issue.description }}</div>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div class="space-y-4">
                    <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                      <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Issue breakdown</div>
                      <div class="mt-4 space-y-3">
                        <div class="flex items-center justify-between rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-3">
                          <span class="text-sm font-medium text-slate-700">High severity</span>
                          <span class="text-sm font-semibold text-rose-700">{{ issueSummary.high }}</span>
                        </div>
                        <div class="flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3">
                          <span class="text-sm font-medium text-slate-700">Medium severity</span>
                          <span class="text-sm font-semibold text-amber-700">{{ issueSummary.medium }}</span>
                        </div>
                        <div class="flex items-center justify-between rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3">
                          <span class="text-sm font-medium text-slate-700">Low severity</span>
                          <span class="text-sm font-semibold text-sky-700">{{ issueSummary.low }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="rounded-2xl border border-slate-200 bg-white p-5">
                      <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Next step</div>
                      <div class="mt-2 text-sm font-semibold text-slate-900">
                        {{ fileStatus === 'applied' ? 'Batch already applied' : previewHealth.label }}
                      </div>
                      <div class="mt-2 text-xs leading-6 text-slate-500">
                        {{ fileStatus === 'applied'
                          ? `${applyResult?.appliedRecords || 0} record(s) were applied for ${monthLabel}. Keep this preview for reference or reset to import another file.`
                          : previewHealth.description }}
                      </div>

                      <div class="mt-4 flex flex-col gap-2">
                        <button
                          class="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                          :disabled="!canApplyPreview || fileStatus === 'applying' || fileStatus === 'applied'"
                          @click="applyChanges"
                        >
                          {{ authStore.isReadonly ? 'Readonly Mode' : fileStatus === 'applying' ? 'Applying...' : fileStatus === 'applied' ? 'Applied' : 'Apply Changes' }}
                          <ChevronRight class="h-4 w-4" />
                        </button>
                        <RouterLink
                          to="/workspace/validation"
                          class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          Review in Validation Center
                          <ArrowRight class="h-4 w-4" />
                        </RouterLink>
                        <button
                          class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                          @click="resetImport"
                        >
                          Reset import
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </WorkspaceSurface>

        <WorkspaceSurface :padded="false" class="overflow-hidden">
          <div class="border-b border-slate-100 px-6 py-5">
            <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Template reference</div>
            <h2 class="mt-2 text-lg font-semibold tracking-tight text-slate-900">Sample rows from the official workbook</h2>
          </div>

          <div class="space-y-6 p-6">
            <p class="text-sm leading-7 text-slate-600">
              The import workbook contains three sheets: <strong>Shift Definitions</strong>, <strong>Staff Shifts</strong>, and <strong>Color Definitions</strong>.
              In <strong>Shift Definitions</strong>, the <strong>team</strong> column can contain a single team or multiple team names separated by commas.
            </p>

            <div class="space-y-3">
              <h3 class="text-sm font-semibold text-slate-800">Sheet 1: Shift Definitions</h3>
              <div class="overflow-x-auto rounded-2xl border border-slate-200">
                <table class="min-w-full text-left text-sm text-slate-600">
                  <thead class="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th class="px-4 py-3">team</th>
                      <th class="px-4 py-3">code</th>
                      <th class="px-4 py-3">meaning</th>
                      <th class="px-4 py-3">start_time</th>
                      <th class="px-4 py-3">end_time</th>
                      <th class="px-4 py-3">timezone</th>
                      <th class="px-4 py-3">show</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr v-for="row in templateShiftDefinitions" :key="row.code + row.team" class="bg-white">
                      <td class="px-4 py-2.5 font-mono text-xs">{{ row.team }}</td>
                      <td class="px-4 py-2.5 font-mono text-xs font-semibold text-teal-700">{{ row.code }}</td>
                      <td class="px-4 py-2.5">{{ row.meaning }}</td>
                      <td class="px-4 py-2.5 font-mono text-xs">{{ row.startTime }}</td>
                      <td class="px-4 py-2.5 font-mono text-xs">{{ row.endTime }}</td>
                      <td class="px-4 py-2.5 text-xs">{{ row.timezone }}</td>
                      <td class="px-4 py-2.5 text-xs">{{ row.showOnRosterPage }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="space-y-3">
              <h3 class="text-sm font-semibold text-slate-800">Sheet 2: Staff Shifts</h3>
              <div class="overflow-x-auto rounded-2xl border border-slate-200">
                <table class="min-w-full text-left text-sm text-slate-600">
                  <thead class="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th class="px-4 py-3">name</th>
                      <th class="px-4 py-3">staff_id</th>
                      <th class="px-4 py-3">team</th>
                      <th class="px-4 py-3">region</th>
                      <th class="px-4 py-3">1</th>
                      <th class="px-4 py-3">2</th>
                      <th class="px-4 py-3">3</th>
                      <th class="px-4 py-3">...</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr v-for="row in templateStaffShifts" :key="row.staffId" class="bg-white">
                      <td class="px-4 py-2.5 font-medium text-slate-800">{{ row.name }}</td>
                      <td class="px-4 py-2.5 font-mono text-xs">{{ row.staffId }}</td>
                      <td class="px-4 py-2.5 font-mono text-xs">{{ row.team }}</td>
                      <td class="px-4 py-2.5 text-xs">{{ row.region }}</td>
                      <td class="px-4 py-2.5 font-mono text-xs font-semibold text-teal-700">{{ row.day1 }}</td>
                      <td class="px-4 py-2.5 font-mono text-xs font-semibold text-teal-700">{{ row.day2 }}</td>
                      <td class="px-4 py-2.5 font-mono text-xs font-semibold text-teal-700">{{ row.day3 }}</td>
                      <td class="px-4 py-2.5 text-xs text-slate-400">4-31</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="space-y-3">
              <h3 class="text-sm font-semibold text-slate-800">Sheet 3: Color Definitions</h3>
              <div class="overflow-x-auto rounded-2xl border border-slate-200">
                <table class="min-w-full text-left text-sm text-slate-600">
                  <thead class="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th class="px-4 py-3">code</th>
                      <th class="px-4 py-3">color_name</th>
                      <th class="px-4 py-3">rgb</th>
                      <th class="px-4 py-3">hex</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr v-for="row in templateColorDefinitions" :key="row.code" class="bg-white">
                      <td class="px-4 py-2.5 font-mono text-xs font-semibold text-teal-700">{{ row.code }}</td>
                      <td class="px-4 py-2.5">{{ row.colorName }}</td>
                      <td class="px-4 py-2.5 font-mono text-xs">{{ row.rgb }}</td>
                      <td class="px-4 py-2.5">
                        <span class="inline-flex items-center gap-2">
                          <span class="h-4 w-4 rounded border border-slate-200 shadow-sm" :style="{ backgroundColor: row.hex }"></span>
                          <span class="font-mono text-xs">{{ row.hex }}</span>
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </WorkspaceSurface>
      </div>
    </div>
  </div>
</template>
