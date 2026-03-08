import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findById(session.user.id)
      .select("name email image preferredLanguage role userType progress bookmarks quizResults completedTopics createdAt")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userAny = user as any;

    return NextResponse.json({
      data: {
        name: userAny.name,
        email: userAny.email,
        image: userAny.image,
        preferredLanguage: userAny.preferredLanguage,
        role: userAny.role,
        userType: userAny.userType,
        lessonsCompleted: userAny.progress?.length || 0,
        bookmarksCount: userAny.bookmarks?.length || 0,
        quizzesCompleted: userAny.quizResults?.length || 0,
        topicsCompleted: userAny.completedTopics?.length || 0,
        joinedAt: userAny.createdAt,
      },
    });
  } catch (error) {
    console.error("[API] GET /user/profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, preferredLanguage } = await request.json();

    const updates: Record<string, string> = {};
    if (name && typeof name === "string" && name.trim().length > 0) {
      updates.name = name.trim();
    }
    if (preferredLanguage === "en" || preferredLanguage === "ar" || preferredLanguage === "es") {
      updates.preferredLanguage = preferredLanguage;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findByIdAndUpdate(session.user.id, updates, {
      new: true,
    }).select("name email preferredLanguage");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: { name: user.name, preferredLanguage: user.preferredLanguage },
      message: "Profile updated",
    });
  } catch (error) {
    console.error("[API] PUT /user/profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
