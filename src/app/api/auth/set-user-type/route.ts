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

    const body = await request.json().catch(() => null);
    const parsed = setUserTypeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 });
    }

    if (parsed.data.userType !== "revert") {
      return NextResponse.json(
        { error: "Mentors join by applying to volunteer." },
        { status: 403 }
      );
    }

    await connectDB();
    await User.updateOne(
      { _id: session.user.id, userType: null },
      { $set: { userType: "revert" } },
      { runValidators: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] POST /auth/set-user-type error:", error);
    return NextResponse.json({ error: "Failed to update user type" }, { status: 500 });
  }
}
