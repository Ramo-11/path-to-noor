import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { isValidId, issueSetPasswordLink } from "../../_lib/shared";

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
    const user = await User.findOne({ _id: id, role: "user" })
      .select("email name preferredLanguage")
      .lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    try {
      await issueSetPasswordLink(id, user.email, user.name, user.preferredLanguage, "reset");
    } catch (error) {
      console.error("[API] admin password reset email failed:", error);
      return NextResponse.json(
        { error: "The email could not be sent. Please try again in a moment." },
        { status: 502 }
      );
    }
    return NextResponse.json({ message: `Password reset email sent to ${user.email}` });
  } catch (error) {
    console.error("[API] POST /admin/users/[id]/reset error:", error);
    return NextResponse.json({ error: "Failed to send password reset" }, { status: 500 });
  }
}
