import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { LessonReport } from "@/db/models/LessonReport";

const updateSchema = z.object({ status: z.enum(["open", "resolved"]) });

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const parsed = updateSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    await connectDB();
    const report = await LessonReport.findOneAndUpdate(
      { _id: id, kind: "report" },
      { status: parsed.data.status },
      { new: true }
    ).lean();
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ data: report, message: "Report updated" });
  } catch (error) {
    console.error("[API] PUT /admin/reports/[id] error:", error);
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}
