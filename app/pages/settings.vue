<template>
  <div>
    <h1 class="text-h4 mb-6">Settings</h1>
    
    <v-card>
      <v-tabs v-model="activeTab">
        <v-tab value="profile">Profile</v-tab>
        <v-tab value="account">Account</v-tab>
        <v-tab value="notifications">Notifications</v-tab>
        <v-tab value="api">API</v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="activeTab">
          <!-- Profile Settings -->
          <v-window-item value="profile">
            <v-form @submit.prevent="saveProfile">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profile.name"
                    label="Name"
                    required
                  />
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profile.email"
                    label="Email"
                    type="email"
                    required
                  />
                </v-col>
                
                <v-col cols="12">
                  <v-textarea
                    v-model="profile.bio"
                    label="Bio"
                    rows="3"
                  />
                </v-col>
              </v-row>
              
              <v-btn
                color="primary"
                type="submit"
                :loading="loading"
              >
                Save Profile
              </v-btn>
            </v-form>
          </v-window-item>

          <!-- Account Settings -->
          <v-window-item value="account">
            <v-form @submit.prevent="saveAccount">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="account.company"
                    label="Company Name"
                  />
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-select
                    v-model="account.timezone"
                    :items="timezones"
                    label="Timezone"
                  />
                </v-col>
                
                <v-col cols="12">
                  <v-switch
                    v-model="account.twoFactor"
                    label="Enable Two-Factor Authentication"
                  />
                </v-col>
              </v-row>
              
              <v-btn
                color="primary"
                type="submit"
                :loading="loading"
              >
                Save Account
              </v-btn>
            </v-form>
          </v-window-item>

          <!-- Notification Settings -->
          <v-window-item value="notifications">
            <v-list>
              <v-list-item>
                <v-list-item-title>Email Notifications</v-list-item-title>
                <template #append>
                  <v-switch v-model="notifications.email" />
                </template>
              </v-list-item>
              
              <v-list-item>
                <v-list-item-title>Push Notifications</v-list-item-title>
                <template #append>
                  <v-switch v-model="notifications.push" />
                </template>
              </v-list-item>
              
              <v-list-item>
                <v-list-item-title>Campaign Reports</v-list-item-title>
                <template #append>
                  <v-switch v-model="notifications.reports" />
                </template>
              </v-list-item>
            </v-list>
            
            <v-btn
              color="primary"
              class="mt-4"
              :loading="loading"
              @click="saveNotifications"
            >
              Save Notifications
            </v-btn>
          </v-window-item>

          <!-- API Settings -->
          <v-window-item value="api">
            <v-alert
              type="info"
              class="mb-4"
            >
              Your API key is sensitive information. Never share it publicly.
            </v-alert>
            
            <v-text-field
              v-model="apiKey"
              label="API Key"
              readonly
              append-inner-icon="mdi-content-copy"
              @click:append-inner="copyApiKey"
            />
            
            <v-btn
              color="primary"
              :loading="loading"
              @click="regenerateApiKey"
            >
              Regenerate API Key
            </v-btn>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNotificationStore } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const notificationStore = useNotificationStore()
const authStore = useAuthStore()
const loading = ref(false)
const activeTab = ref('profile')

// Profile settings - populated from auth store
const profile = ref({
  name: '',
  email: '',
  bio: ''
})

// Account settings
const account = ref({
  company: '',
  timezone: 'UTC',
  twoFactor: false
})

const timezones = [
  'UTC',
  'America/New_York',
  'Europe/London',
  'Asia/Tokyo'
]

// Notification settings
const notifications = ref({
  email: true,
  push: true,
  reports: true
})

// API settings - will be fetched from backend
const apiKey = ref('')

onMounted(() => {
  // Load user data from auth store
  if (authStore.user) {
    profile.value.name = authStore.user.name || ''
    profile.value.email = authStore.user.email || ''
  }
})

const saveProfile = async () => {
  try {
    loading.value = true
    const { put } = useApi()
    await put('/user/profile', profile.value)
    notificationStore.success('Profile saved successfully')
  } catch (error) {
    notificationStore.error('Failed to save profile')
  } finally {
    loading.value = false
  }
}

const saveAccount = async () => {
  try {
    loading.value = true
    const { put } = useApi()
    await put('/user/account', account.value)
    notificationStore.success('Account settings saved successfully')
  } catch (error) {
    notificationStore.error('Failed to save account settings')
  } finally {
    loading.value = false
  }
}

const saveNotifications = async () => {
  try {
    loading.value = true
    const { put } = useApi()
    await put('/user/notifications', notifications.value)
    notificationStore.success('Notification settings saved successfully')
  } catch (error) {
    notificationStore.error('Failed to save notification settings')
  } finally {
    loading.value = false
  }
}

const copyApiKey = () => {
  navigator.clipboard.writeText(apiKey.value)
  notificationStore.success('API key copied to clipboard')
}

const regenerateApiKey = async () => {
  try {
    loading.value = true
    const { post } = useApi()
    const response = await post('/user/regenerate-api-key')
    if (response.data?.apiKey) {
      apiKey.value = response.data.apiKey
    }
    notificationStore.success('API key regenerated successfully')
  } catch (error) {
    notificationStore.error('Failed to regenerate API key')
  } finally {
    loading.value = false
  }
}
</script>