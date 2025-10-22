# Usage Examples - Social Media & AI Integration

This guide provides practical examples of how to use the AI content generation and social media posting features.

## 📱 Using the Social Media Dashboard

### Basic Workflow

1. Navigate to `/social-media` in your app
2. Connect Facebook account
3. Generate AI content
4. Post to Facebook and/or Threads

## 🤖 AI Content Generation Examples

### Example 1: Generate a Facebook Post

```typescript
// In your component or composable
const { generateSocialPost } = useAIContentGenerator();

const content = await generateSocialPost(
  'Benefits of smart home technology',
  'facebook'
);

console.log(content);
// Output: "🏠 Smart home technology is revolutionizing the way we live! 
// From energy savings to enhanced security, discover how automation 
// makes your home work for you. #SmartHome #HomeAutomation #Technology"
```

### Example 2: Generate a Threads Post

```typescript
const { generateSocialPost } = useAIContentGenerator();

// Threads has a 500 character limit
const content = await generateSocialPost(
  'Quick real estate tip for first-time buyers',
  'threads'
);

console.log(content);
// Output: "💡 First-time homebuyers: Get pre-approved before house hunting! 
// It shows sellers you're serious and helps you understand your budget. 
// #RealEstateTips #FirstTimeHomebuyer #HomeBuying"
```

### Example 3: Generate Real Estate Tips

```typescript
const { generateRealEstateTip } = useAIContentGenerator();

const tip = await generateRealEstateTip('home staging');

console.log(tip);
// Output: "Declutter and depersonalize your space to help buyers 
// envision themselves living there. First impressions matter!"
```

### Example 4: Generate Marketing Copy

```typescript
const { generateMarketingCopy } = useAIContentGenerator();

const copy = await generateMarketingCopy(
  'Luxury waterfront condos',
  'exciting'
);

console.log(copy);
// Output: "Wake up to breathtaking waterfront views every day! 
// Limited luxury condos available. Don't miss your dream home. 
// Schedule a tour today!"
```

### Example 5: Smart Fallback with Multiple Providers

```typescript
const { generateContent } = useAIContentGenerator();

// This will try Gemini first, then Cohere, then Hugging Face
const content = await generateContent(
  'Write a compelling tagline for a property management company'
);

console.log(content);
// Output: "Your Property. Our Priority. Excellence in Every Detail."
```

### Example 6: Use Specific AI Provider

```typescript
const { 
  generateWithGemini, 
  generateWithCohere, 
  generateWithHuggingFace 
} = useAIContentGenerator();

// Force Gemini
const geminiResult = await generateWithGemini(
  'Create a catchy headline about sustainable architecture'
);

// Force Cohere
const cohereResult = await generateWithCohere(
  'Write a bio for a real estate agent specializing in luxury homes'
);

// Force Hugging Face with specific model
const hfResult = await generateWithHuggingFace(
  'Generate 3 hashtags for a modern farmhouse listing',
  'mistralai/Mistral-7B-Instruct-v0.2'
);
```

## 📘 Facebook Integration Examples

### Example 1: Login and Get Pages

```typescript
const facebookAuth = useFacebookAuth();

// Initialize SDK
await facebookAuth.initFacebookSDK();

// Login
await facebookAuth.login();

// Get user's pages
const pages = await facebookAuth.getPages();

console.log(pages);
// Output: [
//   { id: '123', name: 'My Business Page', access_token: 'xxx' },
//   { id: '456', name: 'My Second Page', access_token: 'yyy' }
// ]
```

### Example 2: Post Text to Facebook

```typescript
const facebookAuth = useFacebookAuth();

// After login and selecting a page
const selectedPage = pages[0];

await facebookAuth.postToPage(
  selectedPage.id,
  selectedPage.access_token,
  'Check out our latest blog post about home renovation trends! 🏡 #HomeRenovation'
);
```

### Example 3: Post with Image to Facebook

```typescript
await facebookAuth.postToPage(
  selectedPage.id,
  selectedPage.access_token,
  'New listing alert! Beautiful 3-bedroom home in downtown. 🏠',
  'https://example.com/property-images/house123.jpg'
);
```

### Example 4: Check Authentication Status

```typescript
const facebookAuth = useFacebookAuth();

// Check if user is authenticated
if (facebookAuth.isAuthenticated.value) {
  console.log('User is logged in');
  console.log('Access Token:', facebookAuth.userAccessToken.value);
} else {
  console.log('User needs to login');
}
```

## 🧵 Threads Integration Examples

### Example 1: Post Text to Threads

```typescript
const threadsAPI = useThreadsAPI();
const facebookAuth = useFacebookAuth();

// After Facebook login
await threadsAPI.postToThreads(
  facebookAuth.userAccessToken.value,
  {
    text: 'Just closed another amazing deal! 🎉 Real estate never felt so good. #RealEstate #Success'
  }
);
```

### Example 2: Post with Image to Threads

```typescript
await threadsAPI.postToThreads(
  facebookAuth.userAccessToken.value,
  {
    text: 'New property on the market! DM for details 📧',
    imageUrl: 'https://example.com/property.jpg'
  }
);
```

### Example 3: Post with Link to Threads

```typescript
await threadsAPI.postToThreads(
  facebookAuth.userAccessToken.value,
  {
    text: 'Check out our latest blog post about market trends 📊',
    linkUrl: 'https://example.com/blog/market-trends-2024'
  }
);
```

### Example 4: Get Threads Profile

```typescript
const profile = await threadsAPI.getThreadsProfile(
  facebookAuth.userAccessToken.value
);

console.log(profile);
// Output: {
//   id: '123456',
//   username: 'myrealestatebusiness',
//   threads_profile_picture_url: 'https://...',
//   threads_biography: 'Your trusted real estate partner'
// }
```

### Example 5: Get Post Analytics

```typescript
const insights = await threadsAPI.getThreadsInsights(
  facebookAuth.userAccessToken.value,
  'post_id_here'
);

console.log(insights);
// Output: {
//   views: 1234,
//   likes: 56,
//   replies: 12,
//   reposts: 8,
//   quotes: 3
// }
```

## 🎯 Complete End-to-End Examples

### Example 1: Generate Content and Post to Facebook

```vue
<script setup>
const { generateSocialPost } = useAIContentGenerator();
const { postToPage } = useFacebookAuth();
const notificationStore = useNotificationStore();

const postWithAI = async (topic, selectedPage) => {
  try {
    // Generate content
    const content = await generateSocialPost(topic, 'facebook');
    
    // Post to Facebook
    await postToPage(
      selectedPage.id,
      selectedPage.access_token,
      content.content
    );
    
    notificationStore.showNotification('Posted successfully!', 'success');
  } catch (error) {
    notificationStore.showNotification('Failed to post', 'error');
  }
};

// Usage
await postWithAI('Spring real estate market update', myPage);
</script>
```

### Example 2: Post to Multiple Platforms at Once

```vue
<script setup>
const { generateContent } = useAIContentGenerator();
const { postToPage } = useFacebookAuth();
const { postToThreads } = useThreadsAPI();

const postToAll = async (topic, facebookPage, accessToken) => {
  try {
    // Generate content (under 500 chars for Threads compatibility)
    const content = await generateContent(
      `${topic}. Keep it under 450 characters with hashtags.`
    );
    
    const postText = content.content;
    
    // Post to both platforms simultaneously
    const results = await Promise.allSettled([
      postToPage(facebookPage.id, facebookPage.access_token, postText),
      postToThreads(accessToken, { text: postText })
    ]);
    
    // Check results
    results.forEach((result, index) => {
      const platform = index === 0 ? 'Facebook' : 'Threads';
      if (result.status === 'fulfilled') {
        console.log(`✅ Posted to ${platform}`);
      } else {
        console.error(`❌ Failed to post to ${platform}:`, result.reason);
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
};
</script>
```

### Example 3: Scheduled Content Generator

```typescript
// Generate and queue content for the week
const topics = [
  'Monday motivation for real estate agents',
  'Tuesday tips for first-time buyers',
  'Wednesday market insights',
  'Thursday home staging advice',
  'Friday success stories'
];

const { generateContent } = useAIContentGenerator();

const contentQueue = [];

for (const topic of topics) {
  const content = await generateContent(topic);
  contentQueue.push({
    day: topic.split(' ')[0],
    content: content.content,
    generated: new Date()
  });
  
  // Wait 1 second between requests to respect rate limits
  await new Promise(resolve => setTimeout(resolve, 1000));
}

console.log('Generated content for the week:', contentQueue);
```

### Example 4: A/B Testing with Different AI Providers

```typescript
const { 
  generateWithGemini, 
  generateWithCohere 
} = useAIContentGenerator();

const topic = 'Luxury home features that sell fast';

// Generate with different providers
const [geminiVersion, cohereVersion] = await Promise.all([
  generateWithGemini(topic),
  generateWithCohere(topic)
]);

console.log('Gemini version:', geminiVersion.content);
console.log('Cohere version:', cohereVersion.content);

// Choose the best one or post both to different platforms
```

### Example 5: Bulk Content Generation

```typescript
const { generateRealEstateTip } = useAIContentGenerator();

const categories = [
  'home staging',
  'negotiation',
  'market timing',
  'home inspection',
  'mortgage rates'
];

const tips = await Promise.all(
  categories.map(category => generateRealEstateTip(category))
);

tips.forEach((tip, index) => {
  console.log(`Tip ${index + 1} (${categories[index]}):`, tip.content);
});
```

### Example 6: Error Handling and Retry Logic

```typescript
const postWithRetry = async (content, maxRetries = 3) => {
  const { postToPage } = useFacebookAuth();
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await postToPage(page.id, page.access_token, content);
      console.log('✅ Posted successfully');
      return true;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => 
          setTimeout(resolve, 1000 * attempt)
        );
      }
    }
  }
  
  console.error('❌ Failed after all retries');
  return false;
};
```

## 🔥 Pro Tips

### 1. Character Limits
```typescript
// Always check character limits before posting
const content = generatedContent;
const MAX_FACEBOOK = 2000;
const MAX_THREADS = 500;

if (content.length > MAX_THREADS) {
  console.warn('Content too long for Threads, truncating...');
  content = content.substring(0, 497) + '...';
}
```

### 2. Rate Limiting
```typescript
// Respect API rate limits
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Gemini: 60 requests per minute
// Safe approach: 1 request per second
for (const topic of topics) {
  const content = await generateContent(topic);
  await delay(1000);
}
```

### 3. Content Caching
```typescript
// Cache generated content to avoid unnecessary API calls
const contentCache = new Map();

const getCachedContent = async (topic) => {
  if (contentCache.has(topic)) {
    return contentCache.get(topic);
  }
  
  const content = await generateContent(topic);
  contentCache.set(topic, content);
  return content;
};
```

### 4. Image Validation
```typescript
// Validate image URLs before posting
const isValidImageUrl = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && response.headers.get('content-type')?.startsWith('image/');
  } catch {
    return false;
  }
};

// Usage
if (imageUrl && await isValidImageUrl(imageUrl)) {
  await postToPage(page.id, token, message, imageUrl);
}
```

## 📊 Monitoring and Analytics

### Track Your Usage

```typescript
const usageTracker = {
  gemini: 0,
  cohere: 0,
  huggingface: 0,
  facebook: 0,
  threads: 0
};

// Wrap API calls
const trackedGenerate = async (provider) => {
  usageTracker[provider]++;
  console.log('Current usage:', usageTracker);
  // ... make actual call
};
```

## 🎓 Learning Resources

- Full setup guide: [README_SOCIAL_MEDIA.md](./README_SOCIAL_MEDIA.md)
- Quick start: [QUICK_START.md](./QUICK_START.md)
- API documentation in composables and server routes

---

**Happy posting! 🚀**

