import { createVuetify, type ThemeDefinition } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { defineNuxtPlugin } from 'nuxt/app'

import '@mdi/font/css/materialdesignicons.css'
// Import the Vuetify styles
import 'vuetify/styles'

// Define custom theme for enterprise look
const enterpriseTheme = {
  dark: false,
  colors: {
    primary: '#1976D2',
    secondary: '#424242',
    accent: '#82B1FF',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    'on-primary': '#FFFFFF',
    'on-secondary': '#FFFFFF',
    'on-background': '#000000',
    'on-surface': '#000000',
  },
}

const darkTheme = {
  dark: true,
  colors: {
    primary: '#2196F3',
    secondary: '#424242',
    accent: '#FF4081',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
    background: '#121212',
    surface: '#1E1E1E',
    'on-primary': '#FFFFFF',
    'on-secondary': '#FFFFFF',
    'on-background': '#FFFFFF',
    'on-surface': '#FFFFFF',
  },
}

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    ssr: true,
    components,
    directives,
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
        mdi,
      },
    },
    theme: {
      defaultTheme: 'enterpriseTheme',
      themes: {
        enterpriseTheme,
        darkTheme,
      },
      variations: {
        colors: ['primary', 'secondary'],
        lighten: 4,
        darken: 4,
      },
    },
    defaults: {
      VCard: {
        rounded: 'lg',
        elevation: 2,
      },
      VBtn: {
        rounded: 'lg',
        style: 'text-transform: none;',
      },
      VTextField: {
        rounded: 'lg',
        variant: 'outlined',
      },
      VSelect: {
        rounded: 'lg',
        variant: 'outlined',
      },
      VTextarea: {
        rounded: 'lg',
        variant: 'outlined',
      },
      VAutocomplete: {
        rounded: 'lg',
        variant: 'outlined',
      },
    },
    display: {
      mobileBreakpoint: 'sm',
      thresholds: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
  })

  app.vueApp.use(vuetify)

  // Expose Vuetify theme to window for theme store access
  if (process.client) {
    window.vuetifyTheme = vuetify.theme
  }
})
