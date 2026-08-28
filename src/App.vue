<template>
  <div class="app-layout">
    <div class="language-toggle-wrap">
      <button class="language-toggle" @click="langOpen = !langOpen" :title="$t('language')">
        <img
          class="lang-toggle-flag"
          :src="currentFlag"
          alt=""
          loading="lazy"
          decoding="async"
        />
        <span>{{ currentLanguageLabel }}</span>
        <i class="fa-duotone fa-chevron-down lang-chevron" :class="{ open: langOpen }"></i>
      </button>
      <div class="language-menu" v-if="langOpen">
        <button
          v-for="lang in languages"
          :key="lang.code"
          class="language-option"
          :class="{ active: currentLanguage === lang.code }"
          @click="selectLanguage(lang.code)"
        >
          <img
            class="lang-option-flag"
            :src="flagUrl(lang.flag)"
            :alt="lang.label"
            loading="lazy"
            decoding="async"
          />
          <span class="lang-label">{{ lang.label }}</span>
          <span class="lang-name">{{ lang.code.toUpperCase() }}</span>
        </button>
      </div>
    </div>
    <div class="container">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </div>

    <!-- Global Toast Notifications Overlay -->
    <div class="toast-container">
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        :class="['toast-item', toast.type]"
      >
        <i v-if="toast.type === 'success'" class="fa-duotone fa-circle-check success-icon"></i>
        <i v-else-if="toast.type === 'error'" class="fa-duotone fa-circle-exclamation danger-icon"></i>
        <i v-else class="fa-duotone fa-circle-info info-icon"></i>
        <span>{{ toast.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { toasts } from './toast.js';
import { i18n, setLanguage } from './i18n.js';

const currentLanguage = computed(() => i18n.global.locale.value);
const langOpen = ref(false);

const languages = [
  { code: 'th', label: 'ไทย', flag: 'TH' },
  { code: 'en', label: 'English', flag: 'GB' },
  { code: 'fr', label: 'Français', flag: 'FR' },
  { code: 'ja', label: '日本語', flag: 'JP' },
  { code: 'zh', label: '中文', flag: 'CN' },
];

const currentLanguageLabel = computed(() => {
  const found = languages.find((l) => l.code === currentLanguage.value);
  return found ? found.label : i18n.global.t('english');
});

const flagUrl = (code) => `https://flagsapi.com/${code}/flat/64.png`;

const currentFlag = computed(() => {
  const found = languages.find((l) => l.code === currentLanguage.value);
  return flagUrl(found ? found.flag : 'GB');
});

const selectLanguage = (code) => {
  setLanguage(code);
  langOpen.value = false;
};
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 1.5rem 1rem 4rem;
}

.language-toggle-wrap {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 20;
}

.language-toggle {
  background: rgba(30, 41, 59, 0.9);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.45rem 0.7rem;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
}

.language-toggle:hover {
  border-color: var(--secondary);
  color: white;
}

.lang-chevron {
  font-size: 0.65rem;
  transition: transform var(--transition-fast);
}

.lang-chevron.open {
  transform: rotate(180deg);
}

.language-menu {
  position: absolute;
  top: calc(100% + 0.35rem);
  right: 0;
  background: rgba(30, 41, 59, 0.97);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.3rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 150px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.5);
}

.language-option {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 0.85rem;
  padding: 0.5rem 0.7rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-align: left;
}

.language-option:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.language-option.active {
  background: var(--primary);
  color: white;
}

.language-option .lang-label {
  flex: 1;
}

.language-option .lang-name {
  font-size: 0.7rem;
  opacity: 0.7;
}

.language-option .lang-option-flag,
.lang-toggle-flag {
  width: 1.4rem;
  height: 1.4rem;
  object-fit: cover;
  border-radius: 0.2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  flex-shrink: 0;
}

.lang-toggle-flag {
  width: 1.15rem;
  height: 1.15rem;
}

.container {
  max-width: 680px;
  width: 100%;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.4s ease;
}

.success-icon {
  color: var(--success);
}

.danger-icon {
  color: var(--danger);
}

.info-icon {
  color: var(--secondary);
}

/* Page transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
