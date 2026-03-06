import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import "@/db/models/Lesson";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findById(session.user.id)
      .select("bookmarks")
      .populate({
        path: "bookmarks",
        select: "title slug estimatedMinutes",
        match: { published: true },
      })
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bookmarks = ((user as any).bookmarks || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((lesson: any) => lesson && typeof lesson === "object" && lesson._id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((lesson: any) => ({
        _id: lesson._id.toString(),
        title: lesson.title,
        slug: lesson.slug,
        estimatedMinutes: lesson.estimatedMinutes,
      }));

    return NextResponse.json({ data: bookmarks });
  } catch (error) {
    console.error("[API] GET /user/bookmarks/details error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}
