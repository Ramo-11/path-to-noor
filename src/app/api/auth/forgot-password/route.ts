import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimitShared, getClientIp } from "@/lib/rate-limit";
import { checkBot } from "@/lib/bot-guard";
import { getSiteUrl } from "@/config/env";
import { forgotPasswordSchema } from "@/lib/validations";

const GENERIC = "If an account with that email exists, a password reset link has been sent.";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const limit = await rateLimitShared(`forgot-password:${ip}`, 5, 15 * 60 * 1000);
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later.", code: "rate_limited" },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const verdict = await checkBot(body, request, "forgot-password");
    if (verdict === "bot") return NextResponse.json({ message: GENERIC });
    if (verdict === "challenge_failed") {
      return NextResponse.json(
        { error: "Verification failed", code: "verification_failed" },
        { status: 400 }
      );
    }

    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      // Always return generic success to prevent enumeration
      return NextResponse.json({ message: GENERIC });
    }
    const { email, locale } = parsed.data;
    const emailLimit = await rateLimitShared(`forgot-password-email:${email}`, 3, 60 * 60 * 1000);
    if (!emailLimit.success) {
      return NextResponse.json({ message: GENERIC });
    }

    await connectDB();

    // Always return success to prevent email enumeration
    const user = await User.findOne({ email }).select(
      "+password +resetToken +resetTokenExpiry"
    );

    if (user && user.password) {
      // Only allow reset for credential-based accounts
      const token = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      user.resetToken = hashedToken;
      user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();

      const siteUrl = getSiteUrl();
      const resetUrl = `${siteUrl}/${locale}/reset-password?token=${token}`;

      await sendPasswordResetEmail(email, user.name, resetUrl, locale).catch((error) =>
        console.error("[API] password reset email failed:", error)
      );
    }

    // Always return same response to prevent email enumeration
    return NextResponse.json({ message: GENERIC });
  } catch (error) {
    console.error("[API] POST /auth/forgot-password error:", error);
    return NextResponse.json(
      { error: "Failed to process request", code: "server_error" },
      { status: 500 }
    );
  }
}
