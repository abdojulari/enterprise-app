# Quick Start Guide - Social Media & AI Integration

## 🚀 Get Started in 5 Minutes

### Step 1: Create .env File

Create a `.env` file in the root directory (`/Users/abdul.ojulari/Frontends/enterprise-app/.env`):

```bash
# Copy this content into your .env file

# AI API Keys (Free Tier - Only 1 required)
GEMINI_API_KEY=your_gemini_api_key_here
COHERE_API_KEY=your_cohere_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# Facebook/Meta (Required for social posting)
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here

# Threads (Uses Facebook authentication)
THREADS_USER_ID=your_threads_user_id_here
```

### Step 2: Get Google Gemini API Key (Recommended - Best Free Tier)

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy and paste into `GEMINI_API_KEY`

**Benefits:**
- 60 requests per minute
- 1,500 requests per day
- No credit card required
- Best quality responses

### Step 3: Get Facebook App Credentials

1. Visit: https://developers.facebook.com/apps/
2. Click "Create App" → Choose "Business"
3. Get `App ID` and `App Secret`
4. Add Product: "Facebook Login"
5. Configure OAuth Redirect URIs:
   - Add: `http://localhost:3000` (for development)

### Step 4: Install Dependencies (If Not Already Done)

```bash
cd /Users/abdul.ojulari/Frontends/enterprise-app
npm install
```

### Step 5: Run the App

```bash
npm run dev
```

Navigate to: http://localhost:3000/social-media

## ✨ Features Available

### AI Content Generation
- Generate social media posts
- Create real estate tips
- Write marketing copy
- Multi-provider fallback (Gemini → Cohere → Hugging Face)

### Social Media Posting
- Post to Facebook Pages
- Post to Threads (No Instagram key needed!)
- Multi-platform posting
- Image support

## 📝 Optional: Additional AI Providers

### Cohere (Backup Option)
- Visit: https://dashboard.cohere.com/
- Sign up → Get API Key
- Add to `COHERE_API_KEY`
- Free: 100 calls/month

### Hugging Face (Backup Option)
- Visit: https://huggingface.co/settings/tokens
- Sign up → Create Token
- Add to `HUGGINGFACE_API_KEY`
- Free: 30,000 characters/month

## 🎯 Threads Setup (Optional)

**Important:** Threads uses Facebook's API, no Instagram key needed!

1. In your Facebook App, add "Threads API" product
2. Get Threads User ID from: https://developers.facebook.com/docs/threads
3. Add to `THREADS_USER_ID`
4. Your Threads account must be Creator or Business account

## 🔧 Troubleshooting

### "API key not configured"
- Ensure `.env` file exists in root directory
- Restart dev server after adding keys
- Check variable names match exactly

### "Failed to load Facebook SDK"
- Check internet connection
- Verify `FACEBOOK_APP_ID` is correct
- Clear browser cache

### Can't see .env file
- .env files are hidden by default
- Use: `ls -la` to see hidden files
- Make sure it's in: `/Users/abdul.ojulari/Frontends/enterprise-app/.env`

## 📚 Full Documentation

For detailed setup and advanced features, see: [README_SOCIAL_MEDIA.md](./README_SOCIAL_MEDIA.md)

## 🎉 That's It!

You're ready to:
1. Generate AI content
2. Connect Facebook
3. Post to Facebook & Threads
4. Automate your social media!

---

**Need Help?** Check the full documentation or the detailed API integration guide.

