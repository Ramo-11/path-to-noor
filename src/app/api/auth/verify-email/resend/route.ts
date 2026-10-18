import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { rateLimitShared, getClientIp } from "@/lib/rate-limit";
import { localeSchema } from "@/lib/validations";
import { issueVerification } from "../../_lib/verification";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
    }

    const ip = getClientIp(request.headers);
    const userLimit = await rateLimitShared(`verify-resend:${session.user.id}`, 3, 60 * 60 * 1000);
    const ipLimit = await rateLimitShared(`verify-resend-ip:${ip}`, 10, 60 * 60 * 1000);
    if (!userLimit.success || !ipLimit.success) {
      return NextResponse.json({ error: "Too many requests", code: "rate_limited" }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const locale = localeSchema.catch("en").parse(body?.locale);

    await connectDB();
    const user = await User.findById(session.user.id).select("email name emailVerified isActive");
    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
    }
    if (user.emailVerified) {
      return NextResponse.json({ verified: true });
    }

    await issueVerification(user._id.toString(), user.email, user.name, locale);
    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("[API] POST /auth/verify-email/resend error:", error);
    return NextResponse.json({ error: "Failed to send email", code: "server_error" }, { status: 500 });
  }
}
