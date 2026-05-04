/**
 * Instagram API Client
 * Handles authentication and data fetching from Instagram Graph API
 */

import type {
  InstagramMedia,
  InstagramMediaResponse,
  InstagramMediaDetails,
  InstagramUser,
  AccessTokenResponse,
  InstagramApiError,
} from "@/types/instagram";

const API_VERSION = "v25.0";
const BASE_URL = "https://graph.instagram.com";

/**
 * Environment variables required for Instagram API
 */
function getInstagramConfig() {
  const appId = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  if (!appId || !appSecret || !accessToken || !userId) {
    throw new Error("Missing required Instagram API environment variables");
  }

  return { appId, appSecret, accessToken, userId };
}

/**
 * Build OAuth authorization URL
 */
export function buildAuthUrl(): string {
  const { appId } = getInstagramConfig();
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || "http://localhost:3000/api/instagram/callback";

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "user_profile,user_media", // Permissions needed for reading posts
  });

  return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for short-lived access token
 */
export async function exchangeCodeForToken(code: string): Promise<AccessTokenResponse> {
  const { appId, appSecret } = getInstagramConfig();
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || "http://localhost:3000/api/instagram/callback";

  const response = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    }),
  });

  if (!response.ok) {
    const error: InstagramApiError = await response.json();
    throw new Error(`Instagram API error: ${error.error.message}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Exchange short-lived token for long-lived token (valid for 60 days)
 */
export async function getLongLivedToken(shortLivedToken: string): Promise<AccessTokenResponse> {
  const { appSecret } = getInstagramConfig();

  const response = await fetch(
    `${BASE_URL}/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortLivedToken}`
  );

  if (!response.ok) {
    const error: InstagramApiError = await response.json();
    throw new Error(`Instagram API error: ${error.error.message}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Refresh long-lived access token
 */
export async function refreshAccessToken(accessToken: string): Promise<AccessTokenResponse> {
  const response = await fetch(
    `${BASE_URL}/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`
  );

  if (!response.ok) {
    const error: InstagramApiError = await response.json();
    throw new Error(`Instagram API error: ${error.error.message}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Get Instagram user info
 */
export async function getUserInfo(accessToken: string): Promise<InstagramUser> {
  const response = await fetch(
    `${BASE_URL}/me?fields=id,username,account_type&access_token=${accessToken}`
  );

  if (!response.ok) {
    const error: InstagramApiError = await response.json();
    throw new Error(`Instagram API error: ${error.error.message}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Get list of media IDs for a user
 */
export async function getUserMediaIds(userId: string, accessToken: string): Promise<string[]> {
  const response = await fetch(
    `${BASE_URL}/${userId}/media?access_token=${accessToken}&limit=25`
  );

  if (!response.ok) {
    const error: InstagramApiError = await response.json();
    throw new Error(`Instagram API error: ${error.error.message}`);
  }

  const data: InstagramMediaResponse = await response.json();
  return data.data.map((item) => item.id);
}

/**
 * Get detailed media information for a single media item
 */
export async function getMediaDetails(mediaId: string, accessToken: string): Promise<InstagramMedia> {
  const fields = [
    "id",
    "media_type",
    "media_url",
    "permalink",
    "caption",
    "timestamp",
    "like_count",
    "comments_count",
    "thumbnail_url",
  ].join(",");

  const response = await fetch(
    `${BASE_URL}/${mediaId}?fields=${fields}&access_token=${accessToken}`
  );

  if (!response.ok) {
    const error: InstagramApiError = await response.json();
    throw new Error(`Instagram API error: ${error.error.message}`);
  }

  const data: InstagramMedia = await response.json();
  return data;
}

/**
 * Get all media posts with details for a user
 */
export async function getUserMedia(limit = 10): Promise<InstagramMedia[]> {
  const { userId, accessToken } = getInstagramConfig();

  // Get media IDs
  const mediaIds = await getUserMediaIds(userId, accessToken);

  // Get details for each media item (limit to specified number)
  const limitedIds = mediaIds.slice(0, limit);
  const mediaPromises = limitedIds.map((id) => getMediaDetails(id, accessToken));
  const mediaItems = await Promise.all(mediaPromises);

  // Filter out non-IMAGE types (we only want images for the gallery)
  return mediaItems
    .filter((item) => item.media_type === "IMAGE")
    .map((item) => ({
      ...item,
      caption: item.caption || "",
      like_count: item.like_count || 0,
    }));
}

/**
 * Format Instagram post for frontend display
 */
export function formatInstagramPost(media: InstagramMedia) {
  const relativeTime = getRelativeTime(new Date(media.timestamp));

  return {
    id: media.id,
    image: media.media_url,
    caption: media.caption || "",
    likes: media.like_count || 0,
    date: relativeTime,
    permalink: media.permalink,
  };
}

/**
 * Get relative time string (e.g., "2 days ago")
 */
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
