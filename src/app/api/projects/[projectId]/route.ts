import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { projects } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const routeContextSchema = z.object({
  params: z.object({
    projectId: z.string(),
  }),
});

const updateProjectSchema = z.object({
  name: z.string().min(1),
});

export async function PATCH(
  req: Request,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    // Validate route params
    const { params } = routeContextSchema.parse(context);

    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Parse request body
    const json = await req.json();
    const body = updateProjectSchema.parse(json);

    // Update project
    const updatedProject = await db
      .update(projects)
      .set({ 
        name: body.name,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(projects.id, params.projectId),
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