import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { requireSuperAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";

export async function POST(request: NextRequest) {
  const auth = await requireSuperAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (!["admin", "super_admin"].includes(role)) {
      return NextResponse.json(
        { error: "Role must be admin or super_admin" },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      isActive: true,
      preferredLanguage: "en",
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
