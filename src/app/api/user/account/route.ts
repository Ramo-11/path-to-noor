import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { MentorRequest } from "@/db/models/MentorRequest";
import { rateLimitShared, getClientIp } from "@/lib/rate-limit";

const deleteAccountSchema = z.object({
  confirm: z.string().trim().min(1).max(254),
  password: z.string().min(1).max(128).optional(),
});

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const limit = await rateLimitShared(
    `delete-account:${session.user.id}:${getClientIp(request.headers)}`,
    5,
    15 * 60 * 1000
  );
  if (!limit.success) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  try {
    const parsed = deleteAccountSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }
    const { confirm, password } = parsed.data;

    await connectDB();
    const user = await User.findById(session.user.id).select("+password email role");
    if (!user) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    if (user.role === "admin" || user.role === "super_admin") {
      return NextResponse.json({ error: "admin_blocked" }, { status: 403 });
    }

    const confirmed =
      confirm.toUpperCase() === "DELETE" || confirm.toLowerCase() === user.email.toLowerCase();
    if (!confirmed) {
      return NextResponse.json({ error: "confirm_mismatch" }, { status: 400 });
    }

    if (user.password) {
      if (!password) {
        return NextResponse.json({ error: "password_required" }, { status: 400 });
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return NextResponse.json({ error: "wrong_password" }, { status: 400 });
      }
    }

    const userId = user._id;
    await MentorRequest.deleteMany({ revertId: userId });
    await MentorRequest.updateMany(
      { mentorId: userId, status: "assigned" },
      { $set: { mentorId: null, status: "pending" } }
    );
    await MentorRequest.updateMany({ mentorId: userId }, { $set: { mentorId: null } });
    await User.updateMany({ assignedMentorId: userId }, { $unset: { assignedMentorId: 1 } });
    await User.deleteOne({ _id: userId });

    return NextResponse.json({ message: "account_deleted" });
  } catch (error) {
    console.error("[API] DELETE /user/account error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
