// External Dependencies
import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";

// Internal Dependencies
import { db } from "~/server/db";
import { googleTokens } from "~/server/db/schema";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/auth/google/callback`
);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Exchange the code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    // Save or update tokens in the database
    if (tokens.expiry_date) {
      await db
        .insert(googleTokens)
        .values({
          userId: userId,
          accessToken: tokens.access_token ?? '',
          refreshToken: tokens.refresh_token ?? null,
          expiryDate: tokens.expiry_date,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [googleTokens.userId],
          set: {
            accessToken: tokens.access_token ?? '',
            refreshToken: tokens.refresh_token ?? null,
            expiryDate: tokens.expiry_date,
            updatedAt: new Date(),
          },
        });
    }

    // Return HTML that sends a message to the parent window
    const html = `
      <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_SUCCESS',
              tokens: ${JSON.stringify({
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiryDate: tokens.expiry_date,
              })}
            }, '*');
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error("Error in callback:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}