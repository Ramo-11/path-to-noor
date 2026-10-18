import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(80),
  preferredLanguage: z.enum(["en", "ar", "es"]),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findById(session.user.id)
      .select("name email preferredLanguage userType +password")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        name: user.name,
        email: user.email,
        preferredLanguage: user.preferredLanguage,
        userType: user.userType,
        hasPassword: Boolean(user.password),
      },
    });
  } catch (error) {
    console.error("[API] GET /user/profile error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const parsed = updateProfileSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { name: parsed.data.name, preferredLanguage: parsed.data.preferredLanguage },
      { new: true }
    ).select("name preferredLanguage");

    if (!user) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({
      data: { name: user.name, preferredLanguage: user.preferredLanguage },
    });
  } catch (error) {
    console.error("[API] PUT /user/profile error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
