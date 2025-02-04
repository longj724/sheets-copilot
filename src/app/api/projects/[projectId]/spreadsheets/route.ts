import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { projectSpreadsheets } from "~/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { spreadsheetId, spreadsheetName, accessToken, refreshToken, tokenExpiryDate } = await request.json();

    // Validate required fields
    if (!spreadsheetId || !spreadsheetName || !accessToken) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if spreadsheet already exists for this project
    const existingSpreadsheet = await db
      .select()
      .from(projectSpreadsheets)
      .where(eq(projectSpreadsheets.projectId, params.projectId))
      .where(eq(projectSpreadsheets.spreadsheetId, spreadsheetId));

    if (existingSpreadsheet.length > 0) {
      return NextResponse.json(
        { error: "Spreadsheet already exists in this project" },
        { status: 400 }
      );
    }

    // Save the spreadsheet
    const [spreadsheet] = await db
      .insert(projectSpreadsheets)
      .values({
        projectId: params.projectId,
        spreadsheetId,
        spreadsheetName,
        accessToken,
        refreshToken,
        tokenExpiryDate: tokenExpiryDate ? new Date(tokenExpiryDate as string) : null,
      })
      .returning();

    return NextResponse.json(spreadsheet);
  } catch (error) {
    console.error("Error saving spreadsheet:", error);
    return NextResponse.json(
      { error: "Failed to save spreadsheet" },
      { status: 500 }
    );
  }
} 