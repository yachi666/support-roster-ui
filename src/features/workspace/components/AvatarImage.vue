<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  name: { type: String, default: '' },
  src: { type: String, default: '' },
  sizeClass: { type: String, default: 'h-8 w-8' },
  roundedClass: { type: String, default: 'rounded-full' },
  fallbackClass: {
    type: String,
    default: 'border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600 shadow-sm',
  },
  imageClass: { type: String, default: '' },
})

const imageFailed = ref(false)

const initials = computed(() => {
  return (props.name || '')
    .split(' ')
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .join('')
    .slice(0, 3)
    .toUpperCase()
})

const showImage = computed(() => Boolean(props.src) && !imageFailed.value)

watch(() => props.src, () => {
  imageFailed.value = false
})

function handleImageError() {
  imageFailed.value = true
}
</script>

<template>
  <img
    v-if="showImage"
    :src="src"
    :alt="name || 'Avatar'"
    :class="[sizeClass, roundedClass, 'object-cover object-center', imageClass]"
    @error="handleImageError"
  />
  <div
    v-else
    :class="[
      sizeClass,
      roundedClass,
      'flex items-center justify-center overflow-hidden',
      fallbackClass,
    ]"
    :aria-label="name || 'Avatar'"
  >
    {{ initials || '?' }}
  </div>
</template>