<template>
  <div class="app-layout">
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
import { toasts } from './toast.js';
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 1.5rem 1rem 4rem;
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
