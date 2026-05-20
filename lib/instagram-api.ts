/**
 * Instagram API Client
 * Handles authentication and data fetching from Instagram Graph API
 */

import type {
  InstagramMedia,
  InstagramMediaResponse,
  InstagramUser,
  AccessTokenResponse,
} from "@/types/instagram";
import { config } from "./config";
import { handleInstagramError, validateApiResponse } from "./error-handler";
import { createLogger } from "./logger";
import { getRelativeTime } from "./utils";

const logger = createLogger("instagram-api");

/**
 * Build OAuth authorization URL
 */
export function buildAuthUrl(): string {
  validateConfig();

  const params = new URLSearchParams({
    client_id: config.instagram.appId!,
    redirect_uri: config.instagram.redirectUri,
    response_type: "code",
    scope: "user_profile,user_media",
  });

  return `${config.instagram.oauthUrl}/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for short-lived access token
 */
export async function exchangeCodeForToken(code: string): Promise<AccessTokenResponse> {
  validateConfig();

  const response = await fetch(`${config.instagram.oauthUrl}/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.instagram.appId!,
      client_secret: config.instagram.appSecret!,
      grant_type: "authorization_code",
      redirect_uri: config.instagram.redirectUri,
      code,
    }),
  });

  try {
    return await validateApiResponse<AccessTokenResponse>(response, "Exchange code for token");
  } catch (error) {
    throw handleInstagramError(error, "Exchange code for token");
  }
}

/**
 * Exchange short-lived token for long-lived token (valid for 60 days)
 */
export async function getLongLivedToken(shortLivedToken: string): Promise<AccessTokenResponse> {
  validateConfig();

  const url = new URL(`${config.instagram.baseUrl}/access_token`);
  url.searchParams.append("grant_type", "ig_exchange_token");
  url.searchParams.append("client_secret", config.instagram.appSecret!);
  url.searchParams.append("access_token", shortLivedToken);

  try {
    return await validateApiResponse<AccessTokenResponse>(await fetch(url.toString()), "Get long-lived token");
  } catch (error) {
    throw handleInstagramError(error, "Get long-lived token");
  }
}

/**
 * Refresh long-lived access token
 */
export async function refreshAccessToken(accessToken: string): Promise<AccessTokenResponse> {
  const url = new URL(`${config.instagram.baseUrl}/refresh_access_token`);
  url.searchParams.append("grant_type", "ig_refresh_token");
  url.searchParams.append("access_token", accessToken);

  try {
    return await validateApiResponse<AccessTokenResponse>(await fetch(url.toString()), "Refresh access token");
  } catch (error) {
    throw handleInstagramError(error, "Refresh access token");
  }
}

/**
 * Get Instagram user info
 */
export async function getUserInfo(accessToken: string): Promise<InstagramUser> {
  const url = new URL(`${config.instagram.baseUrl}/me`);
  url.searchParams.append("fields", "id,username,account_type");
  url.searchParams.append("access_token", accessToken);

  try {
    return await validateApiResponse<InstagramUser>(await fetch(url.toString()), "Get user info");
  } catch (error) {
    throw handleInstagramError(error, "Get user info");
  }
}

/**
 * Get list of media IDs for a user
 */
export async function getUserMediaIds(userId: string, accessToken: string): Promise<string[]> {
  const url = new URL(`${config.instagram.baseUrl}/${userId}/media`);
  url.searchParams.append("access_token", accessToken);
  url.searchParams.append("limit", "25");

  try {
    const data = await validateApiResponse<InstagramMediaResponse>(await fetch(url.toString()), "Get media IDs");
    return data.data.map((item) => item.id);
  } catch (error) {
    throw handleInstagramError(error, "Get media IDs");
  }
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

  const url = new URL(`${config.instagram.baseUrl}/${mediaId}`);
  url.searchParams.append("fields", fields);
  url.searchParams.append("access_token", accessToken);

  try {
    return await validateApiResponse<InstagramMedia>(await fetch(url.toString()), "Get media details");
  } catch (error) {
    throw handleInstagramError(error, "Get media details");
  }
}

/**
 * Get all media posts with details for a user
 */
export async function getUserMedia(limit = 10): Promise<InstagramMedia[]> {
  validateConfig();

  // Get media IDs
  const mediaIds = await getUserMediaIds(config.instagram.userId!, config.instagram.accessToken!);
  logger.debug(`Fetched ${mediaIds.length} media IDs`);

  // Get details for each media item (limit to specified number)
  const limitedIds = mediaIds.slice(0, limit);
  const mediaPromises = limitedIds.map((id) => getMediaDetails(id, config.instagram.accessToken!));
  const mediaItems = await Promise.all(mediaPromises);

  logger.debug(`Fetched details for ${mediaItems.length} media items`);

  // Filter out non-IMAGE types (we only want images for the gallery)
  const filtered = mediaItems
    .filter((item) => item.media_type === "IMAGE")
    .map((item) => ({
      ...item,
      caption: item.caption || "",
      like_count: item.like_count || 0,
    }));

  logger.debug(`Filtered to ${filtered.length} image items`);
  return filtered;
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
 * Validate configuration and throw if missing
 */
function validateConfig() {
  const required = [
    config.instagram.appId,
    config.instagram.appSecret,
    config.instagram.accessToken,
    config.instagram.userId,
  ];

  const missing = required.filter((value) => !value);

  if (missing.length > 0) {
    const error = new Error("Missing required Instagram API environment variables");
    logger.error("Config validation failed", error);
    throw error;
  }
}
