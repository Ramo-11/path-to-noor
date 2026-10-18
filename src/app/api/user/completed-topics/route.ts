import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { Types } from "mongoose";
import { User } from "@/db/models/User";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findById(session.user.id)
      .select("completedTopics")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const topicIds = (user.completedTopics || []).map((ct) =>
      ct.topicId.toString()
    );
    return NextResponse.json({ data: topicIds });
  } catch (error) {
    console.error("[API] GET /user/completed-topics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch completed topics" },
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
    const body = await request.json().catch(() => null);
    const topicId = body?.topicId;
    if (typeof topicId !== "string" || !Types.ObjectId.isValid(topicId)) {
      return NextResponse.json(
        { error: "topicId is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const result = await User.updateOne(
      { _id: session.user.id, "completedTopics.topicId": { $ne: new Types.ObjectId(topicId) } },
      { $push: { completedTopics: { topicId, completedAt: new Date() } } }
    );
    if (result.matchedCount === 0 && !(await User.exists({ _id: session.user.id }))) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Topic marked as complete" });
  } catch (error) {
    console.error("[API] POST /user/completed-topics error:", error);
    return NextResponse.json(
      { error: "Failed to update completed topics" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    const topicId = body?.topicId;
    if (typeof topicId !== "string" || !Types.ObjectId.isValid(topicId)) {
      return NextResponse.json(
        { error: "topicId is required" },
        { status: 400 }
      );
    }

    await connectDB();
    await User.findByIdAndUpdate(session.user.id, {
      $pull: { completedTopics: { topicId } },
    });

    return NextResponse.json({ message: "Topic removed from completed" });
  } catch (error) {
    console.error("[API] DELETE /user/completed-topics error:", error);
    return NextResponse.json(
      { error: "Failed to remove completed topic" },
      { status: 500 }
    );
  }
}
