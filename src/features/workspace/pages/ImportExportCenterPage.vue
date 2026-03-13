<script setup>
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Download,
  FileSpreadsheet,
  RefreshCw,
  UploadCloud,
} from 'lucide-vue-next'
import { api } from '@/api'
import { cn } from '@/lib/utils'
import WorkspacePageHeader from '../components/WorkspacePageHeader.vue'
import WorkspaceSurface from '../components/WorkspaceSurface.vue'
import { useWorkspacePeriod } from '../composables/useWorkspacePeriod'

const fileStatus = shallowRef('idle')
const dragActive = shallowRef(false)
const previewResult = shallowRef(null)
const applyResult = shallowRef(null)
const errorMessage = shallowRef('')
const fileName = shallowRef('')
const exportPending = shallowRef(false)
const templatePending = shallowRef(false)
const { year, month, monthLabel } = useWorkspacePeriod()
let mappingTimer = 0

const templateShiftDefinitions = [
  { roleGroup: 'L1_China', code: 'A', meaning: '00:00-07:00', startTime: '00:00', endTime: '07:00', timezone: 'HKT', showOnRosterPage: 'Y', remark: '' },
  { roleGroup: 'L1_China', code: 'B', meaning: '06:30-15:30', startTime: '06:30', endTime: '15:30', timezone: 'HKT', showOnRosterPage: 'Y', remark: '' },
  { roleGroup: 'L1_China', code: 'D', meaning: '15:30-00:30', startTime: '15:30', endTime: '00:30', timezone: 'HKT', showOnRosterPage: 'Y', remark: '' },
  { roleGroup: 'AP_L2', code: 'DS', meaning: 'Day Shift', startTime: '09:30', endTime: '18:30', timezone: 'HKT', showOnRosterPage: 'Y', remark: '' },
  { roleGroup: 'AP_L2', code: 'NS', meaning: 'Night Shift', startTime: '18:30', endTime: '09:30', timezone: 'HKT', showOnRosterPage: 'Y', remark: '' },
]

const templateStaffShifts = [
  { name: 'John Doe', staffId: '1001', roleGroup: 'L1_China', region: 'China', contact: '', notes: '', day1: 'A', day2: 'B', day3: 'D' },
  { name: 'Jane Smith', staffId: '1002', roleGroup: 'AP_L2', region: 'China', contact: '', notes: '', day1: 'DS', day2: 'NS', day3: 'DS' },
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

function clearTimer() {
  if (mappingTimer) {
    window.clearTimeout(mappingTimer)
    mappingTimer = 0
  }
}

async function uploadFile(file) {
  clearTimer()
  previewResult.value = null
  applyResult.value = null
  errorMessage.value = ''
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
  if (!previewResult.value?.batchId || fileStatus.value === 'applying') {
    return
  }

  fileStatus.value = 'applying'
  errorMessage.value = ''

  try {
    applyResult.value = await api.workspace.applyImport(previewResult.value.batchId)
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
    link.download = `workspace-roster-${year.value}-${String(month.value).padStart(2, '0')}.csv`
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
  fileName.value = ''
}

watch([year, month], () => {
  resetImport()
})

onBeforeUnmount(clearTimer)
</script>

<template>
  <div class="flex h-full flex-col bg-slate-50">
    <div class="flex-1 overflow-auto p-8">
      <div class="mx-auto flex max-w-5xl flex-col gap-8">
        <WorkspacePageHeader
          title="Import / Export Center"
          :description="`Sync your master roster via Excel or download the latest schedule for ${monthLabel}.`"
        />

        <label for="workspace-import-file" class="sr-only">Upload roster Excel file</label>
        <input id="workspace-import-file" name="workspace-import-file" type="file" accept=".xlsx,.xls" class="sr-only" @change="handleFileChange" />

        <WorkspaceSurface v-if="errorMessage" tone="muted" class="border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          {{ errorMessage }}
        </WorkspaceSurface>

        <WorkspaceSurface class="flex items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <Download class="h-6 w-6" />
            </div>
            <div>
              <h2 class="text-base font-semibold text-slate-800">Export Current Roster</h2>
              <p class="mt-0.5 text-sm text-slate-500">Download the active schedule for {{ monthLabel }}</p>
            </div>
          </div>
          <button class="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60" :disabled="exportPending" @click="exportRoster">
            <FileSpreadsheet class="h-4 w-4 text-emerald-600" />
            {{ exportPending ? 'Exporting...' : 'Export CSV' }}
          </button>
        </WorkspaceSurface>

        <WorkspaceSurface :padded="false">
          <div class="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <div class="flex items-center gap-2">
              <FileSpreadsheet class="h-5 w-5 text-slate-400" />
              <h2 class="text-base font-semibold text-slate-800">Import Template Example</h2>
            </div>
            <button class="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60" :disabled="templatePending" @click="downloadTemplate">
              <Download class="h-4 w-4 text-teal-600" />
              {{ templatePending ? 'Downloading...' : 'Download Template' }}
            </button>
          </div>

          <div class="space-y-6 p-6">
            <p class="text-sm text-slate-600">
              The import Excel file contains 3 sheets: <strong>Shift Definitions</strong>, <strong>Staff Shifts</strong>, and <strong>Color Definitions</strong>.
              Below is an example of the expected format for each sheet.
            </p>

            <div class="space-y-3">
              <h3 class="text-sm font-semibold text-slate-800">Sheet 1: Shift Definitions</h3>
              <div class="overflow-x-auto rounded-lg border border-slate-200">
                <table class="min-w-full text-left text-sm text-slate-600">
                  <thead class="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th class="px-4 py-3">role_group</th>
                      <th class="px-4 py-3">code</th>
                      <th class="px-4 py-3">meaning</th>
                      <th class="px-4 py-3">start_time</th>
                      <th class="px-4 py-3">end_time</th>
                      <th class="px-4 py-3">timezone</th>
                      <th class="px-4 py-3">show</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr v-for="row in templateShiftDefinitions" :key="row.code + row.roleGroup" class="bg-white">
                      <td class="px-4 py-2.5 font-mono text-xs">{{ row.roleGroup }}</td>
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
              <div class="overflow-x-auto rounded-lg border border-slate-200">
                <table class="min-w-full text-left text-sm text-slate-600">
                  <thead class="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th class="px-4 py-3">name</th>
                      <th class="px-4 py-3">staff_id</th>
                      <th class="px-4 py-3">role_group</th>
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
                      <td class="px-4 py-2.5 font-mono text-xs">{{ row.roleGroup }}</td>
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
              <div class="overflow-x-auto rounded-lg border border-slate-200">
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

        <WorkspaceSurface :padded="false" class="overflow-hidden">
          <div class="flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <UploadCloud class="h-5 w-5 text-slate-400" />
            <h2 class="text-base font-semibold text-slate-800">Import Master Excel</h2>
          </div>

          <div class="space-y-6 p-6">
            <div class="mx-auto mb-8 flex max-w-2xl items-center">
              <div class="flex flex-1 flex-col items-center gap-2">
                <div :class="cn('flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors', stepStates.upload ? 'border-teal-500 bg-teal-50 text-teal-600' : 'border-slate-300 bg-white text-slate-400')">1</div>
                <span :class="cn('text-xs font-medium', stepStates.upload ? 'text-teal-700' : 'text-slate-500')">Upload</span>
              </div>
              <div class="-mt-6 h-px w-16 bg-slate-200"></div>
              <div class="flex flex-1 flex-col items-center gap-2">
                <div :class="cn('flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors', stepStates.mapping ? 'border-teal-500 bg-teal-50 text-teal-600' : 'border-slate-300 bg-white text-slate-400')">2</div>
                <span :class="cn('text-xs font-medium', stepStates.mapping ? 'text-teal-700' : 'text-slate-500')">Map & Validate</span>
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
                'cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-colors',
                dragActive ? 'border-teal-400 bg-teal-50/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              )"
              @dragover.prevent="dragActive = true"
              @dragleave="dragActive = false"
              @drop.prevent="handleDrop"
            >
              <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-slate-100 bg-white shadow-sm">
                <FileSpreadsheet class="h-8 w-8 text-emerald-500" />
              </div>
              <h3 class="mb-1 text-lg font-semibold text-slate-700">Click to upload or drag & drop</h3>
              <p class="mx-auto mb-6 max-w-sm text-sm text-slate-500">Support for standard .xlsx schedule formats. Dates must be in YYYY-MM-DD format.</p>
              <label for="workspace-import-file" class="inline-flex rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 cursor-pointer">
                Browse Files
              </label>
            </div>

            <div v-else-if="fileStatus === 'uploading'" class="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-12">
              <RefreshCw class="mb-4 h-8 w-8 animate-spin text-teal-500" />
              <h3 class="text-base font-semibold text-slate-700">Uploading and Parsing...</h3>
              <p class="mt-2 text-sm text-slate-500">{{ fileName }}</p>
              <div class="mt-4 h-2 w-64 overflow-hidden rounded-full bg-slate-200">
                <div class="h-full w-1/2 animate-pulse bg-teal-500"></div>
              </div>
            </div>

            <div v-else-if="fileStatus === 'mapping'" class="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-12">
              <RefreshCw class="mb-4 h-8 w-8 animate-spin text-teal-500" />
              <h3 class="text-base font-semibold text-slate-700">Validating Shift Codes...</h3>
              <p class="mt-2 text-sm text-slate-500">Checking team rules and cross-day conflicts</p>
            </div>

            <div v-else-if="fileStatus === 'error'" class="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center">
              <AlertTriangle class="mx-auto mb-3 h-8 w-8 text-rose-500" />
              <h3 class="text-base font-semibold text-rose-800">Import Preview Failed</h3>
              <p class="mt-2 text-sm text-rose-700">{{ errorMessage }}</p>
              <button class="mt-5 rounded-md border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100" @click="resetImport">
                Reset
              </button>
            </div>

            <div v-else class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div class="flex items-center justify-between border-b border-slate-100 bg-emerald-50/30 p-6">
                <div class="flex items-center gap-3">
                  <CheckCircle2 class="h-6 w-6 text-emerald-500" />
                  <div>
                    <h3 class="text-base font-semibold text-slate-800">{{ fileStatus === 'applied' ? 'Import Applied' : 'Validation Complete' }}</h3>
                    <p class="mt-0.5 text-sm text-slate-500">{{ fileName }} • {{ previewResult?.totalRecords || 0 }} records parsed</p>
                  </div>
                </div>
                <div class="text-right text-sm font-semibold text-emerald-600">
                  {{ fileStatus === 'applied' ? `${applyResult?.appliedRecords || 0} applied` : `${previewResult?.validRecords || 0} valid / ${previewResult?.invalidRecords || 0} invalid` }}
                </div>
              </div>

              <div class="flex flex-col gap-6 border-b border-slate-100 bg-slate-50 p-6 lg:flex-row">
                <div class="flex-1 rounded-lg border border-slate-200 bg-white p-4">
                  <h4 class="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <AlertTriangle class="h-4 w-4 text-amber-500" />
                    Issues Found
                  </h4>
                  <ul class="space-y-2 text-sm text-slate-700">
                    <li v-if="!previewResult?.issues?.length" class="text-slate-500">No validation issues were returned.</li>
                    <li v-for="issue in previewResult?.issues || []" :key="issue.id || `${issue.type}-${issue.description}`" class="flex items-center justify-between gap-4">
                      <span>{{ issue.description }}</span>
                      <span class="text-xs text-slate-400">{{ issue.team || issue.type || issue.date || '-' }}</span>
                    </li>
                  </ul>
                </div>
                <div class="flex-1 rounded-lg border border-slate-200 bg-white p-4">
                  <h4 class="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <CheckCircle2 class="h-4 w-4 text-emerald-500" />
                    Changes Summary
                  </h4>
                  <ul class="space-y-2 text-sm text-slate-700">
                    <li class="flex items-center justify-between">
                      <span>Total parsed records</span>
                      <span class="text-xs font-medium text-emerald-600">{{ previewResult?.totalRecords || 0 }}</span>
                    </li>
                    <li class="flex items-center justify-between">
                      <span>Valid records</span>
                      <span class="text-xs font-medium text-sky-600">{{ previewResult?.validRecords || 0 }}</span>
                    </li>
                    <li class="flex items-center justify-between">
                      <span>Invalid records</span>
                      <span class="text-xs font-medium text-amber-600">{{ previewResult?.invalidRecords || 0 }}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="flex items-center justify-end gap-3 p-6">
                <button class="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50" @click="resetImport">
                  Cancel Import
                </button>
                <button class="flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60" :disabled="fileStatus === 'applying' || fileStatus === 'applied'" @click="applyChanges">
                  {{ fileStatus === 'applying' ? 'Applying...' : fileStatus === 'applied' ? 'Applied' : 'Apply Changes' }}
                  <ChevronRight class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </WorkspaceSurface>
      </div>
    </div>
  </div>
</template>
