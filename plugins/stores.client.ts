// Plugin to initialize stores on client side
export default defineNuxtPlugin(async () => {
  // Initialize stores that need client-side setup
  const authStore = useAuthStore()
  const themeStore = useThemeStore()
  const uiStore = useUIStore()
  
  // Initialize auth state from localStorage
  await authStore.initAuth()
  
  // Initialize theme
  themeStore.initializeTheme()
  
  // Initialize UI
  uiStore.initializeUI()
  
  // Make Vuetify theme available globally for theme store
  if (process.client) {
    await nextTick()
    
    // Get Vuetify theme instance after Vue app is mounted
    const nuxtApp = useNuxtApp()
    const vuetifyInstance = nuxtApp.vueApp.config.globalProperties.$vuetify
    
    if (vuetifyInstance?.theme) {
      window.vuetifyTheme = vuetifyInstance.theme
    }
  }
})
