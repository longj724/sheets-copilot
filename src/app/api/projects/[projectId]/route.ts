import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { projects } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const updateProjectSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1),
});

export async function PATCH(
  req: Request
) {
  try {

    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json() as z.infer<typeof updateProjectSchema>;
    const validatedData = updateProjectSchema.parse(body);

    // Update project
    const updatedProject = await db
      .update(projects)
      .set({ 
        name: body.name,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(projects.id, validatedData.projectId),
          eq(projects.userId, userId)
        )
      )
      .returning()
      .then(res => res[0]);

    if (!updatedProject) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(updatedProject);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }

    console.error("[PROJECT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 