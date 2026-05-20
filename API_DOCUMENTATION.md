# Instagram API Documentation

## Overview

The landing-page includes Instagram integration via Next.js API routes, allowing dynamic fetching of Instagram posts with caching, OAuth authentication, and error handling.

**Base URL**: `http://localhost:3000/api/instagram`

**API Version**: Instagram Graph API v25.0

---

## Authentication Flow

The Instagram integration uses OAuth 2.0 to obtain access tokens. The flow consists of three endpoints:

1. **Initiate OAuth** → Redirect user to Instagram
2. **Handle Callback** → Receive authorization code
3. **Exchange Token** → Convert code to long-lived access token

### OAuth Flow Diagram

```
┌─────────┐           ┌──────────────┐           ┌───────────┐
│  Client │──────────▶│  /api/instagram/auth    │           │
│         │  Redirect │  Instagram    │──────────▶│ Instagram │
└─────────┘           └──────────────┘           └───────────┘
                           ▲                               │
                           │  Callback with code           │
                           │                               ▼
┌─────────┐           ┌──────────────┐           ┌───────────┐
│  Client │◀──────────│ /api/instagram/callback │  Instagram │
│         │  Success   │ Exchange token           └───────────┘
└─────────┘           └──────────────┘
                           │
                           ▼
┌─────────┐           ┌──────────────┐
│  Client │◀──────────│ Display      │
│         │  Copy     │ Credentials  │
└─────────┘           └──────────────┘
```

---

## Endpoints

### 1. GET /api/instagram/auth

Initiates the Instagram OAuth flow by redirecting the user to Instagram's authorization page.

**Purpose**: Start OAuth authentication process

**Request**:
```http
GET /api/instagram/auth
```

**Response**:
- **Status**: 302 (Redirect)
- **Location**: Instagram authorization URL

**Example**:
```bash
curl -I http://localhost:3000/api/instagram/auth

# Response
HTTP/1.1 302 Found
Location: https://api.instagram.com/oauth/authorize?client_id=APP_ID&redirect_uri=...
```

**Notes**:
- No authentication required
- Automatically redirects to Instagram
- User must authorize the application

---

### 2. GET /api/instagram/callback

Handles the OAuth callback from Instagram after user authorization.

**Purpose**: Exchange authorization code for long-lived access token

**Request**:
```http
GET /api/instagram/callback?code=CODE
```

**Query Parameters**:
| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| code      | string | Yes      | Authorization code from Instagram |
| error     | string | No       | OAuth error (if denied)         |

**Success Response**:
- **Status**: 200
- **Content-Type**: text/html
- **Body**: HTML page displaying credentials

**Example Success Response**:
```html
<!DOCTYPE html>
<html>
  <head><title>Instagram OAuth Success</title>...</head>
  <body>
    <h1 class="success">✅ Instagram OAuth Successful!</h1>
    <pre>
INSTAGRAM_ACCESS_TOKEN=IGQVJ...
INSTAGRAM_USER_ID=178414...
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/instagram/callback
    </pre>
    <h3>Token Details:</h3>
    <ul>
      <li>Token Type: bearer</li>
      <li>Expires In: 60 days</li>
      <li>User ID: 178414...</li>
      <li>Username: your-username</li>
    </ul>
  </body>
</html>
```

**Error Responses**:

**400 - OAuth Error**
```json
{
  "error": "Instagram authorization was denied or failed",
  "details": "user_denied"
}
```

**400 - Invalid Parameters**
```json
{
  "error": "Invalid callback parameters",
  "details": [
    {
      "code": "too_small",
      "message": "String must contain at least 1 character(s)"
    }
  ]
}
```

**500 - Server Error**
```json
{
  "success": false,
  "error": "Failed to exchange authorization code"
}
```

**Example Usage**:
```bash
# Successful callback
curl http://localhost:3000/api/instagram/callback?code=AQDp...

# Denied authorization
curl http://localhost:3000/api/instagram/callback?error=access_denied
```

**Notes**:
- Displayed credentials must be manually added to `.env.local`
- Long-lived tokens are valid for 60 days
- Tokens should be refreshed before expiration

---

### 3. GET /api/instagram/posts

Fetches Instagram posts for the landing page gallery with caching support.

**Purpose**: Retrieve Instagram media posts for display

**Request**:
```http
GET /api/instagram/posts?limit=6&forceRefresh=false
```

**Query Parameters**:
| Parameter     | Type    | Required | Default | Description                                      |
|---------------|---------|----------|---------|--------------------------------------------------|
| limit         | number  | No       | 6       | Number of posts to fetch (1-25)                   |
| forceRefresh  | boolean | No       | false   | Bypass cache and fetch fresh data                |

**Validation**:
- `limit` must be between 1 and 25
- `forceRefresh` must be a boolean string ("true" or "false")

**Success Response**:
```json
{
  "success": true,
  "posts": [
    {
      "id": "17841400000000000",
      "image": "https://scontent.cdninstagram.com/v/t51.2885-15/...",
      "caption": "New arrival! Our Ambar handbag features natural fique fiber...",
      "likes": 1247,
      "date": "2 days ago",
      "permalink": "https://www.instagram.com/p/ABC123/"
    }
  ],
  "cached": false
}
```

**Cached Response**:
```json
{
  "success": true,
  "posts": [...],
  "cached": true,
  "cacheAge": 1800
}
```

**Fallback Response (API Error with Cache)**:
```json
{
  "success": true,
  "posts": [...],
  "cached": true,
  "cacheAge": 3600,
  "warning": "Using cached data due to API error"
}
```

**Error Responses**:

**400 - Invalid Parameters**
```json
{
  "success": false,
  "error": "Invalid input parameters",
  "code": "VALIDATION_ERROR",
  "details": {
    "limit": ["Number must be less than or equal to 25"]
  }
}
```

**500 - API Error (No Cache)**
```json
{
  "success": false,
  "error": "Failed to fetch Instagram posts",
  "code": "API_ERROR"
}
```

**500 - Missing Configuration**
```json
{
  "success": false,
  "error": "Missing required Instagram API environment variables"
}
```

**Example Usage**:
```bash
# Fetch 3 posts (uses cache if available)
curl http://localhost:3000/api/instagram/posts?limit=3

# Force refresh (bypass cache)
curl http://localhost:3000/api/instagram/posts?forceRefresh=true

# Fetch 10 posts with refresh
curl "http://localhost:3000/api/instagram/posts?limit=10&forceRefresh=true"
```

**Notes**:
- Cache duration: 1 hour (3600 seconds)
- Only IMAGE media type is returned (videos filtered out)
- Falls back to cached data if API fails
- Returns relative time strings ("2 days ago") instead of timestamps

---

### 4. DELETE /api/instagram/posts

Clears the in-memory cache for Instagram posts.

**Purpose**: Manually clear cache for testing or debugging

**Request**:
```http
DELETE /api/instagram/posts
```

**Success Response**:
```json
{
  "success": true,
  "message": "Cache cleared successfully"
}
```

**Example Usage**:
```bash
# Clear cache
curl -X DELETE http://localhost:3000/api/instagram/posts
```

**Notes**:
- Useful for testing during development
- Next GET request will fetch fresh data from Instagram
- **Production Warning**: In-memory cache doesn't persist across serverless instances

---

## Data Models

### InstagramPost

```typescript
interface InstagramPost {
  id: string;           // Instagram media ID
  image: string;        // Media URL (HTTPS)
  caption: string;      // Post caption text
  likes: number;        // Number of likes
  date: string;         // Relative time ("2 days ago")
  permalink: string;    // Instagram post URL
}
```

### AccessTokenResponse

```typescript
interface AccessTokenResponse {
  access_token: string; // Long-lived access token
  token_type: string;   // Always "bearer"
  expires_in: number;   // Expiration time in seconds
  user_id: string;      // Instagram user ID
}
```

### InstagramUser

```typescript
interface InstagramUser {
  id: string;           // Instagram user ID
  username: string;     // Instagram username
  account_type?: string; // "BUSINESS", "CREATOR", etc.
}
```

### ApiErrorResponse

```typescript
interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}
```

### InstagramErrorResponse

```typescript
interface InstagramErrorResponse {
  success: false;
  error: string;
  type?: string;
  code?: number;
}
```

---

## Environment Variables

Required environment variables in `.env.local`:

```bash
# Instagram OAuth Configuration
INSTAGRAM_APP_ID=your-app-id
INSTAGRAM_APP_SECRET=your-app-secret
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/instagram/callback

# Instagram API Access (obtained via OAuth flow)
INSTAGRAM_ACCESS_TOKEN=your-long-lived-token
INSTAGRAM_USER_ID=your-instagram-user-id
```

### Getting Credentials

1. Create Instagram App: https://developers.facebook.com/apps/
2. Run OAuth flow: Visit `/api/instagram/auth`
3. Authorize the application
4. Copy credentials from callback page
5. Add to `.env.local`
6. Restart development server

---

## Caching Strategy

### Current Implementation

**Type**: In-memory module-level cache

**Duration**: 1 hour (3600 seconds)

**Behavior**:
- First request: Fetches from Instagram API, stores in cache
- Subsequent requests: Returns cached data (if within duration)
- Force refresh: Bypasses cache, fetches fresh data
- API error: Returns cached data with warning (if available)

**Example**:
```javascript
// First request - fetches from API
GET /api/instagram/posts
// Response: { cached: false, posts: [...] }

// Second request - returns from cache
GET /api/instagram/posts
// Response: { cached: true, cacheAge: 30, posts: [...] }

// Force refresh - bypasses cache
GET /api/instagram/posts?forceRefresh=true
// Response: { cached: false, posts: [...] }

// API error - falls back to cache
GET /api/instagram/posts
// Response: { cached: true, warning: "Using cached data due to API error", posts: [...] }
```

### Production Considerations

**⚠️ Current cache fails in serverless environments** because:
- Module-level cache is per-instance
- Next.js production runs multiple instances
- Each instance has its own cache
- Inconsistent data across requests

**Recommended Solutions**:
1. **Vercel KV** (Redis-compatible): `npm install @vercel/kv`
2. **Upstash Redis**: Distributed Redis with Edge support
3. **Redis**: Self-hosted Redis instance

**Example with Vercel KV**:
```typescript
import { kv } from '@vercel/kv';

// Instead of module-level cache
async function getCachedPosts() {
  const cached = await kv.get('instagram-posts');
  if (cached) return cached;

  const posts = await fetchFromInstagram();
  await kv.set('instagram-posts', posts, { ex: 3600 });
  return posts;
}
```

---

## Rate Limiting

### Implementation

Current implementation provides basic rate limiting protection:

**Configuration**:
- **Max Requests**: 100 per window
- **Window Duration**: 60 seconds (1 minute)
- **Identifier**: Client IP address

**Behavior**:
- Each IP tracked independently
- Count resets after window expires
- Returns HTTP 429 when limit exceeded

### Response Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 75
X-RateLimit-Reset: 2025-01-21T12:00:00Z
Retry-After: 45
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": "Too many requests. Please try again later."
}
```

### Production Considerations

**⚠️ Current rate limiter is in-memory and won't work in distributed environments**

**Recommended Solutions**:
1. **Upstash Redis Rate Limiting**: Distributed rate limiting
2. **Vercel Edge Middleware**: Serverless rate limiting
3. **API Gateway**: Cloudflare, AWS API Gateway

**Example with Upstash**:
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "60 s"),
});

const { success } = await ratelimit.limit(ip);
if (!success) {
  return new Response("Too many requests", { status: 429 });
}
```

---

## Error Handling

### Error Response Format

All API errors follow a consistent format:

**Standard API Errors**:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

**Instagram API Errors**:
```json
{
  "success": false,
  "error": "Instagram API error message",
  "type": "OAuthException",
  "code": 190
}
```

### Common Error Codes

| Code              | Status | Description                        |
|-------------------|--------|------------------------------------|
| VALIDATION_ERROR  | 400    | Invalid input parameters           |
| AUTH_ERROR        | 400    | OAuth authorization failed         |
| API_ERROR         | 500    | Instagram API request failed       |
| CONFIG_ERROR      | 500    | Missing environment variables      |
| RATE_LIMIT_ERROR  | 429    | Too many requests                  |

### Error Handling Strategy

1. **Validation Errors** - Caught at input boundary, return 400
2. **OAuth Errors** - Displayed to user, suggest retry
3. **API Errors** - Fallback to cache if available, otherwise 500
4. **Configuration Errors** - Fail fast with helpful message
5. **Rate Limit Errors** - Return 429 with Retry-After header

---

## Security Considerations

### ✅ Implemented Security Measures

1. **OAuth 2.0 Flow** - Secure token exchange
2. **Input Validation** - Zod schema validation on all inputs
3. **Error Sanitization** - Don't expose sensitive data in errors
4. **HTTPS Required** - Instagram API requires HTTPS
5. **Token Storage** - Tokens stored in environment variables (not code)

### ⚠️ Security Recommendations for Production

1. **Secrets Management**
   - Use Vercel Secrets or AWS Secrets Manager
   - Never commit `.env.local` to version control

2. **Token Rotation**
   - Refresh long-lived tokens before expiration
   - Implement automated token refresh job
   - Monitor token expiry dates

3. **HTTPS Enforcement**
   - Force HTTPS in production
   - Use secure cookies for any auth

4. **Rate Limiting**
   - Implement distributed rate limiting
   - Add API key authentication for additional protection

5. **CORS Configuration**
   - Whitelist allowed origins
   - Don't allow wildcard (`*`) in production

6. **Input Sanitization**
   - Validate and sanitize user inputs
   - Prevent XSS in displayed content

---

## Monitoring & Debugging

### Logging

All API routes use structured logging with context:

```typescript
logger.info("Fetching Instagram posts", { limit: 6 });
logger.warn("Rate limit exceeded", { ip: "192.168.1.1" });
logger.error("Instagram API error", error, { endpoint: "/media" });
```

### Debugging Tips

**Enable Debug Logs** (development only):
```typescript
logger.debug("Detailed info", data); // Only shows in NODE_ENV=development
```

**Check Cache Status**:
```bash
curl -v http://localhost:3000/api/instagram/posts | grep cached
```

**Verify Configuration**:
```bash
curl http://localhost:3000/api/instagram/posts
# Check for "Missing required environment variables" error
```

**Test OAuth Flow**:
```bash
# 1. Start OAuth
curl -I http://localhost:3000/api/instagram/auth

# 2. Follow redirect and authorize
# 3. Check callback page for credentials
```

### Common Issues

**Issue**: "Missing required Instagram API environment variables"
- **Cause**: Environment variables not set
- **Fix**: Add all required vars to `.env.local` and restart server

**Issue**: "Instagram API error: OAuthException"
- **Cause**: Invalid or expired access token
- **Fix**: Run OAuth flow again to get fresh token

**Issue**: "Using cached data due to API error"
- **Cause**: Instagram API is down or rate limited
- **Fix**: Wait and retry, or use cached data

**Issue**: Rate limit exceeded (429)
- **Cause**: Too many requests from same IP
- **Fix**: Wait until `Retry-After` time passes

---

## Testing

### Manual Testing

**Test OAuth Flow**:
```bash
# 1. Start OAuth (opens browser)
open http://localhost:3000/api/instagram/auth

# 2. Authorize application
# 3. Copy credentials from callback page
# 4. Add to .env.local
# 5. Restart server
```

**Test Posts Endpoint**:
```bash
# Fetch posts
curl http://localhost:3000/api/instagram/posts

# Force refresh
curl "http://localhost:3000/api/instagram/posts?forceRefresh=true"

# Test caching
curl http://localhost:3000/api/instagram/posts
# Should return cached: true
```

**Test Error Handling**:
```bash
# Test missing config (remove INSTAGRAM_ACCESS_TOKEN)
curl http://localhost:3000/api/instagram/posts

# Test invalid parameters
curl "http://localhost:3000/api/instagram/posts?limit=100"

# Test rate limiting (send many requests quickly)
for i in {1..110}; do curl http://localhost:3000/api/instagram/posts; done
```

**Test Cache Clearing**:
```bash
# Clear cache
curl -X DELETE http://localhost:3000/api/instagram/posts

# Verify cache cleared (should fetch fresh data)
curl http://localhost:3000/api/instagram/posts
```

### Automated Testing (TODO)

Consider adding automated tests:
- Unit tests for API handlers
- Integration tests for OAuth flow
- Mock Instagram API responses
- Test error scenarios
- Test caching behavior
- Test rate limiting

---

## Future Enhancements

### Planned Improvements

1. **Distributed Caching**
   - Replace in-memory cache with Vercel KV
   - Consistent cache across instances

2. **Automated Token Refresh**
   - Background job to refresh tokens
   - Monitor token expiry
   - Automatic rotation

3. **Webhook Support**
   - Real-time post updates via Instagram webhooks
   - Push-based instead of pull-based

4. **Analytics**
   - Track post engagement
   - Monitor API usage
   - Performance metrics

5. **Enhanced Filtering**
   - Filter by hashtag
   - Filter by date range
   - Filter by media type

6. **Multi-account Support**
   - Support multiple Instagram accounts
   - Separate configurations per account

---

## Support

### Troubleshooting

For issues or questions:
1. Check logs in console output
2. Verify environment variables are set
3. Test Instagram Graph API directly: https://developers.facebook.com/tools/explorer/
4. Review Instagram API documentation: https://developers.facebook.com/docs/instagram-api

### Resources

- **Instagram Graph API Docs**: https://developers.facebook.com/docs/instagram-api
- **Instagram OAuth Docs**: https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow
- **Next.js API Routes**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **Zod Validation**: https://zod.dev/

---

**Last Updated**: 2025-01-21
**API Version**: Instagram Graph API v25.0
**Documentation Version**: 1.0