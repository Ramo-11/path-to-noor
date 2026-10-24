import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { MentorApplication } from "@/db/models/MentorApplication";
import { User } from "@/db/models/User";
import { sendMentorApprovedEmail } from "@/lib/email";

const decisionSchema = z.object({
  status: z.enum(["approved", "declined"]),
  adminNote: z.string().trim().max(1000).optional(),
});

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

    const parsed = decisionSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    await connectDB();
    const application = await MentorApplication.findById(id);
    if (!application) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    application.status = parsed.data.status;
    application.adminNote = parsed.data.adminNote ?? "";
    await application.save();

    if (parsed.data.status === "approved") {
      const user = await User.findByIdAndUpdate(
        application.userId,
        { userType: "mentor" },
        { new: true }
      )
        .select("name email preferredLanguage")
        .lean();
      if (user?.email) {
        await sendMentorApprovedEmail(user.email, user.name, user.preferredLanguage).catch((e) =>
          console.error("[API] approve email failed:", e)
        );
      }
    }

    return NextResponse.json({ data: application });
  } catch (error) {
    console.error("[API] PUT /admin/mentor-applications/[id] error:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}
