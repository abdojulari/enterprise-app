import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default defineNuxtPlugin(nuxtApp => {
  const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: 'enterpriseTheme',
      themes: {
        enterpriseTheme: {
          dark: false,
          colors: {
            primary: '#2196F3',
            secondary: '#424242',
            accent: '#82B1FF',
            error: '#FF5252',
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FFC107',
            background: '#FFFFFF',
            surface: '#F5F5F5',
          },
        },
        darkTheme: {
          dark: true,
          colors: {
            primary: '#2196F3',
            secondary: '#9E9E9E',
            accent: '#82B1FF',
            error: '#FF5252',
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FFC107',
            background: '#121212',
            surface: '#1E1E1E',
          },
        },
      },
    },
  })

  nuxtApp.vueApp.use(vuetify)
  
  // Make Vuetify theme available globally for the theme store
  if (process.client) {
    window.vuetifyTheme = vuetify.theme
    
    // Initialize theme after Pinia is ready
    nuxtApp.hook('app:mounted', async () => {
      try {
        const { useThemeStore } = await import('~/stores/theme')
        const themeStore = useThemeStore()
        if (themeStore && typeof themeStore.initializeTheme === 'function') {
          themeStore.initializeTheme()
        }
      } catch (error) {
        console.error('Failed to initialize theme store:', error)
      }
    })
  }
})
