# Instagram API Integration Setup Guide

This guide will walk you through setting up dynamic Instagram post integration for your landing page.

## Prerequisites

- Instagram Business or Creator account
- Facebook Developer account (free)

## Step 1: Install Dependencies

```bash
cd landing-page
npm install zod
```

## Step 2: Create a Meta App

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Log in with your Facebook account
3. Click **"Create App"** in the top right
4. Select **"Consumer"** app type
5. Fill in app details:
   - **App Display Name**: Your Landing Page (or any name)
   - **App Contact Email**: Your email
6. Click **"Create App"**

## Step 3: Configure Instagram Basic Display API

1. In your App Dashboard, find **"Add Product"** in the left sidebar
2. Click **"Set Up"** on **Instagram Basic Display**
3. In the **Instagram Basic Display** settings:
   - Add your **Valid OAuth Redirect URIs**:
     - Development: `http://localhost:3000/api/instagram/callback`
     - Production: `https://your-domain.com/api/instagram/callback`
   - Save changes

## Step 4: Add Instagram Tester (if needed)

1. In **Instagram Basic Display** settings, scroll to **"Instagram Testers"**
2. Click **"Add Instagram Testers"**
3. Enter your Instagram username
4. Go to `instagram.com/developers` on your phone
5. Accept the tester invite

## Step 5: Get Your App Credentials

1. In your App Dashboard, go to **Settings** → **Basic**
2. Note down:
   - **App ID**: `INSTAGRAM_APP_ID`
   - **App Secret**: `INSTAGRAM_APP_SECRET`

## Step 6: Complete OAuth Flow

1. Create a `.env.local` file in the `landing-page` directory (copy from `.env.local.example`):
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```env
   INSTAGRAM_APP_ID=your_app_id_here
   INSTAGRAM_APP_SECRET=your_app_secret_here
   INSTAGRAM_ACCESS_TOKEN= # Will be filled after OAuth
   INSTAGRAM_USER_ID= # Will be filled after OAuth
   INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/instagram/callback
   ```

3. Start your development server:
   ```bash
   npm run dev
   ```

4. Visit the OAuth authorization URL in your browser:
   ```
   http://localhost:3000/api/instagram/auth
   ```

5. You'll be redirected to Instagram. Click **"Allow"** to authorize the app.

6. After authorization, you'll see a success page with your credentials:
   - Copy `INSTAGRAM_ACCESS_TOKEN`
   - Copy `INSTAGRAM_USER_ID`

7. Add these values to your `.env.local` file

8. Restart your development server:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

## Step 7: Verify Integration

1. Visit your landing page at `http://localhost:3000`
2. Scroll to the **"Stay connected on Instagram"** section
3. You should see your real Instagram posts!

## Step 8: Production Setup

For production deployment:

1. Update your Instagram OAuth Redirect URI in Meta App Dashboard to your production URL:
   ```
   https://your-domain.com/api/instagram/callback
   ```

2. Add environment variables to your hosting platform:
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Environment Variables
   - Other: Follow your platform's documentation

3. Redeploy your application

## API Endpoints

### Fetch Instagram Posts
```
GET /api/instagram/posts
```

Query parameters:
- `limit`: Number of posts to fetch (default: 6, max: 25)
- `forceRefresh`: Force cache refresh (default: false)

Example:
```
GET /api/instagram/posts?limit=3&forceRefresh=true
```

### Clear Cache
```
DELETE /api/instagram/posts
```

## Troubleshooting

### "Missing required Instagram API environment variables"
- Make sure you've created `.env.local` file
- Verify all environment variables are set
- Restart the development server

### "Instagram authorization was denied or failed"
- Make sure you're using an Instagram Business or Creator account
- Verify the OAuth Redirect URI matches in Meta App Dashboard
- Check that you've accepted the tester invitation (if needed)

### Posts not loading
- Check browser console for errors
- Verify environment variables are correct
- Try adding `?forceRefresh=true` to bypass cache
- Check server logs for API errors

### Token expired
Access tokens expire after 60 days. You'll need to:
1. Run the OAuth flow again: `http://localhost:3000/api/instagram/auth`
2. Update `INSTAGRAM_ACCESS_TOKEN` in `.env.local`
3. Restart the server

For automatic token refresh, consider implementing a background job or using a database to store and refresh tokens.

## Features

✅ **Real Instagram Posts**: Fetches actual posts from your Instagram account
✅ **Automatic Caching**: 1-hour cache to minimize API calls
✅ **Error Handling**: Falls back to static data if API fails
✅ **Loading States**: Shows skeleton loading while fetching
✅ **Responsive**: Works on all screen sizes
✅ **TypeScript**: Full type safety
✅ **Zod Validation**: Validates API responses

## Security Best Practices

- ✅ Never commit `.env.local` to version control
- ✅ Never expose `INSTAGRAM_APP_SECRET` to client-side code
- ✅ Use HTTPS in production
- ✅ Rotate access tokens periodically
- ✅ Monitor API usage to avoid rate limits

## Rate Limits

Instagram Graph API has rate limits:
- Default: 200 requests per hour per user
- Cache duration: 1 hour (configurable in `app/api/instagram/posts/route.ts`)

## Next Steps

1. Customize the number of posts displayed
2. Add Instagram username to your environment variables
3. Implement automatic token refresh for production
4. Add Instagram Stories integration (optional)
5. Add Instagram Reels integration (optional)

## Support

If you encounter issues:
1. Check the [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-api)
2. Review server logs for detailed error messages
3. Verify your Meta App settings
4. Ensure your Instagram account type (Business/Creator)
