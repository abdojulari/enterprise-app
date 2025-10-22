<template>
  <v-card>
    <v-card-title>
      <v-icon start>mdi-robot</v-icon>
      AI Content Generator
    </v-card-title>
    <v-card-text>
      <v-form @submit.prevent="generateContent">
        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="contentType"
              :items="contentTypes"
              label="Content Type"
              variant="outlined"
            />
          </v-col>
          
          <v-col cols="12" md="6">
            <v-select
              v-model="aiProvider"
              :items="aiProviders"
              label="AI Provider"
              variant="outlined"
            />
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="topic"
              label="Topic or Category"
              placeholder="e.g., Real estate tips, Marketing strategies..."
              variant="outlined"
              :rules="[v => !!v || 'Topic is required']"
            />
          </v-col>

          <v-col cols="12" v-if="contentType === 'social-post'">
            <v-select
              v-model="platform"
              :items="['facebook', 'threads', 'both']"
              label="Target Platform"
              variant="outlined"
            />
          </v-col>

          <v-col cols="12" v-if="contentType === 'marketing'">
            <v-select
              v-model="tone"
              :items="['professional', 'casual', 'exciting']"
              label="Tone"
              variant="outlined"
            />
          </v-col>

          <v-col cols="12">
            <v-btn
              type="submit"
              color="primary"
              :loading="loading"
              block
              size="large"
            >
              <v-icon start>mdi-sparkles</v-icon>
              Generate Content
            </v-btn>
          </v-col>
        </v-row>
      </v-form>

      <!-- Generated Content Display -->
      <v-alert
        v-if="generatedContent"
        type="success"
        variant="tonal"
        class="mt-6"
      >
        <v-row>
          <v-col cols="12">
            <div class="text-subtitle-2 mb-2">Generated Content:</div>
            <div class="text-body-1">{{ generatedContent }}</div>
            <div class="text-caption text-grey mt-2">
              Provider: {{ usedProvider }} | Characters: {{ generatedContent.length }}
            </div>
          </v-col>
          <v-col cols="12">
            <v-btn
              color="primary"
              variant="outlined"
              @click="copyToClipboard"
              class="mr-2"
            >
              <v-icon start>mdi-content-copy</v-icon>
              Copy
            </v-btn>
            <v-btn
              color="primary"
              @click="useContent"
            >
              <v-icon start>mdi-check</v-icon>
              Use This Content
            </v-btn>
          </v-col>
        </v-row>
      </v-alert>

      <!-- Error Display -->
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        class="mt-6"
        dismissible
        @click:close="error = ''"
      >
        {{ error }}
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useAIContentGenerator } from '~/composables/useAIContentGenerator';
import { useNotificationStore } from '~/stores/notification';

const emit = defineEmits(['content-generated']);

const aiGenerator = useAIContentGenerator();
const notificationStore = useNotificationStore();

const loading = ref(false);
const contentType = ref('social-post');
const aiProvider = ref('auto');
const topic = ref('');
const platform = ref('facebook');
const tone = ref('professional');
const generatedContent = ref('');
const usedProvider = ref('');
const error = ref('');

const contentTypes = [
  { title: 'Social Media Post', value: 'social-post' },
  { title: 'Real Estate Tip', value: 'real-estate-tip' },
  { title: 'Marketing Copy', value: 'marketing' },
  { title: 'Custom Prompt', value: 'custom' }
];

const aiProviders = [
  { title: 'Auto (Smart Fallback)', value: 'auto' },
  { title: 'Google Gemini (Best)', value: 'gemini' },
  { title: 'Cohere', value: 'cohere' },
  { title: 'Hugging Face (Llama)', value: 'huggingface' }
];

const generateContent = async () => {
  if (!topic.value) {
    error.value = 'Please enter a topic';
    return;
  }

  loading.value = true;
  error.value = '';
  generatedContent.value = '';

  try {
    let result: any;

    // Call appropriate generation method based on content type and provider
    switch (contentType.value) {
      case 'social-post':
        if (aiProvider.value === 'auto') {
          result = await aiGenerator.generateSocialPost(topic.value, platform.value as any);
        } else {
          result = await callSpecificProvider(
            `Generate an engaging ${platform.value} post about ${topic.value}. Include hashtags.`
          );
        }
        break;

      case 'real-estate-tip':
        result = await aiGenerator.generateRealEstateTip(topic.value);
        break;

      case 'marketing':
        result = await aiGenerator.generateMarketingCopy(topic.value, tone.value as any);
        break;

      case 'custom':
        result = await callSpecificProvider(topic.value);
        break;
    }

    generatedContent.value = result.content;
    usedProvider.value = result.provider;
    
    notificationStore.success('Content generated successfully!');
  } catch (err: any) {
    error.value = err.message || 'Failed to generate content';
    notificationStore.error('Failed to generate content');
  } finally {
    loading.value = false;
  }
};

const callSpecificProvider = async (prompt: string) => {
  switch (aiProvider.value) {
    case 'gemini':
      return await aiGenerator.generateWithGemini(prompt);
    case 'cohere':
      return await aiGenerator.generateWithCohere(prompt);
    case 'huggingface':
      return await aiGenerator.generateWithHuggingFace(prompt);
    default:
      return await aiGenerator.generateContent(prompt);
  }
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(generatedContent.value);
    notificationStore.success('Copied to clipboard!');
  } catch (err) {
    notificationStore.error('Failed to copy');
  }
};

const useContent = () => {
  emit('content-generated', generatedContent.value);
  notificationStore.success('Content ready to post!');
};
</script>

