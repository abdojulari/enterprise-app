<template>
  <v-app :theme="currentTheme">
    <!-- App Bar for Landing Page -->
    <v-app-bar elevation="1" color="surface">
      <v-toolbar-title class="px-4 text-h5 font-weight-bold">
        Enterprise App
      </v-toolbar-title>
      
      <v-spacer />
      
      <!-- Theme toggle -->
      <v-btn
        :icon="themeStore.themeIcon"
        variant="text"
        @click="themeStore.toggleTheme"
        class="mr-2"
      />
    </v-app-bar>
    
    <v-container fluid class="pa-0 bg-surface h-100">
      <!-- Hero Section -->
      <v-container class="py-16">
        <v-row align="center" class="flex-column-reverse flex-md-row">
          <!-- Left Column -->
          <v-col cols="12" md="5" class="text-center text-md-left">
            <h1 class="text-h2 font-weight-bold mb-6">
              Conquer
              <div class="text-primary">email marketing</div>
              your way
            </h1>
          <v-card-text class="text-subtitle-1 text-medium-emphasis px-0 mb-6">
            Become an email marketing expert with advanced tools made easy for you. Includes live 24/7 support and the latest features like landing pages & automation.
          </v-card-text>
          
          <!-- Show different buttons based on authentication status -->
          <template v-if="authStore.isAuthenticated">
            <v-btn
              color="primary"
              size="x-large"
              variant="flat"
              rounded="lg"
              class="px-8 text-capitalize"
              to="/dashboard"
            >
              Go to Dashboard
            </v-btn>
            <v-btn
              variant="outlined"
              size="x-large"
              rounded="lg"
              class="px-8 text-capitalize ml-4"
              @click="handleLogout"
            >
              Logout
            </v-btn>
          </template>
          <template v-else>
            <v-btn
              color="primary"
              size="x-large"
              variant="flat"
              rounded="lg"
              class="px-8 text-capitalize"
              to="/auth/register"
            >
              Sign up free
            </v-btn>
            <v-btn
              variant="outlined"
              size="x-large"
              rounded="lg"
              class="px-8 text-capitalize ml-4"
              to="/auth/login"
            >
              Login
            </v-btn>
          </template>
          </v-col>

        <!-- Right Column -->
        <v-col cols="12" md="7" class="position-relative">
          <!-- Background Shape -->
          <v-sheet
            color="primary-lighten-4"
            class="rounded-circle"
            width="500"
            height="500"
            style="position: absolute; right: 50px; top: 50%; transform: translateY(-50%); opacity: 0.1;"
          ></v-sheet>

          <!-- Feature Cards Stack -->
          <v-sheet class="position-relative" height="600">
            <!-- Main Image (commented out - add your image to /public/images/ folder) -->
            <!-- <v-img
              src="/images/hero-person.webp"
              class="d-none d-md-block"
              width="400"
              height="400"
              style="position: absolute; right: 100px; top: 50%; transform: translateY(-50%); z-index: 1;"
              cover
            ></v-img> -->

            <!-- Feature Cards -->
            <v-slide-y-transition group>
              <v-card
                v-for="(feature, index) in features"
                :key="feature.title"
                :style="{
                  position: 'absolute',
                  right: '0',
                  top: `${index * 120}px`,
                  zIndex: 2,
                }"
                width="300"
                rounded="lg"
                elevation="1"
                class="pa-4 feature-card"
              >
                <div class="d-flex align-center">
                  <v-icon
                    :icon="feature.icon"
                    color="primary"
                    size="24"
                    class="mr-3"
                  ></v-icon>
                  <div>
                    <div class="text-h6 font-weight-bold">{{ feature.title }}</div>
                    <div class="text-body-2 text-medium-emphasis">{{ feature.description }}</div>
                  </div>
                </div>
              </v-card>
            </v-slide-y-transition>

            <!-- Decorative Dots -->
            <v-sheet
              color="primary-lighten-3"
              class="rounded-0"
              width="150"
              height="150"
              style="position: absolute; right: -20px; bottom: -20px; opacity: 0.1; background-image: radial-gradient(currentColor 2px, transparent 2px); background-size: 15px 15px;"
            ></v-sheet>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useThemeStore } from '~/stores/theme'

// Disable default layout for landing page
definePageMeta({
  layout: false
})

const authStore = useAuthStore()
const themeStore = useThemeStore()

const currentTheme = computed(() => themeStore.currentTheme)
const themeIcon = computed(() => themeStore.themeIcon)

// Initialize theme on mount
onMounted(() => {
  themeStore.initializeTheme()
})

const handleLogout = async () => {
  try {
    // Clear localStorage first
    if (process.client) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
    
    // Reset auth store
    authStore.$reset()
    authStore.isAuthenticated = false
    authStore.user = null
    authStore.token = null
    
    // Reload page to show login buttons
    window.location.reload()
  } catch (error) {
    console.error('Logout error:', error)
    // Force reload even if there's an error
    window.location.reload()
  }
}

const features = [
  {
    icon: 'mdi-web',
    title: 'Landing pages',
    description: 'Keep growing your email list'
  },
  {
    icon: 'mdi-email-outline',
    title: 'Email campaigns',
    description: 'Send the perfect email every time'
  },
  {
    icon: 'mdi-cog-outline',
    title: 'Automations',
    description: 'Target and segment subscribers automatically'
  },
  {
    icon: 'mdi-chart-box-outline',
    title: 'Surveys',
    description: 'Gain valuable feedback'
  }
]
</script>

<style scoped>
.feature-card {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-card:hover {
  transform: translateX(-10px);
}

@media (max-width: 960px) {
  .feature-card {
    position: relative !important;
    margin-bottom: 16px;
    right: auto !important;
    top: auto !important;
  }
}
</style>