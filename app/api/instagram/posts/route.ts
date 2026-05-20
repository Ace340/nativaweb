/**
 * Instagram Posts API Route
 * Fetches and caches Instagram posts for the landing page
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserMedia, formatInstagramPost } from "@/lib/instagram-api";
import { createLogger } from "@/lib/logger";
import { handleApiError } from "@/lib/error-handler";
import { config } from "@/lib/config";
import type { InstagramMedia } from "@/types/instagram";

// Simple in-memory cache (for production, use Redis or similar)
let cache: {
  data: Array<{
    id: string;
    image: string;
    caption: string;
    likes: number;
    date: string;
    permalink: string;
  }>;
  timestamp: number;
} | null = null;

const logger = createLogger("instagram-posts-api");

// Validation schema for query parameters
const postsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(25).default(6),
  forceRefresh: z.coerce.boolean().default(false),
});

/**
 * GET /api/instagram/posts
 * Fetches Instagram posts with caching
 */
export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const { limit, forceRefresh } = postsQuerySchema.parse(Object.fromEntries(searchParams));

    // Check cache (unless force refresh is requested)
    if (!forceRefresh && cache && Date.now() - cache.timestamp < config.cache.instagramPostsDuration) {
      logger.info("Returning cached Instagram posts");
      return NextResponse.json({
        success: true,
        posts: cache.data.slice(0, limit),
        cached: true,
        cacheAge: Math.floor((Date.now() - cache.timestamp) / 1000),
      });
    }

    // Fetch fresh data from Instagram API
    logger.info("Fetching fresh Instagram posts...");
    const mediaItems: InstagramMedia[] = await getUserMedia(limit);

    // Format posts for frontend
    const formattedPosts = mediaItems.map((media) => formatInstagramPost(media));

    // Update cache
    cache = {
      data: formattedPosts,
      timestamp: Date.now(),
    };

    return NextResponse.json({
      success: true,
      posts: formattedPosts.slice(0, limit),
      cached: false,
    });
  } catch (error) {
    const errorResponse = handleApiError(error, "Fetch Instagram posts");

    // If there's an error but we have cached data, return it
    if (cache) {
      logger.warn("Returning cached data due to error");
      return NextResponse.json(
        {
          success: true,
          posts: cache.data,
          cached: true,
          cacheAge: Math.floor((Date.now() - cache.timestamp) / 1000),
          warning: "Using cached data due to API error",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * DELETE /api/instagram/posts
 * Clears the cache (useful for testing or manual refresh)
 */
export async function DELETE() {
  cache = null;
  return NextResponse.json({
    success: true,
    message: "Cache cleared successfully",
  });
}
