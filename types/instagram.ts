/**
 * Instagram API Types
 * Based on Instagram Graph API v25.0
 */

/**
 * Instagram media types
 */
export type InstagramMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";

/**
 * Instagram media object
 */
export interface InstagramMedia {
  id: string;
  media_type: InstagramMediaType;
  media_url: string;
  permalink: string;
  caption: string | null;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
  thumbnail_url?: string | null;
}

/**
 * Instagram API response for media list
 */
export interface InstagramMediaResponse {
  data: Array<{
    id: string;
  }>;
  paging?: {
    cursors?: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

/**
 * Instagram user info
 */
export interface InstagramUser {
  id: string;
  username: string;
  account_type?: string;
}

/**
 * Access token response
 */
export interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user_id: string;
}

/**
 * Error response from Instagram API
 */
export interface InstagramApiError {
  error: {
    type: string;
    message: string;
    code: number;
    error_subcode?: number;
    error_user_title?: string;
    error_user_msg?: string;
  };
}
