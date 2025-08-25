// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'app/',
  devtools: { enabled: false },
  modules: ['@pinia/nuxt'],
  css: ['vuetify/lib/styles/main.sass', '@mdi/font/css/materialdesignicons.min.css'],
  build: {
    transpile: ['vuetify'],
  },
  vite: {
    define: {
      'process.env.DEBUG': false,
    },
    server: {
      proxy: {
        '/api': {
          target: process.env.API_BASE_URL || 'http://localhost:8090',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    }
  },
  runtimeConfig: {
    public: {
      apiBase: '' // Empty string since we're using proxy
    }
  }
})