<template>
  <div>
    <h1 class="text-h4 mb-6">Data Enrichment</h1>
    
    <!-- API Status Banner -->
    <v-alert
      v-if="apiStatus"
      :type="apiStatus.enabled ? 'success' : 'warning'"
      variant="tonal"
      class="mb-4"
    >
      <v-row align="center">
        <v-col>
          <strong>Enrichment Service:</strong> 
          {{ apiStatus.service || 'Hunter.io' }}
          <span class="ml-4">
            | Status: {{ apiStatus.enabled ? '✓ Ready' : '✗ Not Ready' }}
          </span>
          <span v-if="apiStatus.message" class="ml-4 text-caption">
            {{ apiStatus.message }}
          </span>
        </v-col>
        <v-col cols="auto">
          <v-btn
            size="small"
            variant="text"
            @click="checkApiStatus"
            :loading="statusLoading"
          >
            Refresh
          </v-btn>
        </v-col>
      </v-row>
    </v-alert>

    <v-row>
      <!-- Find Email Card -->
      <v-col cols="12" md="4">
        <v-card class="mb-6" variant="outlined" >
          <v-card-title>Find Email</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleFindEmail">
              <v-text-field
                v-model="findEmailForm.first_name"
                label="First Name"
                placeholder="John"
                :rules="[v => !!v || 'First name is required']"
                variant="outlined"
                density="compact"
                class="mb-3"
                
              />
              <v-text-field
                v-model="findEmailForm.last_name"
                label="Last Name"
                placeholder="Doe"
                :rules="[v => !!v || 'Last name is required']"
                variant="outlined"
                density="compact"
                class="mb-3"
              />
              <v-text-field
                v-model="findEmailForm.domain"
                label="Domain"
                placeholder="company.com"
                :rules="[v => !!v || 'Domain is required']"
                variant="outlined"
                density="compact"
                class="mb-3"
              />
              <v-btn
                color="primary"
                :loading="findingEmail"
                @click="handleFindEmail"
                block
              >
                <v-icon left>mdi-email-search</v-icon>
                Find Email
              </v-btn>
            </v-form>

            <v-expand-transition>
              <div v-if="foundEmail" class="mt-4">
                <v-divider class="mb-4" />
                <h3 class="text-h6 mb-3">Found Email</h3>
                <v-list density="compact">
                  <v-list-item>
                    <v-list-item-title>Email</v-list-item-title>
                    <template #append>
                      <span class="text-medium-emphasis">{{ foundEmail.email }}</span>
                      <v-btn
                        icon="mdi-content-copy"
                        variant="text"
                        size="x-small"
                        @click="copyToClipboard(foundEmail.email)"
                        class="ml-2"
                      />
                    </template>
                  </v-list-item>
                  <v-list-item v-if="foundEmail.confidence">
                    <v-list-item-title>Confidence</v-list-item-title>
                    <template #append>
                      <v-progress-linear
                        :model-value="foundEmail.confidence"
                        color="success"
                        height="20"
                        class="mr-2"
                        style="width: 100px;"
                      >
                        <template #default>
                          <span class="text-caption">{{ foundEmail.confidence }}%</span>
                        </template>
                      </v-progress-linear>
                    </template>
                  </v-list-item>
                  <v-list-item v-if="foundEmail.company">
                    <v-list-item-title>Company</v-list-item-title>
                    <template #append>
                      <span class="text-medium-emphasis">{{ foundEmail.company }}</span>
                    </template>
                  </v-list-item>
                  <v-list-item v-if="foundEmail.position">
                    <v-list-item-title>Position</v-list-item-title>
                    <template #append>
                      <span class="text-medium-emphasis">{{ foundEmail.position }}</span>
                    </template>
                  </v-list-item>
                </v-list>
              </div>
            </v-expand-transition>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Domain Search Card -->
      <v-col cols="12" md="4">
        <v-card class="mb-6 " flat >
          <v-card-title>Domain Search</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleDomainSearch">
              <v-text-field
                v-model="domain"
                label="Enter domain"
                placeholder="example.com"
                :rules="[v => !!v || 'Domain is required']"
                :error-messages="domainError"
                variant="outlined"
                density="compact"
                class="mb-3"
              />
              <v-text-field
                v-model.number="domainLimit"
                label="Limit"
                type="number"
                placeholder="10"
                variant="outlined"
                density="compact"
                class="mb-3"
              />
              <v-btn
                color="primary"
                :loading="domainSearching"
                @click="handleDomainSearch"
                block
              >
                <v-icon left>mdi-domain</v-icon>
                Search
              </v-btn>
            </v-form>

            <v-expand-transition>
              <div v-if="domainResults && domainResults.length > 0" class="mt-4">
                <v-divider class="mb-4" />
                <h3 class="text-h6 mb-3">Results ({{ domainResults.length }})</h3>
                <v-list density="compact" max-height="300" class="overflow-y-auto">
                  <v-list-item v-for="(result, index) in domainResults" :key="index">
                    <v-list-item-title>{{ result.email }}</v-list-item-title>
                    <v-list-item-subtitle v-if="result.first_name || result.last_name">
                      {{ result.first_name }} {{ result.last_name }}
                    </v-list-item-subtitle>
                    <template #append>
                      <v-btn
                        icon="mdi-content-copy"
                        variant="text"
                        size="x-small"
                        @click="copyToClipboard(result.email)"
                      />
                    </template>
                  </v-list-item>
                </v-list>
              </div>
            </v-expand-transition>
          </v-card-text>
        </v-card>
      </v-col>
      
      <!-- Email Verification Card -->
      <v-col cols="12" md="4">
        <v-card class="mb-6 bg-glass-card" flat >
          <v-card-title>Email Verification</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleEmailVerification">
              <v-text-field
                v-model="email"
                label="Enter email"
                placeholder="user@example.com"
                :rules="[
                  v => !!v || 'Email is required',
                  v => /.+@.+\..+/.test(v) || 'Email must be valid'
                ]"
                :error-messages="emailError"
                variant="outlined"
                density="compact"
                class="mb-3"
              />
              <v-btn
                color="primary"
                :loading="emailVerifying"
                @click="handleEmailVerification"
                block
              >
                <v-icon left>mdi-check-circle</v-icon>
                Verify
              </v-btn>
            </v-form>

            <v-expand-transition>
              <div v-if="emailResults" class="mt-4">
                <v-divider class="mb-4" />
                <h3 class="text-h6 mb-3">Verification Results</h3>
                <v-list density="compact">
                  <v-list-item v-for="(value, key) in emailResults" :key="key">
                    <v-list-item-title class="text-capitalize">{{ key }}</v-list-item-title>
                    <template #append>
                      <v-chip
                        :color="value === true ? 'success' : value === false ? 'error' : 'primary'"
                        size="small"
                      >
                        {{ value === true ? 'Yes' : value === false ? 'No' : value }}
                      </v-chip>
                    </template>
                  </v-list-item>
                </v-list>
              </div>
            </v-expand-transition>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useEmailAutomation, type EmailResult } from '~/composables/useEmailAutomation'
import { useNotificationStore } from '~/stores/notification'

definePageMeta({
  middleware: 'auth'
})

const { 
  findEmail, 
  searchDomain, 
  verifyEmail, 
  getEnrichmentStatus 
} = useEmailAutomation()

const notificationStore = useNotificationStore()

// API Status
const apiStatus = ref<{ enabled: boolean; service: string; message: string } | null>(null)
const statusLoading = ref(false)

// Find Email
const findEmailForm = reactive({
  first_name: '',
  last_name: '',
  domain: ''
})
const findingEmail = ref(false)
const foundEmail = ref<EmailResult | null>(null)

// Domain Search
const domain = ref('')
const domainLimit = ref(10)
const domainSearching = ref(false)
const domainError = ref('')
const domainResults = ref<EmailResult[]>([])

// Email Verification
const email = ref('')
const emailVerifying = ref(false)
const emailError = ref('')
const emailResults = ref<any>(null)

onMounted(() => {
  checkApiStatus()
})

const checkApiStatus = async () => {
  try {
    statusLoading.value = true
    apiStatus.value = await getEnrichmentStatus()
  } catch (error: any) {
    console.error('Failed to check API status:', error)
    apiStatus.value = { enabled: false, service: 'Unknown', message: 'Connection failed' }
  } finally {
    statusLoading.value = false
  }
}

const handleFindEmail = async () => {
  if (!findEmailForm.first_name || !findEmailForm.last_name || !findEmailForm.domain) {
    notificationStore.error('Please fill in all fields')
    return
  }

  try {
    findingEmail.value = true
    foundEmail.value = null

    foundEmail.value = await findEmail({
      first_name: findEmailForm.first_name,
      last_name: findEmailForm.last_name,
      domain: findEmailForm.domain
    })

    notificationStore.success('Email found successfully')
    checkApiStatus() // Refresh API status
  } catch (error: any) {
    console.error('Find email failed:', error)
    notificationStore.error(error.message || 'Failed to find email')
  } finally {
    findingEmail.value = false
  }
}

const handleDomainSearch = async () => {
  if (!domain.value) {
    domainError.value = 'Domain is required'
    return
  }

  try {
    domainSearching.value = true
    domainError.value = ''
    domainResults.value = []

    const results = await searchDomain({
      domain: domain.value,
      limit: domainLimit.value || 10
    })

    domainResults.value = results
    notificationStore.success(`Found ${results.length} emails`)
    checkApiStatus() // Refresh API status
  } catch (error: any) {
    console.error('Domain search failed:', error)
    domainError.value = 'Domain search failed'
    notificationStore.error(error.message || 'Domain search failed')
  } finally {
    domainSearching.value = false
  }
}

const handleEmailVerification = async () => {
  if (!email.value || !/.+@.+\..+/.test(email.value)) {
    emailError.value = 'Valid email is required'
    return
  }

  try {
    emailVerifying.value = true
    emailError.value = ''
    emailResults.value = null

    const results = await verifyEmail({ email: email.value })
    emailResults.value = results
    notificationStore.success('Email verification completed')
    checkApiStatus() // Refresh API status
  } catch (error: any) {
    console.error('Email verification failed:', error)
    emailError.value = 'Email verification failed'
    notificationStore.error(error.message || 'Email verification failed')
  } finally {
    emailVerifying.value = false
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    notificationStore.success('Copied to clipboard')
  } catch (error) {
    console.error('Failed to copy:', error)
    notificationStore.error('Failed to copy to clipboard')
  }
}
</script>