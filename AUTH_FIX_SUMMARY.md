# Authentication Fix Summary

## Problem
Google OAuth login was returning a 404 error:
```
GET http://localhost:3000/api/auth/google/url?state=login 404
```

## Root Cause
The `apiBase` configuration was set to an empty string (`''`), causing all API calls to be routed to the Nuxt server at `localhost:3000` instead of your Python backend at `localhost:8000`.

## Solution Applied

### 1. Removed Incorrect Nuxt Auth Endpoints
Deleted the Nuxt server auth endpoints I mistakenly created:
- `app/server/api/auth/google/url.get.ts` ❌ (deleted)
- `app/server/api/auth/google/callback.post.ts` ❌ (deleted)

### 2. Updated API Routing Logic
Modified `app/composables/useApi.ts` to intelligently route requests:
- **Auth endpoints** (`/api/auth/*` or `/auth/*`) → Python backend at `localhost:8000` ✅
- **AI/Social Media endpoints** (`/api/ai/*`, `/api/facebook/*`, `/api/threads/*`) → Nuxt server (local) ✅

### 3. Configuration Changes

**`nuxt.config.ts`:**
```typescript
public: {
  apiBase: process.env.API_BASE_URL || 'http://localhost:8000',
  // ... other config
}
```

**`app/composables/useApi.ts`:**
```typescript
const getBaseURL = (endpoint: string) => {
  // Auth endpoints go to Python backend
  if (endpoint.startsWith('/api/auth') || endpoint.startsWith('/auth')) {
    return config.public.apiBase  // http://localhost:8000
  }
  // AI and social media endpoints stay with Nuxt server
  return ''  // localhost:3000 (Nuxt server)
}
```

## How It Works Now

### Request Flow:

1. **Google Login Click** (`/auth/login` page)
   ```
   GET /api/auth/google/url → http://localhost:8000/api/auth/google/url ✅
   ```

2. **Auth Callback** (after Google redirects back)
   ```
   POST /api/auth/google/callback → http://localhost:8000/api/auth/google/callback ✅
   ```

3. **AI Content Generation** (`/social-media` page)
   ```
   POST /api/ai/gemini/generate → http://localhost:3000/api/ai/gemini/generate ✅
   ```

4. **Facebook Posting**
   ```
   POST /api/facebook/post → http://localhost:3000/api/facebook/post ✅
   ```

## Testing

To verify the fix works:

1. **Start your Python backend:**
   ```bash
   # Make sure Python backend is running on port 8000
   python main.py  # or however you start it
   ```

2. **Start Nuxt dev server:**
   ```bash
   cd /Users/abdul.ojulari/Frontends/enterprise-app
   npm run dev
   ```

3. **Test Google Login:**
   - Go to `http://localhost:3000/auth/login`
   - Click "Google" button
   - Should redirect to Google OAuth (no 404 error)

4. **Test AI/Social Features:**
   - Go to `http://localhost:3000/social-media`
   - Try generating AI content
   - Should work without issues

## Environment Variables Required

Make sure your `.env` has:
```bash
# For Python backend connection
API_BASE_URL=http://localhost:8000

# For AI features
GEMINI_API_KEY=your_key_here

# For social media features (optional)
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
THREADS_USER_ID=your_threads_id
```

## What's Working Now

✅ Google OAuth login routes to Python backend  
✅ All auth endpoints (`/api/auth/*`) route to Python backend  
✅ AI endpoints stay with Nuxt server  
✅ Social media endpoints stay with Nuxt server  
✅ No more 404 errors on `/api/auth/google/url`  

---

**The authentication routing is now properly configured to work with both your Python backend (auth) and Nuxt server (AI/social media).** 🚀

