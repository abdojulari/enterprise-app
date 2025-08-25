<template>
  <div style="padding: 20px;">
    <h1>🎉 Enterprise App is Working!</h1>
    <p>This is a test page to verify our custom pages are loading.</p>
    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3>✅ What's Working:</h3>
      <ul>
        <li>✅ Nuxt 4 routing</li>
        <li>✅ Custom pages loading</li>
        <li>✅ Vue components rendering</li>
      </ul>
    </div>
    <p>
      <strong>Next:</strong> Visit 
      <a href="/" style="color: #1976D2;">Dashboard (index.vue)</a> 
      to see the full enterprise app!
    </p>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Test Page',
  layout: false
})

useHead({
  title: 'Test - Enterprise App'
})
</script>
