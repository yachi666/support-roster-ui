<script setup>
import { ChevronRight } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import {
  formatProductUpdateDate,
  formatProductUpdateModuleList,
  getProductUpdateTypeLabel,
} from '../data/productUpdates'

const { t } = useI18n()

defineProps({
  groups: {
    type: Array,
    required: true,
  },
  selectedId: {
    type: String,
    default: '',
  },
  locale: {
    type: String,
    required: true,
  },
})

defineEmits(['select'])
</script>

<template>
  <aside class="updates-list" :aria-label="t('productUpdates.timelineLabel')">
    <div v-for="group in groups" :key="group.month" class="month-group">
      <div class="month-heading">{{ group.month }}</div>

      <button
        v-for="update in group.items"
        :key="update.id"
        class="update-button"
        :class="{ 'update-button-active': update.id === selectedId }"
        type="button"
        @click="$emit('select', update.id)"
      >
        <span class="timeline-dot" aria-hidden="true" />
        <span class="update-main">
          <span class="update-topline">
            <span class="version">{{ update.version }}</span>
            <span class="type-badge">{{ getProductUpdateTypeLabel(update.type, locale) }}</span>
          </span>
          <span class="update-title">{{ update.title }}</span>
          <span class="update-summary">{{ update.summary }}</span>
          <span class="update-meta">
            {{ formatProductUpdateDate(update.date, locale) }}
            <span class="meta-divider">/</span>
            {{ formatProductUpdateModuleList(update.modules, locale) }}
          </span>
        </span>
        <ChevronRight class="chevron" aria-hidden="true" />
      </button>
    </div>

    <div v-if="groups.length === 0" class="empty-state">{{ t('productUpdates.emptyList') }}</div>
  </aside>
</template>

<style scoped>
.updates-list {
  min-height: 0;
  overflow: auto;
  border: 1px solid #dbe5ec;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
}

.month-group {
  padding: 16px;
}

.month-group + .month-group {
  border-top: 1px solid #e7edf2;
}

.month-heading {
  margin-bottom: 10px;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.update-button {
  position: relative;
  display: grid;
  width: 100%;
  grid-template-columns: 12px minmax(0, 1fr) 18px;
  gap: 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 12px;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

.update-button:hover {
  border-color: #cfe1df;
  background: #f7fbfa;
}

.update-button-active {
  border-color: #0f766e;
  background: #effaf8;
}

.timeline-dot {
  width: 9px;
  height: 9px;
  margin-top: 8px;
  border: 2px solid #0f766e;
  border-radius: 999px;
  background: #ffffff;
}

.update-main {
  display: grid;
  gap: 5px;
  min-width: 0;
}

.update-topline {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.version {
  color: #0f172a;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  font-weight: 700;
}

.type-badge {
  border-radius: 999px;
  padding: 2px 7px;
  background: #e8f3f1;
  color: #0f766e;
  font-size: 12px;
  font-weight: 800;
}

.update-title {
  color: #12202f;
  font-size: 15px;
  font-weight: 800;
}

.update-summary,
.update-meta {
  color: #64748b;
  font-size: 13px;
  line-height: 1.45;
}

.meta-divider {
  color: #cbd5e1;
}

.chevron {
  align-self: center;
  width: 16px;
  height: 16px;
  color: #94a3b8;
}

.empty-state {
  padding: 24px;
  color: #64748b;
  text-align: center;
}

@media (max-height: 850px) and (min-width: 1081px) {
  .updates-list {
    box-shadow: none;
  }

  .month-group {
    padding: 12px;
  }

  .month-heading {
    margin-bottom: 8px;
  }

  .update-button {
    grid-template-columns: 10px minmax(0, 1fr) 14px;
    gap: 8px;
    padding: 9px;
  }

  .timeline-dot {
    width: 8px;
    height: 8px;
    margin-top: 7px;
  }

  .update-main {
    gap: 3px;
  }

  .version {
    font-size: 12px;
  }

  .type-badge {
    padding: 1px 6px;
    font-size: 11px;
  }

  .update-title {
    font-size: 14px;
  }

  .update-summary {
    display: -webkit-box;
    overflow: hidden;
    font-size: 12px;
    line-height: 1.35;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .update-meta {
    font-size: 12px;
    line-height: 1.3;
  }

  .chevron {
    width: 14px;
    height: 14px;
  }
}

@media (max-width: 720px) {
  .updates-list {
    border-radius: 7px;
    box-shadow: none;
  }

  .month-group {
    padding: 10px;
  }

  .month-heading {
    margin-bottom: 6px;
    font-size: 11px;
  }

  .update-button {
    grid-template-columns: 10px minmax(0, 1fr) 14px;
    gap: 8px;
    padding: 9px 8px;
  }

  .timeline-dot {
    width: 8px;
    height: 8px;
    margin-top: 7px;
  }

  .update-main {
    gap: 3px;
  }

  .version {
    font-size: 12px;
  }

  .type-badge {
    padding: 1px 6px;
    font-size: 11px;
  }

  .update-title {
    font-size: 14px;
  }

  .update-summary {
    display: -webkit-box;
    overflow: hidden;
    font-size: 12px;
    line-height: 1.35;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .update-meta {
    font-size: 12px;
    line-height: 1.3;
  }

  .chevron {
    width: 14px;
    height: 14px;
  }
}

@media (max-width: 420px) {
  .update-summary {
    -webkit-line-clamp: 1;
  }
}
</style>
