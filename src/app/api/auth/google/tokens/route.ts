// External Dependencies
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

// Internal Dependencies
import { db } from "~/server/db";
import { googleTokens } from "~/server/db/schema";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { hasValidTokens: false, tokens: null },
        { status: 401 }
      );
    }

    // Get the most recent tokens for this user
    const tokens = await db.query.googleTokens.findFirst({
      where: eq(googleTokens.userId, userId),
      orderBy: (tokens, { desc }) => [desc(tokens.createdAt)],
    });

    if (!tokens) {
      return NextResponse.json(
        { hasValidTokens: false, tokens: null },
        { status: 200 }
      );
    }

    // Check if token is expired
    const isExpired = tokens.expiryDate ? new Date(tokens.expiryDate) < new Date() : false;

    if (isExpired) {
      return NextResponse.json(
        { hasValidTokens: false, tokens: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      hasValidTokens: true,
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiryDate: tokens.expiryDate,
      },
    });
  } catch (error) {
    console.error("Error fetching Google tokens:", error);
    return NextResponse.json(
      { hasValidTokens: false, tokens: null },
      { status: 500 }
    );
  }
} 