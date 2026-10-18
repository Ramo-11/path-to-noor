import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { rateLimitShared, getClientIp } from "@/lib/rate-limit";
import { resetPasswordSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const limit = await rateLimitShared(`reset-password:${ip}`, 5, 15 * 60 * 1000);
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later.", code: "rate_limited" },
        { status: 429 }
      );
    }

    const parsed = resetPasswordSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const code = issue?.path[0] === "password" ? "weak_password" : "invalid_token";
      return NextResponse.json({ error: issue?.message || "Invalid reset request", code }, { status: 400 });
    }
    const { token, password } = parsed.data;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    await connectDB();

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() },
    }).select("+resetToken +resetTokenExpiry +password");

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token", code: "invalid_token" },
        { status: 400 }
      );
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpiry = undefined;
    if (!user.emailVerified) user.emailVerified = new Date();
    await user.save();

    return NextResponse.json({
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("[API] POST /auth/reset-password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password", code: "server_error" },
      { status: 500 }
    );
  }
}
