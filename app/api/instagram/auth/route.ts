/**
 * Instagram OAuth Auth Route
 * Initiates the OAuth flow to get user authorization
 */

import { NextResponse } from "next/server";
import { buildAuthUrl } from "@/lib/instagram-api";

export async function GET() {
  try {
    // Build the Instagram authorization URL
    const authUrl = buildAuthUrl();

    // Redirect user to Instagram for authorization
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Instagram OAuth error:", error);
    return NextResponse.json(
      { error: "Failed to initiate Instagram OAuth flow" },
      { status: 500 }
    );
  }
}
