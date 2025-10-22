<template>
  <v-card>
    <v-card-title>
      <v-icon start>mdi-pencil</v-icon>
      Compose Post
    </v-card-title>
    <v-card-text>
      <v-form @submit.prevent="handlePost">
        <v-row>
          <v-col cols="12">
            <v-textarea
              v-model="postContent"
              label="Post Content"
              placeholder="What's on your mind?"
              variant="outlined"
              rows="6"
              :rules="[v => !!v || 'Content is required']"
            >
              <template #append-inner>
                <div class="text-caption">
                  {{ postContent.length }} / {{ maxLength }}
                </div>
              </template>
            </v-textarea>
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="imageUrl"
              label="Image URL (Optional)"
              placeholder="https://example.com/image.jpg"
              variant="outlined"
            >
              <template #prepend-inner>
                <v-icon>mdi-image</v-icon>
              </template>
            </v-text-field>
          </v-col>

          <v-col cols="12">
            <v-select
              v-model="selectedPlatforms"
              :items="availablePlatforms"
              label="Post To"
              variant="outlined"
              multiple
              chips
            />
          </v-col>

          <v-col cols="12" v-if="selectedPlatforms.includes('facebook') && !props.selectedPage">
            <v-alert type="warning" variant="tonal">
              Please select a Facebook page first
            </v-alert>
          </v-col>

          <v-col cols="12">
            <v-btn
              type="submit"
              color="primary"
              :loading="posting"
              :disabled="!canPost"
              block
              size="large"
            >
              <v-icon start>mdi-send</v-icon>
              Post to {{ selectedPlatforms.join(' & ') }}
            </v-btn>
          </v-col>
        </v-row>
      </v-form>

      <!-- Post Results -->
      <v-alert
        v-if="postResults.length > 0"
        type="success"
        variant="tonal"
        class="mt-6"
      >
        <div class="text-subtitle-2 mb-2">Post Results:</div>
        <v-list density="compact">
          <v-list-item
            v-for="(result, index) in postResults"
            :key="index"
            :title="result.platform"
            :subtitle="result.message"
          >
            <template #prepend>
              <v-icon :color="result.success ? 'success' : 'error'">
                {{ result.success ? 'mdi-check-circle' : 'mdi-alert-circle' }}
              </v-icon>
            </template>
          </v-list-item>
        </v-list>
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useFacebookAuth } from '~/composables/useFacebookAuth';
import { useThreadsAPI } from '~/composables/useThreadsAPI';
import { useNotificationStore } from '~/stores/notification';

const props = defineProps<{
  selectedPage?: any;
  initialContent?: string;
}>();

const facebookAuth = useFacebookAuth();
const threadsAPI = useThreadsAPI();
const notificationStore = useNotificationStore();

const postContent = ref(props.initialContent || '');
const imageUrl = ref('');
const selectedPlatforms = ref<string[]>(['facebook']);
const posting = ref(false);
const postResults = ref<any[]>([]);

const availablePlatforms = [
  { title: 'Facebook', value: 'facebook' },
  { title: 'Threads', value: 'threads' }
];

const maxLength = computed(() => {
  if (selectedPlatforms.value.includes('threads')) {
    return 500; // Threads max
  }
  return 2000; // Facebook max
});

const canPost = computed(() => {
  if (!postContent.value) return false;
  if (postContent.value.length > maxLength.value) return false;
  if (selectedPlatforms.value.includes('facebook') && !props.selectedPage) return false;
  if (selectedPlatforms.value.length === 0) return false;
  return true;
});

watch(() => props.initialContent, (newValue) => {
  if (newValue) {
    postContent.value = newValue;
  }
});

const handlePost = async () => {
  posting.value = true;
  postResults.value = [];

  const promises = [];

  // Post to Facebook
  if (selectedPlatforms.value.includes('facebook') && props.selectedPage) {
    promises.push(
      postToFacebook()
        .then(() => ({
          success: true,
          platform: 'Facebook',
          message: `Posted to ${props.selectedPage.name}`
        }))
        .catch((error) => ({
          success: false,
          platform: 'Facebook',
          message: error.message
        }))
    );
  }

  // Post to Threads
  if (selectedPlatforms.value.includes('threads')) {
    promises.push(
      postToThreads()
        .then(() => ({
          success: true,
          platform: 'Threads',
          message: 'Posted successfully'
        }))
        .catch((error) => ({
          success: false,
          platform: 'Threads',
          message: error.message
        }))
    );
  }

  try {
    postResults.value = await Promise.all(promises);
    
    const allSuccessful = postResults.value.every(r => r.success);
    if (allSuccessful) {
      notificationStore.success('Posted successfully to all platforms!');
      // Clear form
      postContent.value = '';
      imageUrl.value = '';
    } else {
      notificationStore.warning('Some posts failed. Check results below.');
    }
  } catch (error: any) {
    notificationStore.error(error.message || 'Failed to post');
  } finally {
    posting.value = false;
  }
};

const postToFacebook = async () => {
  if (!props.selectedPage) {
    throw new Error('No page selected');
  }

  await facebookAuth.postToPage(
    props.selectedPage.id,
    props.selectedPage.access_token,
    postContent.value,
    imageUrl.value || undefined
  );
};

const postToThreads = async () => {
  if (!facebookAuth.userAccessToken.value) {
    throw new Error('Not authenticated');
  }

  await threadsAPI.postToThreads(
    facebookAuth.userAccessToken.value,
    {
      text: postContent.value,
      imageUrl: imageUrl.value || undefined
    }
  );
};
</script>

