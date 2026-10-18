import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { Lesson } from "@/db/models/Lesson";
import { progressSchema } from "@/lib/validations";

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

    const completedLessonIds = (user.progress || []).map((p) => p.lessonId.toString());
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
    const parsed = progressSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "A valid lesson is required" }, { status: 400 });
    }
    const { lessonId } = parsed.data;

    await connectDB();

    const lessonExists = await Lesson.exists({ _id: lessonId, published: true });
    if (!lessonExists) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const result = await User.updateOne(
      { _id: session.user.id, "progress.lessonId": { $ne: lessonId } },
      { $push: { progress: { lessonId, completedAt: new Date() } } }
    );
    if (result.matchedCount === 0 && !(await User.exists({ _id: session.user.id }))) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
