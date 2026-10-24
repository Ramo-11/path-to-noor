import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { isValidId } from "../../_lib/shared";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    await connectDB();
    const result = await User.updateOne(
      { _id: id, role: "user" },
      { $set: { emailVerified: new Date() }, $unset: { emailVerifyToken: 1, emailVerifyExpiry: 1 } }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Email marked as verified" });
  } catch (error) {
    console.error("[API] POST /admin/users/[id]/verify error:", error);
    return NextResponse.json({ error: "Failed to verify email" }, { status: 500 });
  }
}
