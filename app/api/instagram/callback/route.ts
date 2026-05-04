/**
 * Instagram OAuth Callback Route
 * Handles the callback from Instagram OAuth and exchanges code for token
 */

import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, getLongLivedToken, getUserInfo } from "@/lib/instagram-api";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    // Handle OAuth errors
    if (error) {
      console.error("Instagram OAuth error:", error);
      return NextResponse.json(
        { error: "Instagram authorization was denied or failed" },
        { status: 400 }
      );
    }

    // Check for authorization code
    if (!code) {
      return NextResponse.json(
        { error: "No authorization code received from Instagram" },
        { status: 400 }
      );
    }

    // Exchange code for short-lived token
    const shortLivedToken = await exchangeCodeForToken(code);

    // Exchange short-lived token for long-lived token (valid for 60 days)
    const longLivedToken = await getLongLivedToken(shortLivedToken.access_token);

    // Get user info
    const userInfo = await getUserInfo(longLivedToken.access_token);

    // Return credentials (in production, you should save these to a database)
    // For now, display them so you can add to .env.local
    const responseHtml = `
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
INSTAGRAM_ACCESS_TOKEN=${longLivedToken.access_token}
INSTAGRAM_USER_ID=${userInfo.id}
INSTAGRAM_REDIRECT_URI=${process.env.INSTAGRAM_REDIRECT_URI || "http://localhost:3000/api/instagram/callback"}
          </pre>

          <h3>Token Details:</h3>
          <ul>
            <li><strong>Token Type:</strong> ${longLivedToken.token_type}</li>
            <li><strong>Expires In:</strong> ${Math.floor(longLivedToken.expires_in / 86400)} days</li>
            <li><strong>User ID:</strong> ${userInfo.id}</li>
            <li><strong>Username:</strong> ${userInfo.username}</li>
            <li><strong>Account Type:</strong> ${userInfo.account_type || "N/A"}</li>
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
              const credentials = \`INSTAGRAM_ACCESS_TOKEN=${longLivedToken.access_token}
INSTAGRAM_USER_ID=${userInfo.id}
INSTAGRAM_REDIRECT_URI=${process.env.INSTAGRAM_REDIRECT_URI || "http://localhost:3000/api/instagram/callback"}\`;
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

    return new NextResponse(responseHtml, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Instagram callback error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process Instagram callback" },
      { status: 500 }
    );
  }
}
