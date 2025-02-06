import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { projectSpreadsheets } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";

export async function DELETE(
  req: Request,
  { params }: { params: { projectId: string; spreadsheetId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await db
      .delete(projectSpreadsheets)
      .where(
        and(
          eq(projectSpreadsheets.projectId, params.projectId),
          eq(projectSpreadsheets.spreadsheetId, params.spreadsheetId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting spreadsheet:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 