import { defineStore } from 'pinia'

interface ThemeState {
  currentTheme: 'enterpriseTheme' | 'darkTheme'
  systemPreference: boolean
  initialized: boolean
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    currentTheme: 'enterpriseTheme',
    systemPreference: false,
    initialized: false,
  }),

  getters: {
    isDark: (state) => state.currentTheme === 'darkTheme',
    isLight: (state) => state.currentTheme === 'enterpriseTheme',
    themeIcon: (state) => state.currentTheme === 'darkTheme' ? 'mdi-weather-sunny' : 'mdi-weather-night',
  },

  actions: {
    setTheme(theme: 'enterpriseTheme' | 'darkTheme') {
      this.currentTheme = theme
      this.systemPreference = false
      
      // Apply theme to Vuetify if available
      if (process.client && window.vuetifyTheme) {
        window.vuetifyTheme.global.name.value = theme
      }
      
      // Save preference
      if (process.client) {
        localStorage.setItem('theme-preference', theme)
        localStorage.setItem('system-preference', 'false')
      }
    },

    toggleTheme() {
      const newTheme = this.currentTheme === 'enterpriseTheme' ? 'darkTheme' : 'enterpriseTheme'
      this.setTheme(newTheme)
    },

    enableSystemPreference() {
      this.systemPreference = true
      
      if (process.client) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        this.currentTheme = prefersDark ? 'darkTheme' : 'enterpriseTheme'
        
        // Apply theme to Vuetify
        if (window.vuetifyTheme) {
          window.vuetifyTheme.global.name.value = this.currentTheme
        }
        
        localStorage.setItem('system-preference', 'true')
        localStorage.removeItem('theme-preference')
      }
    },

    disableSystemPreference() {
      this.systemPreference = false
      this.setTheme(this.currentTheme)
    },

    initializeTheme() {
      if (this.initialized || !process.client) return
      
      const savedTheme = localStorage.getItem('theme-preference')
      const systemPreference = localStorage.getItem('system-preference') === 'true'
      
      if (systemPreference) {
        this.enableSystemPreference()
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleSystemThemeChange = (e: MediaQueryListEvent) => {
          if (this.systemPreference) {
            this.currentTheme = e.matches ? 'darkTheme' : 'enterpriseTheme'
            if (window.vuetifyTheme) {
              window.vuetifyTheme.global.name.value = this.currentTheme
            }
          }
        }
        
        mediaQuery.addEventListener('change', handleSystemThemeChange)
      } else if (savedTheme && (savedTheme === 'enterpriseTheme' || savedTheme === 'darkTheme')) {
        this.setTheme(savedTheme)
      } else {
        // Default to system preference on first visit
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        this.setTheme(prefersDark ? 'darkTheme' : 'enterpriseTheme')
      }
      
      this.initialized = true
    },

    // Get current theme colors (requires Vuetify instance)
    getCurrentColors() {
      if (process.client && window.vuetifyTheme) {
        return window.vuetifyTheme.global.current.value.colors
      }
      return null
    },

    // Apply custom theme configuration
    applyCustomTheme(colors: Record<string, string>) {
      if (process.client && window.vuetifyTheme) {
        Object.assign(window.vuetifyTheme.global.current.value.colors, colors)
      }
    },

    // Reset to default themes
    resetThemes() {
      if (process.client) {
        localStorage.removeItem('theme-preference')
        localStorage.removeItem('system-preference')
        this.systemPreference = false
        this.currentTheme = 'enterpriseTheme'
        this.initialized = false
        this.initializeTheme()
      }
    }
  },

  // Note: Persistence will be handled by the client plugin
})

// Global type augmentation for Vuetify theme
declare global {
  interface Window {
    vuetifyTheme?: any
  }
}

