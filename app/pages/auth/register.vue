<template>
  <div class="auth-page">
    <VContainer class="fill-height d-flex align-center justify-center">
      <VRow justify="center" align="center" class="fill-height">
        <VCol cols="12" sm="8" md="6" lg="5" xl="4">
          <!-- Brand Header -->
          <div class="text-center mb-8">
            <VAvatar color="primary" size="64" class="mb-4">
              <VIcon icon="mdi-domain" size="32" />
            </VAvatar>
            
            <h1 class="enterprise-title mb-2">
              Create Account
            </h1>
            
            <p class="enterprise-subtitle">
              Join our enterprise platform
            </p>
          </div>

          <!-- Register Form -->
          <VCard class="enterprise-card enterprise-glass" elevation="12">
            <VCardText class="pa-6">
              <VForm
                ref="registerForm"
                v-model="formValid"
                @submit.prevent="handleRegister"
              >
                <VTextField
                  v-model="registerData.name"
                  label="Full Name"
                  prepend-inner-icon="mdi-account"
                  variant="outlined"
                  :rules="nameRules"
                  :error-messages="fieldErrors.name"
                  autocomplete="name"
                  autofocus
                  class="mb-4"
                />

                <VTextField
                  v-model="registerData.email"
                  label="Email Address"
                  type="email"
                  prepend-inner-icon="mdi-email"
                  variant="outlined"
                  :rules="emailRules"
                  :error-messages="fieldErrors.email"
                  autocomplete="email"
                  class="mb-4"
                />

                <VTextField
                  v-model="registerData.password"
                  label="Password"
                  :type="showPassword ? 'text' : 'password'"
                  prepend-inner-icon="mdi-lock"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  variant="outlined"
                  :rules="passwordRules"
                  :error-messages="fieldErrors.password"
                  autocomplete="new-password"
                  class="mb-4"
                  @click:append-inner="showPassword = !showPassword"
                />

                <VTextField
                  v-model="registerData.confirmPassword"
                  label="Confirm Password"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  prepend-inner-icon="mdi-lock-check"
                  :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  variant="outlined"
                  :rules="confirmPasswordRules"
                  :error-messages="fieldErrors.confirmPassword"
                  autocomplete="new-password"
                  class="mb-4"
                  @click:append-inner="showConfirmPassword = !showConfirmPassword"
                />

                <!-- Password Strength Indicator -->
                <div class="mb-4">
                  <div class="text-caption mb-2">Password Strength:</div>
                  <VProgressLinear
                    :model-value="passwordStrength.score * 25"
                    :color="passwordStrength.color"
                    height="4"
                    rounded
                  />
                  <div class="text-caption mt-1" :class="`text-${passwordStrength.color}`">
                    {{ passwordStrength.text }}
                  </div>
                </div>

                <!-- Terms Agreement -->
                <VCheckbox
                  v-model="agreeToTerms"
                  :rules="termsRules"
                  hide-details="auto"
                  class="mb-4"
                >
                  <template #label>
                    <div class="text-body-2">
                      I agree to the
                      <NuxtLink to="/terms" class="text-primary text-decoration-none">
                        Terms of Service
                      </NuxtLink>
                      and
                      <NuxtLink to="/privacy" class="text-primary text-decoration-none">
                        Privacy Policy
                      </NuxtLink>
                    </div>
                  </template>
                </VCheckbox>

                <!-- Submit Button -->
                <VBtn
                  type="submit"
                  color="primary"
                  size="large"
                  block
                  :loading="loading"
                  :disabled="!formValid || !agreeToTerms"
                  class="mb-4"
                >
                  Create Account
                </VBtn>

                <!-- Divider -->
                <VDivider class="my-4">
                  <span class="text-medium-emphasis text-body-2 px-2">or</span>
                </VDivider>

                <!-- Social Registration -->
                <div class="d-flex gap-2">
                  <VBtn
                    variant="outlined"
                    size="large"
                    class="flex-grow-1"
                    prepend-icon="mdi-google"
                    @click="registerWithGoogle"
                  >
                    Google
                  </VBtn>
                  
                  <!-- <VBtn
                    variant="outlined"
                    size="large"
                    class="flex-grow-1"
                    prepend-icon="mdi-microsoft"
                    @click="registerWithMicrosoft"
                  >
                    Microsoft
                  </VBtn> -->
                </div>
              </VForm>
            </VCardText>
          </VCard>

          <!-- Sign In Link -->
          <div class="text-center mt-6">
            <span class="text-medium-emphasis">Already have an account?</span>
            <NuxtLink
              to="/auth/login"
              class="text-primary text-decoration-none ml-1 font-weight-medium"
            >
              Sign in here
            </NuxtLink>
          </div>
        </VCol>
      </VRow>
    </VContainer>
  </div>
</template>

<script setup lang="ts">
import type { RegisterData } from '~/types'

// Page meta
definePageMeta({
  title: 'Create Account',
  layout: false
})

// Pinia stores
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

// API composable
const { get } = useApi()

// Computed from stores
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Reactive state
const registerForm = ref()
const formValid = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const agreeToTerms = ref(false)

const registerData = ref<RegisterData>({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const fieldErrors = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// Validation rules
const nameRules = [
  (v: string) => !!v || 'Name is required',
  (v: string) => v.length >= 2 || 'Name must be at least 2 characters'
]

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid'
]

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 8 || 'Password must be at least 8 characters',
  (v: string) => /(?=.*[a-z])/.test(v) || 'Password must contain lowercase letter',
  (v: string) => /(?=.*[A-Z])/.test(v) || 'Password must contain uppercase letter',
  (v: string) => /(?=.*\d)/.test(v) || 'Password must contain number'
]

const confirmPasswordRules = [
  (v: string) => !!v || 'Please confirm your password',
  (v: string) => v === registerData.value.password || 'Passwords do not match'
]

const termsRules = [
  (v: boolean) => v || 'You must agree to the terms and conditions'
]

// Password strength calculator
const passwordStrength = computed(() => {
  const password = registerData.value.password
  if (!password) return { score: 0, text: 'Enter password', color: 'grey' }
  
  let score = 0
  if (password.length >= 8) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  
  const levels = [
    { text: 'Very Weak', color: 'error' },
    { text: 'Weak', color: 'error' },
    { text: 'Fair', color: 'warning' },
    { text: 'Good', color: 'success' },
    { text: 'Strong', color: 'success' }
  ]
  
  return { score, ...levels[score] }
})

// Methods
const handleRegister = async () => {
  if (!formValid.value || !agreeToTerms.value) return

  loading.value = true
  fieldErrors.value = { name: '', email: '', password: '', confirmPassword: '' }

  try {
    await authStore.register(registerData.value)
    notificationStore.success('Account Created!', 'Welcome to our enterprise platform.')
    
    // Redirect to dashboard
    await navigateTo('/dashboard')
  } catch (err: any) {
    console.error('Registration error:', err)
    
    // Handle validation errors
    if (err.data?.errors) {
      Object.assign(fieldErrors.value, err.data.errors)
    } else {
      notificationStore.error('Registration Failed', err.data?.message || 'Unable to create account')
    }
  } finally {
    loading.value = false
  }
}

const registerWithGoogle = async () => {
  try {
    loading.value = true
    
    // Get Google OAuth URL from backend
    const response = await get<{ url: string }>('/api/auth/google/url', {
      state: 'register'
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

const registerWithMicrosoft = async () => {
  try {
    loading.value = true
    
    // Get Microsoft OAuth URL from backend
    const response = await get<{ url: string }>('/api/auth/microsoft/url', {
      state: 'register'
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
  title: 'Create Account'
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
</style>
