import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { rateLimitShared, getClientIp } from "@/lib/rate-limit";
import { verifyEmailSchema } from "@/lib/validations";
import { hashToken } from "../_lib/verification";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const limit = await rateLimitShared(`verify-email:${ip}`, 20, 15 * 60 * 1000);
    if (!limit.success) {
      return NextResponse.json({ error: "Too many attempts", code: "rate_limited" }, { status: 429 });
    }

    const parsed = verifyEmailSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid link", code: "invalid_token" }, { status: 400 });
    }

    await connectDB();
    const hashed = hashToken(parsed.data.token);

    const user = await User.findOne({ emailVerifyToken: hashed }).select(
      "+emailVerifyToken +emailVerifyExpiry"
    );
    if (!user) {
      return NextResponse.json({ error: "Invalid link", code: "invalid_token" }, { status: 400 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ verified: true });
    }

    if (!user.emailVerifyExpiry || user.emailVerifyExpiry.getTime() < Date.now()) {
      return NextResponse.json({ error: "Link expired", code: "expired_token" }, { status: 400 });
    }

    await User.updateOne(
      { _id: user._id },
      { $set: { emailVerified: new Date() } }
    );

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error("[API] POST /auth/verify-email error:", error);
    return NextResponse.json({ error: "Failed to verify email", code: "server_error" }, { status: 500 });
  }
}
