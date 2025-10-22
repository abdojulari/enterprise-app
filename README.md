# Enterprise App - Social Media & AI Integration

Complete social media management platform with AI-powered content generation using **100% FREE tier APIs**.

## 🚀 Quick Start (2 Minutes)

### 1. Get Google Gemini API Key (Free)
Visit: **https://makersuite.google.com/app/apikey**
- Sign in with Google
- Click "Create API Key"
- Copy your key

### 2. Update .env File
```bash
# Open the file
nano .env

# Replace this line:
GEMINI_API_KEY=your_gemini_api_key_here

# With your actual key:
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 3. Run the App
```bash
npm run dev
```

### 4. Test It!
Visit: **http://localhost:3000/social-media**

## ✨ Features

### AI Content Generation (100% Free)
- 🤖 **Google Gemini** - 60 requests/minute (Best option)
- 🤖 **Cohere** - 100 calls/month (Backup)
- 🤖 **Hugging Face** - 30K characters/month (Backup)
- 🎯 Smart fallback system
- 📝 Multiple content types

### Social Media Posting
- 📘 Post to Facebook Pages
- 🧵 Post to Threads (No Instagram key needed!)
- 🖼️ Image support
- 🎯 Multi-platform posting
- 📊 Analytics & insights

### Content Types
- Social media posts
- Real estate tips
- Marketing copy
- Custom prompts

## 📖 Documentation

- **[START_HERE.md](./START_HERE.md)** - Complete getting started guide
- **[QUICK_START.md](./QUICK_START.md)** - 5-minute setup
- **[README_SOCIAL_MEDIA.md](./README_SOCIAL_MEDIA.md)** - Detailed documentation
- **[USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)** - Code examples
- **[SETUP_SUMMARY.md](./SETUP_SUMMARY.md)** - Technical overview

## 🎯 What's Included

### Composables (Client-side)
- `useAIContentGenerator` - AI content generation
- `useFacebookAuth` - Facebook authentication & posting
- `useThreadsAPI` - Threads posting

### Server API Routes
- `/api/ai/gemini/generate` - Google Gemini
- `/api/ai/cohere/generate` - Cohere
- `/api/ai/huggingface/generate` - Hugging Face
- `/api/facebook/pages` - Get Facebook pages
- `/api/facebook/post` - Post to Facebook
- `/api/threads/create-container` - Threads step 1
- `/api/threads/publish` - Threads step 2
- `/api/threads/profile` - Get profile
- `/api/threads/insights` - Get analytics

### UI Components
- `SocialMediaDashboard.vue` - Main dashboard
- `AIContentGenerator.vue` - AI content interface
- `PostComposer.vue` - Post composition

## 🎨 Tech Stack

- **Framework**: Nuxt 3
- **UI**: Vuetify 3
- **State**: Pinia
- **AI**: Google Gemini, Cohere, Hugging Face
- **Social**: Facebook Graph API, Threads API

## 📊 Free Tier Limits

| Provider | Free Limit | Best For |
|----------|-----------|----------|
| Google Gemini | 60 req/min | Everything (recommended) |
| Cohere | 100 calls/month | Backup option |
| Hugging Face | 30K chars/month | Long content |

## 🔒 Environment Variables

```bash
# AI API Keys (Get free keys)
GEMINI_API_KEY=your_key
COHERE_API_KEY=your_key
HUGGINGFACE_API_KEY=your_key

# Facebook (Optional for social posting)
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
THREADS_USER_ID=your_threads_id
```

## 💡 Usage Examples

### Generate AI Content
```typescript
const { generateContent } = useAIContentGenerator();
const content = await generateContent('Real estate market trends');
```

### Post to Facebook
```typescript
const { postToPage } = useFacebookAuth();
await postToPage(pageId, accessToken, message, imageUrl);
```

### Post to Threads
```typescript
const { postToThreads } = useThreadsAPI();
await postToThreads(accessToken, { text: message, imageUrl });
```

## 🐛 Troubleshooting

### "API key not configured"
- Update `.env` with your actual key
- Restart dev server: `npm run dev`

### Facebook login fails
- Add `http://localhost:3000` to OAuth redirect URIs
- Verify Facebook App ID is correct

### Threads posting fails
- Ensure content is under 500 characters
- Verify Threads account is Creator/Business type
- Check Threads User ID is correct

## 🎯 Optional: Facebook & Threads Setup

Only needed if you want to post to social media:

### Facebook App
1. Visit: https://developers.facebook.com/apps/
2. Create app → Get App ID & Secret
3. Add to `.env`

### Threads
1. In Facebook App, add "Threads API"
2. Get User ID from docs
3. Add to `.env`

**Note**: Threads uses Facebook API - no Instagram key needed!

## 📱 Screenshots

### Social Media Dashboard
Navigate to `/social-media` to access:
- Connection status
- Page management
- AI content generator
- Post composer

### Features
- Real-time authentication
- Multi-platform posting
- Character limit validation
- Success/error tracking
- Beautiful Vuetify 3 UI

## 🎓 Learn More

Check the documentation folder for:
- Detailed setup guides
- Code examples
- Best practices
- API documentation
- Troubleshooting tips

## 🤝 Support

Need help?
1. Check **START_HERE.md** for quick start
2. Read **README_SOCIAL_MEDIA.md** for detailed docs
3. See **USAGE_EXAMPLES.md** for code examples

## ✅ Ready to Go!

Everything is already installed and configured. Just:
1. Add your Gemini API key
2. Run the app
3. Start generating content!

---

**Built with ❤️ using 100% free-tier APIs**

No credit card required • No paid subscriptions • Full featured
