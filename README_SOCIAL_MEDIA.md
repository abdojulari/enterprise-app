# Social Media & AI Integration Setup Guide

This enterprise app now includes free-tier AI content generation and social media posting capabilities for Facebook and Threads.

## 🚀 Features

### AI Content Generation (100% Free Tier)
- **Google Gemini** - 60 requests/minute (Best option)
- **Cohere** - 100 API calls/month
- **Hugging Face** - 30,000 input characters/month
- Smart fallback system (tries Gemini → Cohere → Hugging Face)

### Social Media Posting
- Post to Facebook Pages
- Post to Threads (No Instagram key needed!)
- AI-generated content
- Image support
- Multi-platform posting

## 📋 Setup Instructions

### 1. Create Environment Variables

Create a `.env` file in the root directory:

```bash
# AI API Keys (Free Tier)
GEMINI_API_KEY=your_gemini_api_key_here
COHERE_API_KEY=your_cohere_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# Facebook/Meta Configuration
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here

# Threads Configuration
THREADS_USER_ID=your_threads_user_id_here
```

### 2. Get API Keys

#### Google Gemini (Recommended - Most Generous Free Tier)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key to `GEMINI_API_KEY`

**Free Tier Limits:**
- 60 requests per minute
- 1,500 requests per day
- No credit card required

#### Cohere (Optional Backup)
1. Go to [Cohere Dashboard](https://dashboard.cohere.com/)
2. Sign up for a free account
3. Go to API Keys section
4. Copy your API key to `COHERE_API_KEY`

**Free Tier Limits:**
- 100 API calls per month
- No credit card required

#### Hugging Face (Optional Backup)
1. Go to [Hugging Face](https://huggingface.co/)
2. Sign up for a free account
3. Go to Settings → Access Tokens
4. Create a new token
5. Copy your token to `HUGGINGFACE_API_KEY`

**Free Tier Limits:**
- 30,000 input characters per month
- Access to thousands of open-source models

### 3. Facebook App Setup

#### Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Business" as app type
4. Fill in app details
5. Copy `App ID` to `FACEBOOK_APP_ID`
6. Copy `App Secret` to `FACEBOOK_APP_SECRET`

#### Configure Facebook Login
1. In your Facebook App dashboard, go to "Add Product"
2. Add "Facebook Login"
3. Go to Facebook Login → Settings
4. Add OAuth Redirect URIs:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
5. Save changes

#### Request Permissions
Add these permissions in App Review:
- `pages_manage_posts` - To post on pages
- `pages_read_engagement` - To read page insights
- `pages_show_list` - To list user's pages

### 4. Threads Setup

**Important: Threads uses Facebook's API - No separate Instagram key needed!**

#### Get Threads User ID
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Navigate to your app
3. Go to Threads API → Settings
4. Find your Threads User ID
5. Copy it to `THREADS_USER_ID`

#### Enable Threads API
1. In your Facebook App, add "Threads API" product
2. Configure settings
3. Request permissions:
   - `threads_basic` - Basic access
   - `threads_content_publish` - Publish content
   - `threads_manage_insights` - Read analytics

**Note:** Your Threads account must be a Creator or Business account.

### 5. Domain Verification (Production Only)

For production deployment:

1. Add your domain in Facebook App Settings → Basic → App Domains
2. Add your domain in Facebook Login → Settings → Valid OAuth Redirect URIs
3. Verify domain ownership if required

## 🎯 Usage

### Access the Social Media Manager

Navigate to `/social-media` in your app to access the dashboard.

### 1. Connect Facebook
- Click "Connect Facebook"
- Authorize the app
- Select permissions when prompted
- Your Facebook pages will load automatically

### 2. Generate AI Content
- Choose content type (Social Post, Real Estate Tip, Marketing Copy)
- Select AI provider (or use Auto for smart fallback)
- Enter your topic
- Click "Generate Content"
- Review and use the generated content

### 3. Post to Social Media
- Select a Facebook page (if posting to Facebook)
- Enter or paste your content
- Add an image URL (optional)
- Choose platforms (Facebook, Threads, or both)
- Click "Post"

## 🔧 API Endpoints

### AI Generation
- `POST /api/ai/gemini/generate` - Google Gemini
- `POST /api/ai/cohere/generate` - Cohere
- `POST /api/ai/huggingface/generate` - Hugging Face

### Facebook
- `POST /api/facebook/pages` - Get user's pages
- `POST /api/facebook/post` - Post to page

### Threads
- `POST /api/threads/create-container` - Create media container
- `POST /api/threads/publish` - Publish post
- `POST /api/threads/profile` - Get profile
- `POST /api/threads/insights` - Get analytics

## 🎨 Components

### Composables
- `useAIContentGenerator` - AI content generation
- `useFacebookAuth` - Facebook authentication
- `useThreadsAPI` - Threads posting

### UI Components
- `SocialMediaDashboard.vue` - Main dashboard
- `AIContentGenerator.vue` - AI content interface
- `PostComposer.vue` - Post composition interface

## 💡 Tips

### AI Provider Selection
- **Use Gemini** for most requests (60/min is generous)
- **Use Auto mode** for smart fallback if one fails
- **Cohere** is good for short-form content
- **Hugging Face** offers access to various models

### Character Limits
- **Facebook**: 2,000 characters (recommended)
- **Threads**: 500 characters (maximum)
- The app automatically enforces these limits

### Best Practices
1. Generate content with AI first
2. Review and edit generated content
3. Add relevant hashtags
4. Test with small posts first
5. Monitor your API usage

## 🐛 Troubleshooting

### "API key not configured"
- Ensure `.env` file exists in root directory
- Restart the development server after adding keys
- Check that variable names match exactly

### "User cancelled login"
- User must approve all requested permissions
- Check that Facebook App is not in Development Mode

### "Failed to post to Facebook"
- Ensure page has correct permissions
- Verify page access token is valid
- Check that app has `pages_manage_posts` permission

### "Threads post failed"
- Verify `THREADS_USER_ID` is correct
- Ensure account is Creator or Business account
- Check content doesn't exceed 500 characters
- Verify image URL is publicly accessible

### Rate Limits
- Gemini: Wait if hitting 60 requests/minute
- Cohere: Only 100 calls/month on free tier
- Hugging Face: 30,000 characters/month limit

## 🚀 Production Deployment

1. Set up environment variables on your hosting platform
2. Update Facebook App domains
3. Add production URLs to OAuth redirects
4. Enable HTTPS (required by Facebook)
5. Submit app for review to get permissions approved
6. Switch Facebook App from Development to Live mode

## 📊 Monitoring

The app includes:
- Success/failure notifications
- Post result tracking
- Character counters
- Provider fallback logging
- API usage tracking in console

## 🔒 Security Notes

- Never commit `.env` file to version control
- Keep API keys secure
- Rotate keys periodically
- Use environment variables in production
- Enable 2FA on all accounts
- Review Facebook App permissions regularly

## 📚 Additional Resources

- [Google Gemini Docs](https://ai.google.dev/docs)
- [Cohere API Docs](https://docs.cohere.com/)
- [Hugging Face Docs](https://huggingface.co/docs)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)
- [Threads API Docs](https://developers.facebook.com/docs/threads)

## ✨ Future Enhancements

Potential additions:
- Schedule posts for later
- Bulk posting
- Analytics dashboard
- Image generation with AI
- Video support
- LinkedIn integration
- X (Twitter) integration
- Content calendar
- Performance metrics

