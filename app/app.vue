<template>
  <v-app :theme="currentTheme">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </v-app>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useThemeStore } from '~/stores/theme'

const themeStore = useThemeStore()

const currentTheme = computed(() => themeStore.currentTheme)

// Initialize theme on mount
onMounted(() => {
  themeStore.initializeTheme()
})
</script>