<template>
  <div>
    <SocialMediaDashboard />
  </div>
</template>

<script setup lang="ts">
import SocialMediaDashboard from '~/components/social-media-post/SocialMediaDashboard.vue';

definePageMeta({
  title: 'Social Media Manager'
});

onMounted(() => {
  console.log('Social Media Manager page loaded');
});
</script>
