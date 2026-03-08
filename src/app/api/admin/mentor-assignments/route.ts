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
      .select("name email")
      .lean();

    const assignments = await Promise.all(
      mentors.map(async (mentor) => {
        const reverts = await User.find({ assignedMentorId: mentor._id })
          .select("name email")
          .lean();

        if (reverts.length === 0) return null;

        return {
          mentor: { _id: mentor._id, name: mentor.name, email: mentor.email },
          reverts: reverts.map((r) => ({
            _id: r._id,
            name: r.name,
            email: r.email,
          })),
        };
      })
    );

    const filtered = assignments.filter(Boolean);

    return NextResponse.json({ data: filtered });
  } catch (error) {
    console.error("[API] GET /admin/mentor-assignments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentor assignments" },
      { status: 500 }
    );
  }
}
