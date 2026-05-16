import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { changePasswordSchema } from "@/lib/validations";

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = rateLimit(
    `change-password:${session.user.id}:${getClientIp(request.headers)}`,
    5,
    15 * 60 * 1000
  );
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const parsed = changePasswordSchema.safeParse(await request.json());
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError =
        Object.values(fieldErrors).flat().find(Boolean) ||
        "Invalid password change request";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }
    const { currentPassword, newPassword } = parsed.data;

    await connectDB();
    const user = await User.findById(session.user.id).select("+password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "This account uses social login. Password cannot be changed." },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("[API] PUT /user/profile/password error:", error);
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    );
  }
}
