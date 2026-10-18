import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { requireSuperAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { createSystemUserSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const auth = await requireSuperAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    const parsed = createSystemUserSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid system user data" },
        { status: 400 }
      );
    }
    const { name, email, password, role } = parsed.data;

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name,
      email: email,
      password: hashedPassword,
      role,
      isActive: true,
      preferredLanguage: "en",
      emailVerified: new Date(),
    });

    return NextResponse.json(
      {
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
        message: "System user created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] POST /admin/system-users error:", error);
    return NextResponse.json(
      { error: "Failed to create system user" },
      { status: 500 }
    );
  }
}
