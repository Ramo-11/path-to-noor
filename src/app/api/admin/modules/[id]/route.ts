import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { Module } from "@/db/models/Module";
import { LearningPath } from "@/db/models/LearningPath";
import { updateModuleSchema } from "@/lib/validations";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  const { id } = await params;

  try {
    await connectDB();
    const module = await Module.findById(id).populate("topics", "name slug");
    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }
    return NextResponse.json({ data: module });
  } catch (error) {
    console.error(`[API] GET /admin/modules/${id} error:`, error);
    return NextResponse.json({ error: "Failed to fetch module" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  const { id } = await params;

  try {
    const body = await request.json();
    const result = updateModuleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await Module.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Check slug uniqueness if slug is being changed
    if (result.data.slug && result.data.slug !== existing.slug) {
      const slugTaken = await Module.findOne({ slug: result.data.slug, _id: { $ne: id } });
      if (slugTaken) {
        return NextResponse.json(
          { error: "A module with this slug already exists" },
          { status: 409 }
        );
      }
    }

    const updated = await Module.findByIdAndUpdate(
      id,
      { $set: result.data },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      data: updated,
      message: "Module updated successfully",
    });
  } catch (error) {
    console.error(`[API] PUT /admin/modules/${id} error:`, error);
    return NextResponse.json(
      { error: "Failed to update module" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  const { id } = await params;

  try {
    await connectDB();

    const module = await Module.findById(id);
    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Check if this module is used in any learning path
    const referencingPaths = await LearningPath.find(
      { "modules.moduleId": id },
      { title: 1 }
    ).lean();

    if (referencingPaths.length > 0) {
      const pathNames = referencingPaths
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((p: any) => `"${p.title?.en || p.title}"`)
        .join(", ");
      return NextResponse.json(
        {
          error: `Cannot delete this module because it is used in: ${pathNames}. Remove it from those learning paths first.`,
        },
        { status: 409 }
      );
    }

    await Module.findByIdAndDelete(id);

    return NextResponse.json({ message: "Module deleted successfully" });
  } catch (error) {
    console.error(`[API] DELETE /admin/modules/${id} error:`, error);
    return NextResponse.json(
      { error: "Failed to delete module" },
      { status: 500 }
    );
  }
}
