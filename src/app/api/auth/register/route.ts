import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const limit = rateLimit(`register:${ip}`, 5, 15 * 60 * 1000);
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError =
        Object.values(fieldErrors).flat().find(Boolean) ||
        "Invalid registration data";
      return NextResponse.json(
        { error: firstError, details: fieldErrors },
        { status: 400 }
      );
    }
    const { name, email, password, userType } = parsed.data;

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
      userType,
      isActive: true,
      preferredLanguage: "en",
    });

    return NextResponse.json(
      { message: "Account created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] POST /auth/register error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
