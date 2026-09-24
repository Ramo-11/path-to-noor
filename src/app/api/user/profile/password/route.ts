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
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const limit = rateLimit(
    `change-password:${session.user.id}:${getClientIp(request.headers)}`,
    5,
    15 * 60 * 1000
  );
  if (!limit.success) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  try {
    const parsed = changePasswordSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }
    const { currentPassword, newPassword } = parsed.data;

    await connectDB();
    const user = await User.findById(session.user.id).select("+password");
    if (!user) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    if (!user.password) {
      return NextResponse.json({ error: "google_account" }, { status: 400 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "wrong_password" }, { status: 400 });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return NextResponse.json({ message: "password_updated" });
  } catch (error) {
    console.error("[API] PUT /user/profile/password error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
