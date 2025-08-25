<template>
  <VContainer class="fill-height d-flex align-center justify-center">
    <VRow justify="center" align="center">
      <VCol cols="12" sm="8" md="6" class="text-center">
        <VIcon
          :icon="errorIcon"
          size="120"
          :color="errorColor"
          class="mb-6 opacity-60"
        />
        
        <h1 class="enterprise-title mb-4">
          {{ errorTitle }}
        </h1>
        
        <p class="enterprise-subtitle mb-6">
          {{ error.message || 'Something went wrong. Please try again later.' }}
        </p>
        
        <div class="d-flex flex-wrap justify-center gap-4">
          <VBtn
            color="primary"
            size="large"
            prepend-icon="mdi-arrow-left"
            @click="handleGoBack"
          >
            Go Back
          </VBtn>
          
          <VBtn
            variant="outlined"
            size="large"
            prepend-icon="mdi-home"
            @click="handleGoHome"
          >
            Home
          </VBtn>
        </div>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
// Props interface
interface ErrorProps {
  statusCode: number
  statusMessage: string  
  message?: string
}

const props = defineProps<{
  error: ErrorProps
}>()

// Computed properties
const errorIcon = computed(() => {
  switch (props.error.statusCode) {
    case 404:
      return 'mdi-compass-off'
    case 403:
      return 'mdi-shield-lock'
    case 500:
      return 'mdi-server-network-off'
    default:
      return 'mdi-alert-circle'
  }
})

const errorColor = computed(() => {
  switch (props.error.statusCode) {
    case 404:
      return 'warning'
    case 403:
      return 'error'
    case 500:
      return 'error'
    default:
      return 'primary'
  }
})

const errorTitle = computed(() => {
  switch (props.error.statusCode) {
    case 404:
      return 'Page Not Found'
    case 403:
      return 'Access Forbidden'
    case 500:
      return 'Server Error'
    default:
      return `Error ${props.error.statusCode}`
  }
})

// Methods
const handleGoBack = () => {
  window.history.back()
}

const handleGoHome = async () => {
  await navigateTo('/')
}

// Set page title
useHead({
  title: () => `${props.error.statusCode} - ${errorTitle.value}`
})
</script>
