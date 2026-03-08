import { NextResponse } from "next/server";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";

export async function GET() {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    await connectDB();

    const mentors = await User.find({ userType: "mentor" })
      .select("_id name email")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ data: mentors });
  } catch (error) {
    console.error("[API] GET /admin/mentors error:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentors" },
      { status: 500 }
    );
  }
}
