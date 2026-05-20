/**
 * Centralized configuration file
 * Single source of truth for environment-based configuration
 */

export const config = {
  instagram: {
    appId: process.env.INSTAGRAM_APP_ID,
    appSecret: process.env.INSTAGRAM_APP_SECRET,
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
    userId: process.env.INSTAGRAM_USER_ID,
    redirectUri: process.env.INSTAGRAM_REDIRECT_URI || "http://localhost:3000/api/instagram/callback",
    apiVersion: "v25.0",
    baseUrl: "https://graph.instagram.com",
    oauthUrl: "https://api.instagram.com/oauth",
  },
  socialMedia: {
    instagramHandle: process.env.INSTAGRAM_HANDLE || "your-handmade-bags",
    instagramUrl: `https://www.instagram.com/${process.env.INSTAGRAM_HANDLE || "your-handmade-bags"}`,
  },
  cache: {
    instagramPostsDuration: 1000 * 60 * 60, // 1 hour in milliseconds
  },
} as const;

/**
 * Validate required environment variables
 */
export function validateConfig() {
  const required = [
    config.instagram.appId,
    config.instagram.appSecret,
    config.instagram.accessToken,
    config.instagram.userId,
  ];

  const missing = required.filter((value) => !value);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required Instagram API environment variables: INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET, INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_USER_ID`
    );
  }

  return config;
}