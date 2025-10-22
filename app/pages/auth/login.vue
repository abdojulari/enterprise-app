<template>
  <div class="auth-page">
    <!-- Theme Toggle Button -->
    <v-btn
      :icon="themeStore.themeIcon"
      variant="text"
      @click="themeStore.toggleTheme"
      class="theme-toggle-btn"
      color="white"
    />
    
    <VContainer class="fill-height d-flex align-center justify-center">
      <VRow justify="center" align="center" class="fill-height">
        <VCol cols="12" sm="8" md="6" lg="4" xl="3">
          <!-- Brand Header -->
          <div class="text-center mb-8">
            <VAvatar color="primary" size="64" class="mb-4">
              <VIcon icon="mdi-domain" size="32" />
            </VAvatar>
            
            <h1 class="enterprise-title mb-2">
              Welcome Back
            </h1>
            
            <p class="enterprise-subtitle">
              Sign in to your enterprise account
            </p>
          </div>

          <!-- Login Form -->
          <VCard class="enterprise-card enterprise-glass" elevation="12">
            <VCardText class="pa-6">
              <VForm
                ref="loginForm"
                v-model="formValid"
                @submit.prevent="handleLogin"
              >
                <VTextField
                  v-model="loginData.email"
                  label="Email Address"
                  type="email"
                  prepend-inner-icon="mdi-email"
                  variant="outlined"
                  :rules="emailRules"
                  :error-messages="fieldErrors.email"
                  autocomplete="email"
                  autofocus
                  class="mb-4"
                />

                <VTextField
                  v-model="loginData.password"
                  label="Password"
                  :type="showPassword ? 'text' : 'password'"
                  prepend-inner-icon="mdi-lock"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  variant="outlined"
                  :rules="passwordRules"
                  :error-messages="fieldErrors.password"
                  autocomplete="current-password"
                  class="mb-4"
                  @click:append-inner="showPassword = !showPassword"
                />

                <!-- Remember Me & Forgot Password -->
                <div class="d-flex align-center justify-space-between mb-6">
                  <VCheckbox
                    v-model="rememberMe"
                    label="Remember me"
                    density="compact"
                    hide-details
                  />
                  
                  <NuxtLink
                    to="/auth/forgot-password"
                    class="text-primary text-decoration-none"
                  >
                    Forgot password?
                  </NuxtLink>
                </div>

                <!-- Submit Button -->
                <VBtn
                  type="submit"
                  color="primary"
                  size="large"
                  block
                  :loading="loading"
                  :disabled="!formValid"
                  class="mb-4"
                >
                  Sign In
                </VBtn>

                <!-- Divider -->
                <VDivider class="my-4">
                  <span class="text-medium-emphasis text-body-2 px-2">or</span>
                </VDivider>

                <!-- Social Login -->
                <div class="d-flex gap-2">
                  <VBtn
                    variant="outlined"
                    size="large"
                    class="flex-grow-1"
                    prepend-icon="mdi-google"
                    @click="loginWithGoogle"
                  >
                    Google
                  </VBtn>
                  
                  <!-- <VBtn
                    variant="outlined"
                    size="large"
                    class="flex-grow-1"
                    prepend-icon="mdi-microsoft"
                    @click="loginWithMicrosoft"
                  >
                    Microsoft
                  </VBtn> -->
                </div>
              </VForm>
            </VCardText>
          </VCard>

          <!-- Sign Up Link -->
          <div class="text-center mt-6">
            <span class="text-medium-emphasis">Don't have an account?</span>
            <NuxtLink
              to="/auth/register"
              class="text-primary text-decoration-none ml-1 font-weight-medium"
            >
              Sign up here
            </NuxtLink>
          </div>

          <!-- Footer -->
          <div class="text-center mt-8">
            <div class="text-caption text-medium-emphasis">
              By signing in, you agree to our
              <NuxtLink to="/terms" class="text-primary text-decoration-none">
                Terms of Service
              </NuxtLink>
              and
              <NuxtLink to="/privacy" class="text-primary text-decoration-none">
                Privacy Policy
              </NuxtLink>
            </div>
          </div>
        </VCol>
      </VRow>
    </VContainer>
  </div>
</template>

<script setup lang="ts">
import type { LoginCredentials } from '~/types'
import { useThemeStore } from '~/stores/theme'

// Page meta
definePageMeta({
  title: 'Sign In',
  layout: false
})

// Pinia stores
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const themeStore = useThemeStore()

// API composable
const { get } = useApi()

// Computed from stores
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Reactive state
const loginForm = ref()
const formValid = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)

const loginData = ref<LoginCredentials>({
  email: '',
  password: ''
})

const fieldErrors = ref({
  email: '',
  password: ''
})

// Validation rules
const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid'
]

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 6 || 'Password must be at least 6 characters'
]

// Methods
const handleLogin = async () => {
  if (!formValid.value) return

  loading.value = true
  fieldErrors.value = { email: '', password: '' }

  try {
    await authStore.login(loginData.value)
    notificationStore.success('Welcome back!', 'You have been successfully signed in.')
    
    // Redirect to dashboard or intended page
    const router = useRouter()
    const route = useRoute()
    const redirect = route.query.redirect as string
    
    await router.push(redirect || '/dashboard')
  } catch (err: any) {
    console.error('Login error:', err)
    
    // Handle validation errors
    if (err.data?.errors) {
      Object.assign(fieldErrors.value, err.data.errors)
    } else {
      notificationStore.error('Sign In Failed', err.data?.message || 'Invalid email or password')
    }
  } finally {
    loading.value = false
  }
}

const loginWithGoogle = async () => {
  try {
    loading.value = true
    
    // Get Google OAuth URL from backend
    const response = await get<{ url: string }>('/api/auth/google/url', {
      state: 'login'
    })
    
    if (response.success && response.data?.url) {
      // Redirect to Google OAuth
      window.location.href = response.data.url
    } else {
      throw new Error(response.message || 'Failed to get Google OAuth URL')
    }
  } catch (err: any) {
    console.error('Google OAuth error:', err)
    notificationStore.error('OAuth Error', err.data?.message || err.message || 'Failed to initialize Google sign in')
    loading.value = false
  }
}

const loginWithMicrosoft = async () => {
  try {
    loading.value = true
    
    // Get Microsoft OAuth URL from backend
    const response = await get<{ url: string }>('/api/auth/microsoft/url', {
      state: 'login'
    })
    
    if (response.success && response.data?.url) {
      // Redirect to Microsoft OAuth
      window.location.href = response.data.url
    } else {
      throw new Error(response.message || 'Failed to get Microsoft OAuth URL')
    }
  } catch (err: any) {
    console.error('Microsoft OAuth error:', err)
    notificationStore.error('OAuth Error', err.data?.message || err.message || 'Failed to initialize Microsoft sign in')
    loading.value = false
  }
}

// Redirect if already authenticated
watch(isAuthenticated, (authenticated) => {
  if (authenticated) {
    navigateTo('/dashboard')
  }
}, { immediate: true })

// Set page title
useHead({
  title: 'Sign In'
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, 
    rgb(var(--v-theme-primary)) 0%, 
    rgb(var(--v-theme-secondary)) 100%);
  position: relative;
  overflow: hidden;
}

.auth-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  animation: float 20s ease-in-out infinite;
  pointer-events: none;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.enterprise-glass {
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Mobile adjustments */
@media (max-width: 599px) {
  .auth-page .v-card {
    margin: 0 16px;
  }
}

.theme-toggle-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
}
</style>
