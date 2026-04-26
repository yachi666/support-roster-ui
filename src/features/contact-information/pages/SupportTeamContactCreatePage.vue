<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { ArrowLeft, Building2 } from 'lucide-vue-next'
import SupportTeamContactForm from '../components/SupportTeamContactForm.vue'
import { createContactInformation } from '@/api/contactInformation'
import { getApiErrorMessage } from '@/features/workspace/lib/formErrors'
import { contactInformationPresetRoles } from '../data/contactInformationOptions'

const router = useRouter()
const submitError = ref('')

function handleCancel() {
  router.push('/contact-information')
}

async function handleSubmit(payload) {
  submitError.value = ''

  try {
    await createContactInformation(payload)
    router.push({ path: '/contact-information', query: { created: '1' } })
  } catch (error) {
    submitError.value = getApiErrorMessage(error, 'Failed to save team.')
  }
}
</script>

<template>
  <section class="flex flex-1 flex-col items-center justify-start overflow-y-auto bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mb-4 flex w-full max-w-6xl items-center gap-2">
      <button
        type="button"
        aria-label="Back to contact information list"
        class="-ml-2 inline-flex rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
        @click="handleCancel"
      >
        <ArrowLeft class="h-5 w-5" />
      </button>
      <h1 class="flex items-center gap-2.5 text-xl font-semibold tracking-tight text-slate-900">
        <Building2 class="h-5 w-5 text-teal-600" />
        Add Team Contact Information
      </h1>
    </div>

    <div
      v-if="submitError"
      class="mb-4 w-full max-w-6xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
      role="alert"
      aria-live="polite"
    >
      {{ submitError }}
    </div>

    <SupportTeamContactForm
      :preset-roles="contactInformationPresetRoles"
      @cancel="handleCancel"
      @submit="handleSubmit"
    />
  </section>
</template>
