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
    const user = await User.findById(session.user.id).select("progress").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const completedLessonIds = ((user as any).progress || []).map(
      (p: any) => p.lessonId.toString()
    );
    return NextResponse.json({ data: completedLessonIds });
  } catch (error) {
    console.error("[API] GET /user/progress error:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { lessonId } = await request.json();
    if (!lessonId) {
      return NextResponse.json(
        { error: "lessonId is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if already completed
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const alreadyCompleted = (user as any).progress.some(
      (p: any) => p.lessonId.toString() === lessonId
    );

    if (!alreadyCompleted) {
      (user as any).progress.push({ lessonId, completedAt: new Date() });
      await user.save();
    }

    return NextResponse.json({ message: "Lesson marked as complete" });
  } catch (error) {
    console.error("[API] POST /user/progress error:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
