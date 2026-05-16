import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getSiteUrl } from "@/config/env";
import { forgotPasswordSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const limit = rateLimit(`forgot-password:${ip}`, 3, 15 * 60 * 1000); // 3 attempts per 15 min
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const parsed = forgotPasswordSchema.safeParse(await request.json());
    if (!parsed.success) {
      // Always return generic success to prevent enumeration
      return NextResponse.json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }
    const { email } = parsed.data;

    await connectDB();

    // Always return success to prevent email enumeration
    const user = await User.findOne({ email }).select(
      "+resetToken +resetTokenExpiry"
    );

    if (user && user.password) {
      // Only allow reset for credential-based accounts
      const token = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      user.resetToken = hashedToken;
      user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      const siteUrl = getSiteUrl();
      const resetUrl = `${siteUrl}/en/reset-password?token=${token}`;

      await sendPasswordResetEmail(email, user.name, resetUrl);
    }

    // Always return same response to prevent email enumeration
    return NextResponse.json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("[API] POST /auth/forgot-password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
