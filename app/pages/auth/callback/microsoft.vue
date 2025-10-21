<template>
  <div class="auth-page">
    <VContainer class="fill-height d-flex align-center justify-center">
      <VRow justify="center" align="center" class="fill-height">
        <VCol cols="12" sm="8" md="6" lg="4" xl="3" class="text-center">
          <VCard class="enterprise-card enterprise-glass pa-8" elevation="12">
            <VProgressCircular
              indeterminate
              color="primary"
              size="64"
              class="mb-4"
            />
            
            <h2 class="mb-2">{{ statusMessage }}</h2>
            <p class="text-medium-emphasis">{{ subMessage }}</p>
            
            <VAlert
              v-if="error"
              type="error"
              class="mt-4"
              variant="tonal"
            >
              {{ error }}
            </VAlert>
          </VCard>
        </VCol>
      </VRow>
    </VContainer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Microsoft Sign In',
  layout: false
})

const route = useRoute()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

// API composable
const { post } = useApi()

const statusMessage = ref('Signing in with Microsoft...')
const subMessage = ref('Please wait while we complete your sign in')
const error = ref('')

// Handle OAuth callback
onMounted(async () => {
  try {
    const code = route.query.code as string
    const errorParam = route.query.error as string
    
    if (errorParam) {
      error.value = 'OAuth authorization was denied or failed'
      statusMessage.value = 'Sign In Failed'
      subMessage.value = 'Please try again'
      
      setTimeout(() => {
        navigateTo('/auth/login')
      }, 3000)
      return
    }
    
    if (!code) {
      error.value = 'No authorization code received'
      statusMessage.value = 'Sign In Failed'
      subMessage.value = 'Please try again'
      
      setTimeout(() => {
        navigateTo('/auth/login')
      }, 3000)
      return
    }
    
    // Exchange code for token
    const response = await post<{ user: any; token: any }>(`/api/auth/microsoft/callback?code=${encodeURIComponent(code)}`)
    
    if (response.success && response.data) {
      // Update auth store
      authStore.user = response.data.user
      authStore.token = response.data.token.accessToken
      authStore.isAuthenticated = true
      
      // Store in localStorage
      if (process.client) {
        localStorage.setItem('auth_token', response.data.token.accessToken)
        localStorage.setItem('auth_user', JSON.stringify(response.data.user))
      }
      
      statusMessage.value = 'Sign In Successful!'
      subMessage.value = 'Redirecting to dashboard...'
      
      notificationStore.success('Welcome!', 'You have been signed in with Microsoft')
      
      // Redirect to dashboard
      setTimeout(() => {
        navigateTo('/dashboard')
      }, 1000)
    } else {
      throw new Error(response.message || 'Failed to sign in with Microsoft')
    }
    
  } catch (err: any) {
    console.error('Microsoft OAuth callback error:', err)
    error.value = err.data?.message || err.message || 'Failed to sign in with Microsoft'
    statusMessage.value = 'Sign In Failed'
    subMessage.value = 'Please try again'
    
    notificationStore.error('Sign In Failed', error.value)
    
    setTimeout(() => {
      navigateTo('/auth/login')
    }, 3000)
  }
})

useHead({
  title: 'Microsoft Sign In'
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
</style>

