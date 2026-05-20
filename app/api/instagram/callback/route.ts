/**
 * Instagram OAuth Callback Route
 * Handles the callback from Instagram OAuth and exchanges code for token
 */

import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, getLongLivedToken, getUserInfo } from "@/lib/instagram-api";
import { createLogger } from "@/lib/logger";
import { handleApiError } from "@/lib/error-handler";
import { config, validateConfig } from "@/lib/config";
import { z } from "zod";

const logger = createLogger("instagram-callback-api");

// Validation schema for callback parameters
const callbackQuerySchema = z.object({
  code: z.string().min(1).max(500),
  error: z.string().optional(),
  error_reason: z.string().optional(),
  error_description: z.string().optional(),
});

/**
 * GET /api/instagram/callback
 * Handles OAuth callback from Instagram
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = callbackQuerySchema.safeParse(searchParams);

    if (!parsed.success) {
      logger.warn("Invalid callback parameters", { errors: parsed.error.errors });
      return NextResponse.json(
        { error: "Invalid callback parameters", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { code, error, error_reason, error_description } = parsed.data;

    // Handle OAuth errors
    if (error) {
      logger.error("Instagram OAuth error", { error, error_reason, error_description });
      return NextResponse.json(
        {
          error: "Instagram authorization was denied or failed",
          details: error_description || error_reason || error,
        },
        { status: 400 }
      );
    }

    // Exchange code for short-lived token
    logger.info("Exchanging authorization code for token");
    const shortLivedToken = await exchangeCodeForToken(code);

    // Exchange short-lived token for long-lived token (valid for 60 days)
    logger.info("Exchanging for long-lived token");
    const longLivedToken = await getLongLivedToken(shortLivedToken.access_token);

    // Get user info
    logger.info("Fetching user info");
    const userInfo = await getUserInfo(longLivedToken.access_token);

    logger.info("OAuth successful", { userId: userInfo.id, username: userInfo.username });

    // Return credentials (in production, you should save these to a database)
    return new NextResponse(generateSuccessHtml(longLivedToken, userInfo), {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    const errorResponse = handleApiError(error, "Process Instagram callback");
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * Generate success HTML page for OAuth callback
 */
function generateSuccessHtml(token: any, user: any) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Instagram OAuth Success</title>
        <style>
          body { font-family: system-ui, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
          h1 { color: #333; }
          .success { color: #10b981; }
          .warning { background: #fffbeb; border: 1px solid #fcd34d; padding: 15px; border-radius: 8px; margin: 20px 0; }
          code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
          pre { background: #1f2937; color: #f9fafb; padding: 20px; border-radius: 8px; overflow-x: auto; }
          .copy-btn { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-top: 10px; }
          .copy-btn:hover { background: #2563eb; }
        </style>
      </head>
      <body>
        <h1 class="success">✅ Instagram OAuth Successful!</h1>

        <div class="warning">
          <strong>⚠️ Important:</strong> Add these credentials to your <code>.env.local</code> file:
        </div>

        <pre>
INSTAGRAM_ACCESS_TOKEN=${token.access_token}
INSTAGRAM_USER_ID=${user.id}
INSTAGRAM_REDIRECT_URI=${config.instagram.redirectUri}
        </pre>

        <h3>Token Details:</h3>
        <ul>
          <li><strong>Token Type:</strong> ${token.token_type}</li>
          <li><strong>Expires In:</strong> ${Math.floor(token.expires_in / 86400)} days</li>
          <li><strong>User ID:</strong> ${user.id}</li>
          <li><strong>Username:</strong> ${user.username}</li>
          <li><strong>Account Type:</strong> ${user.account_type || "N/A"}</li>
        </ul>

        <h3>Next Steps:</h3>
        <ol>
          <li>Copy the credentials above</li>
          <li>Add them to your <code>.env.local</code> file</li>
          <li>Restart your Next.js development server</li>
          <li>Visit your landing page to see Instagram posts</li>
        </ol>

        <button class="copy-btn" onclick="copyToClipboard()">Copy Credentials</button>
        <p id="copy-status" style="margin-top: 10px; color: #10b981; display: none;">✓ Copied to clipboard!</p>

        <script>
          function copyToClipboard() {
            const credentials = \`INSTAGRAM_ACCESS_TOKEN=${token.access_token}
INSTAGRAM_USER_ID=${user.id}
INSTAGRAM_REDIRECT_URI=${config.instagram.redirectUri}\`;
            navigator.clipboard.writeText(credentials);
            document.getElementById('copy-status').style.display = 'block';
          }
        </script>

        <p style="margin-top: 30px;">
          <a href="/">← Back to Home</a>
        </p>
      </body>
    </html>
  `;
}
