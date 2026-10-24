import { NextResponse } from "next/server";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { MentorRequest } from "@/db/models/MentorRequest";
import { MentorApplication } from "@/db/models/MentorApplication";

export async function GET() {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    await connectDB();
    const [requests, volunteers] = await Promise.all([
      MentorRequest.countDocuments({ status: "pending" }),
      MentorApplication.countDocuments({ status: "pending" }),
    ]);
    return NextResponse.json({
      data: { requests, volunteers, total: requests + volunteers },
    });
  } catch (error) {
    console.error("[API] GET /admin/attention error:", error);
    return NextResponse.json({ error: "Failed to load counts" }, { status: 500 });
  }
}
