// External Dependencies
import { db } from "~/server/db";
import { projectSpreadsheets } from "~/server/db/schema";

// Internal Dependencies
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { and, eq} from "drizzle-orm";

const CreateSpreadsheetSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  spreadsheetName: z.string().min(1, "Spreadsheet name is required"),
  accessToken: z.string().min(1, "Access token is required"),
  refreshToken: z.string().optional(),
  tokenExpiryDate: z.number().optional(),
});

export async function POST(
  request: Request,
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as z.infer<typeof CreateSpreadsheetSchema>;
    const validatedData = CreateSpreadsheetSchema.parse(body);

    const existingSpreadsheet = await db
      .select()
      .from(projectSpreadsheets)
      .where(
        and(
          eq(projectSpreadsheets.projectId, validatedData.projectId),
          eq(projectSpreadsheets.spreadsheetId, validatedData.spreadsheetId)
        )
      );

    if (existingSpreadsheet.length > 0) {
      return NextResponse.json(
        { error: "Spreadsheet already exists in this project" },
        { status: 400 }
      );
    }

    const [spreadsheet] = await db
      .insert(projectSpreadsheets)
      .values({
        projectId: validatedData.projectId,
        spreadsheetId: validatedData.spreadsheetId,
        spreadsheetName: validatedData.spreadsheetName,
        accessToken: validatedData.accessToken,
        refreshToken: validatedData.refreshToken ?? null,
        tokenExpiryDate: validatedData.tokenExpiryDate 
          ? new Date(validatedData.tokenExpiryDate) 
          : null,
      })
      .returning();

    return NextResponse.json(spreadsheet);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Validation Failed", 
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        }, 
        { status: 400 }
      );
    }

    console.error("Error saving spreadsheet:", error);
    return NextResponse.json(
      { error: "Failed to save spreadsheet" },
      { status: 500 }
    );
  }
}