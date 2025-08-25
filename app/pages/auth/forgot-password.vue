<template>
  <div class="auth-page">
    <VContainer class="fill-height d-flex align-center justify-center">
      <VRow justify="center" align="center" class="fill-height">
        <VCol cols="12" sm="8" md="6" lg="4" xl="3">
          <VCard class="enterprise-card mx-auto" elevation="8" rounded="xl">
            <!-- Header -->
            <VCardTitle class="text-center py-8">
              <div class="d-flex flex-column align-center">
                <VIcon 
                  icon="mdi-lock-reset" 
                  size="48" 
                  color="primary" 
                  class="mb-4"
                />
                <h2 class="text-h5 font-weight-bold">
                  Reset Password
                </h2>
                <p class="text-body-2 text-medium-emphasis mt-2 text-center">
                  Enter your email address and we'll send you a reset link
                </p>
              </div>
            </VCardTitle>

            <!-- Form -->
            <VCardText class="px-8 pb-8">
              <VForm 
                v-model="formValid" 
                @submit.prevent="handleForgotPassword"
              >
                <div class="mb-4">
                  <VTextField
                    v-model="email"
                    label="Email Address"
                    type="email"
                    prepend-inner-icon="mdi-email"
                    :rules="emailRules"
                    :loading="isLoading"
                    :disabled="isLoading"
                    variant="outlined"
                    required
                    autofocus
                    class="mb-2"
                  />
                </div>

                <!-- Submit Button -->
                <VBtn
                  type="submit"
                  color="primary"
                  size="large"
                  block
                  :loading="isLoading"
                  :disabled="!formValid || !email"
                  class="mb-4"
                >
                  <VIcon icon="mdi-send" start />
                  Send Reset Link
                </VBtn>

                <!-- Success Message -->
                <VAlert
                  v-if="resetSent"
                  type="success"
                  variant="tonal"
                  class="mb-4"
                >
                  <VIcon icon="mdi-check-circle" start />
                  Reset link sent! Check your email inbox.
                </VAlert>

                <!-- Back to Login -->
                <div class="text-center">
                  <VBtn
                    to="/auth/login"
                    variant="text"
                    color="primary"
                    prepend-icon="mdi-arrow-left"
                  >
                    Back to Sign In
                  </VBtn>
                </div>
              </VForm>
            </VCardText>
          </VCard>

          <!-- Additional Links -->
          <div class="text-center mt-6">
            <p class="text-body-2 text-medium-emphasis">
              Don't have an account?
              <NuxtLink to="/auth/register" class="text-primary text-decoration-none">
                Create Account
              </NuxtLink>
            </p>
          </div>
        </VCol>
      </VRow>
    </VContainer>
  </div>
</template>

<script setup lang="ts">
// Page meta
definePageMeta({
  title: 'Forgot Password',
  layout: false
})

// Pinia stores
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

// Reactive state
const formValid = ref(false)
const email = ref('')
const isLoading = ref(false)
const resetSent = ref(false)

// Validation rules
const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid'
]

// Methods
const handleForgotPassword = async () => {
  if (!formValid.value || !email.value) return

  isLoading.value = true
  resetSent.value = false

  try {
    // Call auth store method to send reset email
    await authStore.forgotPassword(email.value)
    
    resetSent.value = true
    notificationStore.success('Reset link sent!', 'Check your email for further instructions')
    
    // Clear form after successful submission
    setTimeout(() => {
      email.value = ''
      resetSent.value = false
      formValid.value = false
    }, 3000)
    
  } catch (error: any) {
    console.error('Forgot password error:', error)
    notificationStore.error(
      'Reset Failed', 
      error?.message || 'Failed to send reset link. Please try again.'
    )
  } finally {
    isLoading.value = false
  }
}

// Head meta for SEO
useHead({
  title: 'Forgot Password',
  meta: [
    { name: 'description', content: 'Reset your Enterprise App password' },
    { name: 'robots', content: 'noindex' }
  ]
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.auth-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="40" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="80" r="1" fill="rgba(255,255,255,0.1)"/></svg>');
  pointer-events: none;
}

.enterprise-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95) !important;
}
</style>
