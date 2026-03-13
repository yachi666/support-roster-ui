<script setup>
import { RouterView } from 'vue-router'
import WorkspaceSidebar from '../components/WorkspaceSidebar.vue'
import WorkspaceTopbar from '../components/WorkspaceTopbar.vue'
</script>

<template>
  <div class="flex h-screen w-full overflow-hidden bg-[#f8f9fa] font-sans text-slate-900 selection:bg-teal-100">
    <WorkspaceSidebar />
    <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <WorkspaceTopbar />
      <main class="flex-1 overflow-auto bg-[#fafafa]">
        <RouterView />
      </main>
    </div>
  </div>
</template>
