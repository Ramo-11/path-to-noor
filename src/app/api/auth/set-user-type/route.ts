import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { setUserTypeSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = setUserTypeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid user type" },
        { status: 400 }
      );
    }

    await connectDB();
    await User.findByIdAndUpdate(session.user.id, {
      userType: parsed.data.userType,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] POST /auth/set-user-type error:", error);
    return NextResponse.json(
      { error: "Failed to update user type" },
      { status: 500 }
    );
  }
}
