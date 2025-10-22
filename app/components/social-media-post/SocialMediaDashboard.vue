<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">Social Media Manager</h1>
      </v-col>
    </v-row>

    <!-- Authentication Status -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Facebook Connection</v-card-title>
          <v-card-text>
            <div v-if="facebookAuth.isAuthenticated.value">
              <v-alert type="success" variant="tonal">
                Connected to Facebook
              </v-alert>
              <v-btn color="error" @click="handleFacebookLogout" class="mt-4">
                Disconnect
              </v-btn>
            </div>
            <div v-else>
              <v-alert type="info" variant="tonal">
                Connect your Facebook account to post
              </v-alert>
              <v-btn color="primary" @click="handleFacebookLogin" class="mt-4" :loading="loading">
                <v-icon start>mdi-facebook</v-icon>
                Connect Facebook
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Threads Connection</v-card-title>
          <v-card-text>
            <div v-if="facebookAuth.isAuthenticated.value">
              <v-alert type="success" variant="tonal">
                Ready to post to Threads
              </v-alert>
              <p class="text-caption mt-2">
                Threads uses your Facebook authentication
              </p>
            </div>
            <div v-else>
              <v-alert type="info" variant="tonal">
                Connect Facebook to use Threads
              </v-alert>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Pages List (if authenticated) -->
    <v-row v-if="facebookAuth.isAuthenticated.value && facebookAuth.userPages.value.length > 0">
      <v-col cols="12">
        <v-card>
          <v-card-title>Your Facebook Pages</v-card-title>
          <v-list>
            <v-list-item
              v-for="page in facebookAuth.userPages.value"
              :key="page.id"
              :title="page.name"
              :subtitle="page.category"
            >
              <template #prepend>
                <v-icon>mdi-facebook</v-icon>
              </template>
              <template #append>
                <v-btn
                  size="small"
                  color="primary"
                  @click="selectPage(page)"
                >
                  Select
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- AI Content Generator (Always visible) -->
    <v-row class="mt-6">
      <v-col cols="12">
        <AIContentGenerator @content-generated="handleContentGenerated" />
      </v-col>
    </v-row>

    <!-- Posting Interface (Only when authenticated) -->
    <v-row v-if="facebookAuth.isAuthenticated.value">
      <v-col cols="12">
        <PostComposer 
          :selected-page="selectedPage"
          :initial-content="generatedContent"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useFacebookAuth } from '~/composables/useFacebookAuth';
import { useNotificationStore } from '~/stores/notification';
import AIContentGenerator from './AIContentGenerator.vue';
import PostComposer from './PostComposer.vue';

const facebookAuth = useFacebookAuth();
const notificationStore = useNotificationStore();
const loading = ref(false);
const selectedPage = ref<any>(null);
const generatedContent = ref('');

// Initialize Facebook SDK on mount (optional - only if Facebook credentials are set)
onMounted(async () => {
  const config = useRuntimeConfig();
  if (config.public.facebookAppId && config.public.facebookAppId !== 'your_facebook_app_id_here') {
    try {
      await facebookAuth.initFacebookSDK();
    } catch (error) {
      console.error('Error initializing Facebook SDK:', error);
    }
  } else {
    console.log('Facebook App ID not configured. You can still use AI content generation!');
  }
});

const handleFacebookLogin = async () => {
  loading.value = true;
  try {
    await facebookAuth.login();
    notificationStore.success('Successfully connected to Facebook!');
    
    // Fetch user's pages
    await facebookAuth.getPages();
  } catch (error: any) {
    notificationStore.error(error.message || 'Failed to connect to Facebook');
  } finally {
    loading.value = false;
  }
};

const handleFacebookLogout = async () => {
  try {
    await facebookAuth.logout();
    selectedPage.value = null;
    notificationStore.info('Disconnected from Facebook');
  } catch (error: any) {
    notificationStore.error(error.message || 'Failed to disconnect');
  }
};

const selectPage = (page: any) => {
  selectedPage.value = page;
  notificationStore.success(`Selected page: ${page.name}`);
};

const handleContentGenerated = (content: string) => {
  generatedContent.value = content;
};
</script>

