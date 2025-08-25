import { defineStore } from 'pinia'

interface ThemeState {
  isDark: boolean
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    isDark: false
  }),

  getters: {
    currentTheme: (state) => state.isDark ? 'dark' : 'light',
    themeIcon: (state) => state.isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'
  },

  actions: {
    toggleTheme() {
      this.isDark = !this.isDark
    },

    setTheme(isDark: boolean) {
      this.isDark = isDark
    }
  }
})
