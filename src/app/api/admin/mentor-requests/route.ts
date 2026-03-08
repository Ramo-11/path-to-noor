import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { MentorRequest } from "@/db/models/MentorRequest";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const filter: Record<string, string> = {};
    if (status) {
      filter.status = status;
    }

    const mentorRequests = await MentorRequest.find(filter)
      .populate("revertId", "name email userType")
      .populate("mentorId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ data: mentorRequests });
  } catch (error) {
    console.error("[API] GET /admin/mentor-requests error:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentor requests" },
      { status: 500 }
    );
  }
}
