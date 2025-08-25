<template>
  <div>
    <h1 class="text-h4 mb-6">Data Enrichment</h1>
    
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Domain Search</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleDomainSearch">
              <v-text-field
                v-model="domain"
                label="Enter domain"
                placeholder="example.com"
                :rules="[v => !!v || 'Domain is required']"
                :error-messages="domainError"
                @keydown.enter.prevent="handleDomainSearch"
              />
              <v-btn
                color="primary"
                :loading="domainSearching"
                @click="handleDomainSearch"
              >
                Search
              </v-btn>
            </v-form>

            <v-expand-transition>
              <div v-if="domainResults" class="mt-4">
                <v-divider class="mb-4" />
                <h3 class="text-h6 mb-3">Results</h3>
                <v-list>
                  <v-list-item v-for="(value, key) in domainResults" :key="key">
                    <v-list-item-title class="text-capitalize">{{ key }}</v-list-item-title>
                    <template #append>
                      <span class="text-medium-emphasis">{{ value }}</span>
                    </template>
                  </v-list-item>
                </v-list>
              </div>
            </v-expand-transition>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card>
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
                @keydown.enter.prevent="handleEmailVerification"
              />
              <v-btn
                color="primary"
                :loading="emailVerifying"
                @click="handleEmailVerification"
              >
                Verify
              </v-btn>
            </v-form>

            <v-expand-transition>
              <div v-if="emailResults" class="mt-4">
                <v-divider class="mb-4" />
                <h3 class="text-h6 mb-3">Verification Results</h3>
                <v-list>
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
import { ref } from 'vue'
import { useNotificationStore } from '~/stores/notification'
import { useRuntimeConfig } from '#app'

const config = useRuntimeConfig()
const notificationStore = useNotificationStore()

// Domain Search
const domain = ref('')
const domainSearching = ref(false)
const domainError = ref('')
const domainResults = ref(null)

// Email Verification
const email = ref('')
const emailVerifying = ref(false)
const emailError = ref('')
const emailResults = ref(null)

const handleDomainSearch = async () => {
  if (!domain.value) {
    domainError.value = 'Domain is required'
    return
  }

  try {
    domainSearching.value = true
    domainError.value = ''
    domainResults.value = null

    const response = await fetch(`${config.public.apiBase}/api/enrichment/domain-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ domain: domain.value })
    })

    if (!response.ok) throw new Error('Domain search failed')

    const data = await response.json()
    domainResults.value = data
    notificationStore.success('Domain search completed')
  } catch (error) {
    console.error('Domain search failed:', error)
    domainError.value = 'Domain search failed'
    notificationStore.error('Domain search failed')
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

    const response = await fetch(`${config.public.apiBase}/api/enrichment/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email.value })
    })

    if (!response.ok) throw new Error('Email verification failed')

    const data = await response.json()
    emailResults.value = data
    notificationStore.success('Email verification completed')
  } catch (error) {
    console.error('Email verification failed:', error)
    emailError.value = 'Email verification failed'
    notificationStore.error('Email verification failed')
  } finally {
    emailVerifying.value = false
  }
}
</script>