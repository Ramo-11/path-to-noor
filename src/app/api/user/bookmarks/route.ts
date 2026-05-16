import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { bookmarkSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findById(session.user.id).select("bookmarks").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bookmarkIds = ((user as any).bookmarks || []).map(
      (id: { toString(): string }) => id.toString()
    );
    return NextResponse.json({ data: bookmarkIds });
  } catch (error) {
    console.error("[API] GET /user/bookmarks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
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
    const parsed = bookmarkSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid lessonId" },
        { status: 400 }
      );
    }
    const { lessonId } = parsed.data;

    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const alreadyBookmarked = user.bookmarks.some(
      (id) => id.toString() === lessonId
    );

    if (!alreadyBookmarked) {
      user.bookmarks.push(new Types.ObjectId(lessonId));
      await user.save();
    }

    return NextResponse.json({ message: "Bookmark added" });
  } catch (error) {
    console.error("[API] POST /user/bookmarks error:", error);
    return NextResponse.json(
      { error: "Failed to add bookmark" },
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
    const parsed = bookmarkSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid lessonId" },
        { status: 400 }
      );
    }
    const { lessonId } = parsed.data;

    await connectDB();
    await User.findByIdAndUpdate(session.user.id, {
      $pull: { bookmarks: lessonId },
    });

    return NextResponse.json({ message: "Bookmark removed" });
  } catch (error) {
    console.error("[API] DELETE /user/bookmarks error:", error);
    return NextResponse.json(
      { error: "Failed to remove bookmark" },
      { status: 500 }
    );
  }
}
