<script setup>
defineProps({
  padded: { type: Boolean, default: true },
  tone: { type: String, default: 'white' },
})
</script>

<template>
  <section
    :class="[
      'rounded-2xl border shadow-sm',
      tone === 'muted' ? 'border-slate-200 bg-slate-50/80' : 'border-slate-200 bg-white',
      padded ? 'p-6' : ''
    ]"
  >
    <slot />
  </section>
</template>
