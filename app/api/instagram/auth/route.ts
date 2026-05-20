/**
 * Instagram OAuth Auth Route
 * Initiates the OAuth flow to get user authorization
 */

import { NextResponse } from "next/server";
import { buildAuthUrl } from "@/lib/instagram-api";
import { createLogger } from "@/lib/logger";
import { handleApiError } from "@/lib/error-handler";

const logger = createLogger("instagram-auth-api");

/**
 * GET /api/instagram/auth
 * Initiates the OAuth flow by redirecting to Instagram
 */
export async function GET() {
  try {
    logger.info("Initiating Instagram OAuth flow");
    const authUrl = buildAuthUrl();

    // Redirect user to Instagram for authorization
    return NextResponse.redirect(authUrl);
  } catch (error) {
    const errorResponse = handleApiError(error, "Initiate Instagram OAuth");
    logger.error("Failed to initiate OAuth", error);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
