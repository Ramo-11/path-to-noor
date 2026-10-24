import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { adminBulkDeleteSchema } from "@/lib/validations";
import { deleteLearners } from "../_lib/shared";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    const parsed = adminBulkDeleteSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Select at least one user" },
        { status: 400 }
      );
    }
    await connectDB();
    const deleted = await deleteLearners(Array.from(new Set(parsed.data.ids)));
    return NextResponse.json({ deleted });
  } catch (error) {
    console.error("[API] POST /admin/users/bulk-delete error:", error);
    return NextResponse.json({ error: "Failed to delete users" }, { status: 500 });
  }
}
