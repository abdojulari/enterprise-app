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
    }
  },
  runtimeConfig: {
    // Private keys (server-side only)
    geminiApiKey: process.env.GEMINI_API_KEY,
    cohereApiKey: process.env.COHERE_API_KEY,
    huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY,
    facebookAppSecret: process.env.FACEBOOK_APP_SECRET,
    
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:8000',
      emailAutomationAPI: process.env.EMAIL_AUTOMATION_API || 'http://localhost:8000',
      facebookAppId: process.env.FACEBOOK_APP_ID,
      threadsUserId: process.env.THREADS_USER_ID
    }
  },
  
  app: {
    head: {
      script: [
        {
          src: 'https://connect.facebook.net/en_US/sdk.js',
          async: true,
          defer: true
        }
      ]
    }
  }
})