// External Dependencies
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// Internal Dependencies
import { db } from "~/server/db";
import { projects } from "~/server/db/schema";

const updateProjectSchema = z.object({
  name: z.string().min(1),
});

export async function PATCH(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const  { projectId }= params;

    const body = await req.json() as z.infer<typeof updateProjectSchema>;

    const updatedProject = await db
      .update(projects)
      .set({ 
        name: body.name,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(projects.id, projectId),
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

export async function DELETE(
  req: Request,
  params: { projectId: string }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { projectId } = params

    await db
      .delete(projects)
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.userId, userId)
        )
      );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[PROJECT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 