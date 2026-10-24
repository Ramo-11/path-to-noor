import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { MentorApplication } from "@/db/models/MentorApplication";
import "@/db/models/User";

const STATUSES = ["pending", "approved", "declined"];

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    await connectDB();
    const status = new URL(request.url).searchParams.get("status");
    const filter: Record<string, string> = {};
    if (status && STATUSES.includes(status)) filter.status = status;

    const applications = await MentorApplication.find(filter)
      .populate("userId", "name email userType")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ data: applications });
  } catch (error) {
    console.error("[API] GET /admin/mentor-applications error:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}
