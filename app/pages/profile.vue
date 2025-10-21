<template>
  <div>
    <h1 class="text-h4 mb-6">Profile</h1>
    
    <v-row>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text class="text-center">
            <v-avatar size="150" color="primary" class="mb-4">
              <v-img
                v-if="profile.avatar"
                :src="profile.avatar"
                :alt="profile.name"
              />
              <span v-else class="text-h2">
                {{ userInitials }}
              </span>
            </v-avatar>
            
            <h2 class="text-h5 mb-2">{{ profile.name }}</h2>
            <p class="text-body-1 text-medium-emphasis">{{ profile.email }}</p>
            
            <v-btn
              color="primary"
              variant="outlined"
              class="mt-4"
              prepend-icon="mdi-camera"
            >
              Change Photo
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="8">
        <v-card>
          <v-card-text>
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
                
                <v-col cols="12">
                  <v-text-field
                    v-model="profile.website"
                    label="Website"
                    type="url"
                  />
                </v-col>
                
                <v-col cols="12">
                  <v-text-field
                    v-model="profile.location"
                    label="Location"
                  />
                </v-col>
              </v-row>
              
              <v-divider class="my-4" />
              
              <v-row>
                <v-col cols="12">
                  <h3 class="text-h6 mb-4">Change Password</h3>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="passwords.current"
                    label="Current Password"
                    type="password"
                  />
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="passwords.new"
                    label="New Password"
                    type="password"
                  />
                </v-col>
              </v-row>
              
              <v-btn
                color="primary"
                type="submit"
                :loading="loading"
              >
                Save Changes
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useNotificationStore } from '~/stores/notification'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const loading = ref(false)

const profile = ref({
  name: authStore.user?.name || authStore.user?.email?.split('@')[0] || 'User',
  email: authStore.user?.email || '',
  bio: authStore.user?.bio || '',
  website: authStore.user?.website || '',
  location: authStore.user?.location || '',
  avatar: authStore.user?.avatar || authStore.user?.picture || null
})

// Update profile when auth store changes
onMounted(() => {
  if (authStore.user) {
    profile.value = {
      name: authStore.user.name || authStore.user.email?.split('@')[0] || 'User',
      email: authStore.user.email || '',
      bio: authStore.user.bio || '',
      website: authStore.user.website || '',
      location: authStore.user.location || '',
      avatar: authStore.user.avatar || authStore.user.picture || null
    }
  }
})

const passwords = ref({
  current: '',
  new: ''
})

const userInitials = computed(() => {
  return profile.value.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
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
</script>