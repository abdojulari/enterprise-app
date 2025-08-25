<template>
  <Teleport to="body">
    <v-overlay
      :model-value="isLoading"
      persistent
      class="loading-overlay"
    >
      <div class="loading-content">
        <v-progress-circular
          indeterminate
          size="64"
          width="4"
          color="primary"
        />
        
        <div class="loading-text mt-4">
          {{ loadingText }}
        </div>
      </div>
    </v-overlay>
  </Teleport>
</template>

<script setup>
// Use Pinia store for loading state
const uiStore = useUIStore()

const isLoading = computed(() => uiStore.globalLoading)
const loadingText = computed(() => uiStore.loadingText)

// Auto-hide loading on route changes
const route = useRoute()
watch(() => route.path, () => {
  uiStore.hideLoading()
})
</script>

<style scoped>
.loading-overlay {
  z-index: 10000;
  backdrop-filter: blur(2px);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.loading-text {
  font-size: 1rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.8;
}
</style>
