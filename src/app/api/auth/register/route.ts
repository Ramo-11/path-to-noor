import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { rateLimitShared, getClientIp } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validations";
import { sendAccountExistsEmail } from "@/lib/email";
import { getSiteUrl } from "@/config/env";
import { issueVerification } from "../_lib/verification";

const NEUTRAL = { message: "Check your email to finish creating your account", code: "check_email" };

function errorCode(paths: PropertyKey[]): string {
  const field = paths[0];
  if (field === "password") return "weak_password";
  if (field === "email") return "invalid_email";
  if (field === "name") return "invalid_name";
  return "invalid_input";
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const limit = await rateLimitShared(`register:${ip}`, 5, 15 * 60 * 1000);
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later.", code: "rate_limited" },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { error: issue?.message || "Invalid registration data", code: errorCode(issue?.path ?? []) },
        { status: 400 }
      );
    }
    const { name, email, password, userType, locale } = parsed.data;

    await connectDB();

    const hashedPassword = await bcrypt.hash(password, 12);

    const existingUser = await User.findOne({ email }).select("name");
    if (existingUser) {
      const noticeLimit = await rateLimitShared(`register-notice:${email}`, 1, 60 * 60 * 1000);
      if (noticeLimit.success) {
        await sendAccountExistsEmail(
          email,
          existingUser.name,
          `${getSiteUrl()}/${locale}/login`,
          locale
        ).catch((error) => console.error("[API] account exists notice failed:", error));
      }
      return NextResponse.json(NEUTRAL, { status: 201 });
    }

    let created;
    try {
      created = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "user",
        userType,
        isActive: true,
        preferredLanguage: locale,
        emailVerified: null,
      });
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        return NextResponse.json(NEUTRAL, { status: 201 });
      }
      throw error;
    }

    await issueVerification(created._id.toString(), email, name, locale).catch((error) =>
      console.error("[API] verification email failed:", error)
    );

    return NextResponse.json(NEUTRAL, { status: 201 });
  } catch (error) {
    console.error("[API] POST /auth/register error:", error);
    return NextResponse.json(
      { error: "Failed to create account", code: "server_error" },
      { status: 500 }
    );
  }
}
