<script setup>
import { useRouter } from 'vue-router'
import { ArrowLeft, Building2 } from 'lucide-vue-next'
import SupportTeamContactForm from '../components/SupportTeamContactForm.vue'
import {
  contactInformationAvailableStaffIds,
  contactInformationPresetRoles,
} from '../data/contactInformationMock'

const router = useRouter()

function handleCancel() {
  router.push('/contact-information')
}

function handleSubmit() {
  router.push({ path: '/contact-information', query: { created: '1' } })
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

    <SupportTeamContactForm
      :available-staff-ids="contactInformationAvailableStaffIds"
      :preset-roles="contactInformationPresetRoles"
      @cancel="handleCancel"
      @submit="handleSubmit"
    />
  </section>
</template>
