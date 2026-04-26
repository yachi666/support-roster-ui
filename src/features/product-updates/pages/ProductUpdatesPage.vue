<script setup>
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { ArrowLeft, Bot, Languages } from 'lucide-vue-next'
import { SUPPORTED_LOCALES, currentLocale, setLocale } from '@/i18n'
import ProductUpdateDetail from '../components/ProductUpdateDetail.vue'
import ProductUpdateList from '../components/ProductUpdateList.vue'
import {
  formatProductUpdateDate,
  groupProductUpdatesByMonth,
  localizeProductUpdates,
  productUpdates,
} from '../data/productUpdates'

const { t } = useI18n()
const selectedUpdateId = shallowRef(productUpdates[0]?.id || '')

const localeOptions = computed(() =>
  SUPPORTED_LOCALES.map((locale) => ({
    value: locale,
    label: locale === 'zh-CN' ? t('common.chinese') : t('common.english'),
  })),
)
const localizedUpdates = computed(() => localizeProductUpdates(productUpdates, currentLocale.value))
const groupedUpdates = computed(() =>
  groupProductUpdatesByMonth(localizedUpdates.value, currentLocale.value),
)
const selectedUpdate = computed(
  () =>
    localizedUpdates.value.find((update) => update.id === selectedUpdateId.value) ||
    localizedUpdates.value[0] ||
    null,
)

const latestUpdate = computed(() => localizedUpdates.value[0])

function handleLocaleChange(event) {
  setLocale(event.target.value)
}
</script>

<template>
  <main class="product-updates-page">
    <section class="page-shell">
      <header class="utility-bar">
        <RouterLink class="back-link" to="/workspace">
          <ArrowLeft class="bar-icon" aria-hidden="true" />
          {{ t('productUpdates.backToWorkspace') }}
        </RouterLink>

        <div class="release-status" :aria-label="t('productUpdates.currentVersion')">
          <span class="status-label">{{ t('productUpdates.currentVersion') }}</span>
          <strong class="status-version">{{ latestUpdate.version }}</strong>
          <span class="status-divider">/</span>
          <span class="status-title">{{ latestUpdate.title }}</span>
          <span class="status-date">{{
            formatProductUpdateDate(latestUpdate.date, currentLocale)
          }}</span>
        </div>

        <div class="right-tools">
          <div class="ai-note">
            <Bot class="bar-icon" aria-hidden="true" />
            {{ t('productUpdates.aiMaintained') }}
          </div>

          <label class="locale-control">
            <span class="sr-only">{{ t('locale.switcherLabel') }}</span>
            <Languages class="bar-icon" aria-hidden="true" />
            <select
              class="locale-select"
              :value="currentLocale"
              :aria-label="t('locale.switcherLabel')"
              @change="handleLocaleChange"
            >
              <option
                v-for="localeOption in localeOptions"
                :key="localeOption.value"
                :value="localeOption.value"
              >
                {{ localeOption.label }}
              </option>
            </select>
          </label>
        </div>
      </header>

      <section class="content-grid">
        <ProductUpdateList
          :groups="groupedUpdates"
          :selected-id="selectedUpdate?.id"
          :locale="currentLocale"
          @select="selectedUpdateId = $event"
        />

        <ProductUpdateDetail :update="selectedUpdate" :locale="currentLocale" />
      </section>
    </section>
  </main>
</template>

<style scoped>
.product-updates-page {
  min-height: 100vh;
  background: #f4f7f7;
  color: #12202f;
}

.page-shell {
  display: grid;
  gap: 18px;
  max-width: 1440px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 18px;
}

.back-link {
  display: inline-flex;
  width: max-content;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
}

.back-link:hover {
  color: #0f766e;
}

.utility-bar {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  border: 1px solid #d8e1e8;
  border-radius: 8px;
  padding: 12px 14px;
  background: #ffffff;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.05);
}

.bar-icon {
  width: 17px;
  height: 17px;
}

.release-status {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #475569;
  font-size: 14px;
  font-weight: 700;
}

.status-label,
.status-date {
  color: #64748b;
}

.status-version {
  color: #0f172a;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 16px;
}

.status-title {
  color: #12202f;
}

.status-divider {
  color: #cbd5e1;
}

.right-tools {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.ai-note,
.locale-control {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  color: #0f766e;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
}

.locale-control {
  height: 34px;
  border: 1px solid #d8e1e8;
  border-radius: 8px;
  padding: 0 8px;
  color: #475569;
  background: #ffffff;
}

.locale-select {
  border: 0;
  background: transparent;
  color: #12202f;
  font-size: 13px;
  font-weight: 800;
  outline: none;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(300px, 380px) minmax(0, 1fr);
  gap: 18px;
  min-height: 720px;
}

@media (max-height: 850px) and (min-width: 1081px) {
  .page-shell {
    gap: 12px;
    padding: 14px;
  }

  .utility-bar {
    padding: 9px 12px;
  }

  .content-grid {
    grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
    gap: 12px;
    min-height: calc(100vh - 94px);
  }
}

@media (max-width: 1080px) {
  .utility-bar {
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
  }

  .right-tools {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }

  .content-grid {
    grid-template-columns: 1fr;
    min-height: 0;
  }
}

@media (max-width: 720px) {
  .page-shell {
    gap: 10px;
    padding: 8px;
  }

  .utility-bar {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px 10px;
    padding: 9px 10px;
    box-shadow: none;
  }

  .back-link {
    gap: 6px;
    font-size: 13px;
  }

  .bar-icon {
    width: 15px;
    height: 15px;
  }

  .release-status {
    grid-column: 1 / -1;
    grid-row: 2;
    justify-content: flex-start;
    gap: 5px;
    font-size: 13px;
  }

  .status-label,
  .status-divider {
    display: none;
  }

  .status-version {
    font-size: 14px;
  }

  .status-title {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .status-date {
    flex-basis: 100%;
    font-size: 12px;
  }

  .right-tools {
    grid-column: 2;
    grid-row: 1;
    gap: 6px;
    justify-content: flex-end;
  }

  .ai-note {
    display: none;
  }

  .locale-control {
    height: 30px;
    gap: 4px;
    padding: 0 6px;
  }

  .locale-select {
    font-size: 12px;
  }

  .content-grid {
    gap: 10px;
  }
}
</style>
