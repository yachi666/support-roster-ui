<script setup>
import { AlertCircle, CheckCircle2, CircleDot, Sparkles } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import {
  formatProductUpdateDate,
  getProductUpdateModuleLabel,
  getProductUpdateTypeLabel,
} from '../data/productUpdates'

const { t } = useI18n()

const props = defineProps({
  update: {
    type: Object,
    default: null,
  },
  locale: {
    type: String,
    required: true,
  },
})

function getSectionIcon(type) {
  if (type === 'fix') {
    return AlertCircle
  }

  if (type === 'feature') {
    return Sparkles
  }

  return CheckCircle2
}
</script>

<template>
  <article v-if="props.update" class="detail" :aria-label="t('productUpdates.detailLabel')">
    <header class="detail-header">
      <div class="header-copy">
        <div class="eyebrow">
          <span class="version">{{ props.update.version }}</span>
          <span class="status">{{ props.update.status }}</span>
          <span class="importance">{{ props.update.importance }}</span>
        </div>
        <h1 class="title">{{ props.update.title }}</h1>
        <p class="summary">{{ props.update.summary }}</p>
      </div>

      <div class="date-card">
        <span class="date-label">{{ t('productUpdates.releaseDate') }}</span>
        <strong class="date-value">{{ formatProductUpdateDate(props.update.date, locale) }}</strong>
      </div>
    </header>

    <section class="impact-panel" :aria-label="t('productUpdates.impactLabel')">
      <div class="impact-copy">
        <span class="panel-label">{{ t('productUpdates.impactTitle') }}</span>
        <p class="impact-text">{{ props.update.impact }}</p>
      </div>

      <div class="tag-cloud">
        <span class="tag tag-strong">{{
          getProductUpdateTypeLabel(props.update.type, locale)
        }}</span>
        <span v-for="module in props.update.modules" :key="module" class="tag">
          {{ getProductUpdateModuleLabel(module, locale) }}
        </span>
      </div>
    </section>

    <section class="highlight-grid" :aria-label="t('productUpdates.highlightsLabel')">
      <div v-for="highlight in props.update.highlights" :key="highlight" class="highlight-card">
        <CircleDot class="highlight-icon" aria-hidden="true" />
        <span>{{ highlight }}</span>
      </div>
    </section>

    <section
      v-if="props.update.prNumbers?.length"
      class="source-strip"
      :aria-label="t('productUpdates.sourcePrs')"
    >
      <span class="panel-label">{{ t('productUpdates.sourcePrs') }}</span>
      <div class="source-list">
        <a
          v-for="prNumber in props.update.prNumbers"
          :key="prNumber"
          class="source-pill"
          :href="`https://github.com/yachi666/support-roster-ui/pull/${prNumber}`"
          target="_blank"
          rel="noreferrer"
        >
          #{{ prNumber }}
        </a>
      </div>
    </section>

    <section class="section-list" :aria-label="t('productUpdates.changesLabel')">
      <div v-for="section in props.update.sections" :key="section.title" class="change-section">
        <component :is="getSectionIcon(section.type)" class="section-icon" aria-hidden="true" />
        <div class="section-content">
          <h2 class="section-title">{{ section.title }}</h2>
          <ul class="change-list">
            <li v-for="item in section.items" :key="item" class="change-item">
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
    </section>
  </article>

  <article v-else class="detail detail-empty">{{ t('productUpdates.emptyDetail') }}</article>
</template>

<style scoped>
.detail {
  min-height: 0;
  overflow: auto;
  border: 1px solid #dbe5ec;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
}

.detail-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 190px;
  gap: 24px;
  padding: 28px;
  border-bottom: 1px solid #e7edf2;
  background: linear-gradient(135deg, rgba(15, 118, 110, 0.1), rgba(255, 255, 255, 0) 52%), #ffffff;
}

.header-copy {
  min-width: 0;
}

.eyebrow {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 14px;
}

.version {
  color: #0f766e;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  font-weight: 800;
}

.status,
.importance {
  border-radius: 999px;
  padding: 4px 9px;
  font-size: 12px;
  font-weight: 800;
}

.status {
  background: #e7f7ef;
  color: #047857;
}

.importance {
  background: #fff3dc;
  color: #a16207;
}

.title {
  margin: 0;
  color: #0f172a;
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 800;
  line-height: 1.08;
}

.summary {
  max-width: 680px;
  margin: 14px 0 0;
  color: #475569;
  font-size: 16px;
  line-height: 1.7;
}

.date-card {
  align-self: start;
  border: 1px solid #dbe5ec;
  border-radius: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.82);
}

.date-label,
.panel-label {
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.date-value {
  display: block;
  margin-top: 8px;
  color: #12202f;
  font-size: 15px;
}

.impact-panel,
.source-strip {
  display: flex;
  gap: 18px;
  align-items: center;
  justify-content: space-between;
  margin: 24px 28px 0;
  border: 1px solid #dbe5ec;
  border-radius: 8px;
  padding: 18px;
  background: #f8fbfb;
}

.impact-text {
  margin: 6px 0 0;
  color: #12202f;
  font-size: 15px;
  line-height: 1.6;
}

.tag-cloud,
.source-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.tag,
.source-pill {
  border-radius: 999px;
  padding: 6px 10px;
  background: #eef4f7;
  color: #475569;
  font-size: 13px;
  font-weight: 800;
}

.source-pill {
  background: #f5f7f9;
  color: #0f766e;
  font-family: 'IBM Plex Mono', monospace;
  text-decoration: none;
  transition:
    background 160ms ease,
    color 160ms ease;
}

.source-pill:hover {
  background: #e8f3f1;
  color: #115e59;
}

.tag-strong {
  background: #0f766e;
  color: #ffffff;
}

.highlight-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 24px 28px 0;
}

.highlight-card {
  display: flex;
  min-height: 88px;
  gap: 12px;
  align-items: flex-start;
  border: 1px solid #dbe5ec;
  border-radius: 8px;
  padding: 16px;
  background: #ffffff;
  color: #12202f;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.55;
}

.highlight-icon {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  margin-top: 2px;
  color: #0f766e;
}

.section-list {
  display: grid;
  gap: 14px;
  padding: 24px 28px 30px;
}

.change-section {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  gap: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 18px;
}

.section-icon {
  width: 22px;
  height: 22px;
  color: #0f766e;
}

.section-title {
  margin: 0 0 10px;
  color: #0f172a;
  font-size: 17px;
  font-weight: 800;
}

.change-list {
  display: grid;
  gap: 9px;
  margin: 0;
  padding-left: 18px;
}

.change-item {
  color: #475569;
  line-height: 1.65;
}

.detail-empty {
  display: grid;
  place-items: center;
  min-height: 360px;
  color: #64748b;
}

@media (max-width: 980px) {
  .detail-header,
  .highlight-grid {
    grid-template-columns: 1fr;
  }

  .impact-panel,
  .source-strip {
    align-items: flex-start;
    flex-direction: column;
  }

  .tag-cloud,
  .source-list {
    justify-content: flex-start;
  }
}

@media (max-height: 850px) and (min-width: 1081px) {
  .detail {
    box-shadow: none;
  }

  .detail-header {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 18px 24px;
  }

  .eyebrow {
    gap: 6px;
    margin-bottom: 10px;
  }

  .version {
    font-size: 12px;
  }

  .status,
  .importance {
    padding: 3px 8px;
    font-size: 11px;
  }

  .title {
    font-size: clamp(26px, 3vw, 34px);
    line-height: 1.08;
  }

  .summary {
    margin-top: 9px;
    font-size: 14px;
    line-height: 1.5;
  }

  .date-card {
    display: none;
  }

  .impact-panel,
  .source-strip {
    gap: 12px;
    margin: 14px 24px 0;
    padding: 12px 14px;
  }

  .impact-text {
    margin-top: 4px;
    font-size: 14px;
    line-height: 1.45;
  }

  .tag-cloud,
  .source-list {
    gap: 6px;
  }

  .tag,
  .source-pill {
    padding: 4px 8px;
    font-size: 12px;
  }

  .highlight-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin: 14px 24px 0;
  }

  .highlight-card {
    min-height: 0;
    gap: 8px;
    padding: 10px 12px;
    font-size: 12px;
    line-height: 1.4;
  }

  .highlight-icon {
    width: 15px;
    height: 15px;
  }

  .section-list {
    gap: 10px;
    padding: 14px 24px 20px;
  }

  .change-section {
    grid-template-columns: 24px minmax(0, 1fr);
    gap: 10px;
    padding: 12px 14px;
  }

  .section-icon {
    width: 18px;
    height: 18px;
  }

  .section-title {
    margin-bottom: 6px;
    font-size: 15px;
  }

  .change-list {
    gap: 5px;
  }

  .change-item {
    font-size: 13px;
    line-height: 1.45;
  }
}

@media (max-width: 560px) {
  .detail {
    border-radius: 7px;
    box-shadow: none;
  }

  .detail-header,
  .section-list {
    padding: 14px;
  }

  .detail-header {
    gap: 12px;
  }

  .eyebrow {
    gap: 6px;
    margin-bottom: 8px;
  }

  .version {
    font-size: 12px;
  }

  .status,
  .importance {
    padding: 3px 7px;
    font-size: 11px;
  }

  .title {
    font-size: 22px;
    line-height: 1.16;
  }

  .summary {
    margin-top: 8px;
    font-size: 14px;
    line-height: 1.5;
  }

  .date-card {
    padding: 10px;
  }

  .date-value {
    margin-top: 4px;
    font-size: 13px;
  }

  .impact-panel,
  .source-strip,
  .highlight-grid {
    margin: 10px 14px 0;
  }

  .impact-panel,
  .source-strip {
    gap: 8px;
    padding: 12px;
  }

  .impact-text {
    font-size: 13px;
    line-height: 1.45;
  }

  .highlight-grid {
    gap: 8px;
  }

  .highlight-card {
    min-height: auto;
    gap: 8px;
    padding: 10px;
    font-size: 13px;
    line-height: 1.4;
  }

  .highlight-icon {
    width: 15px;
    height: 15px;
  }

  .tag,
  .source-pill {
    padding: 4px 8px;
    font-size: 12px;
  }

  .section-list {
    gap: 10px;
    padding-top: 12px;
  }

  .change-section {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 12px;
  }

  .section-icon {
    display: none;
  }

  .section-title {
    margin-bottom: 7px;
    font-size: 15px;
  }

  .change-list {
    gap: 6px;
    padding-left: 16px;
  }

  .change-item {
    font-size: 13px;
    line-height: 1.5;
  }
}
</style>
