import { NextResponse } from "next/server";
import { connectDB } from "@/db/connection";
import { Lesson } from "@/db/models/Lesson";
import { getLessonNavigationContext } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    await connectDB();

    const lesson = await Lesson.findOne({ slug, published: true })
      .select("_id")
      .lean();

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lessonAny = lesson as any;
    const navContext = await getLessonNavigationContext(
      lessonAny._id.toString(),
      "en"
    );

    if (!navContext) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({
      data: {
        nextLesson: navContext.nextLesson,
        previousLesson: navContext.previousLesson,
        path: navContext.path,
        module: navContext.module,
      },
    });
  } catch (error) {
    console.error("[API] GET /public/lesson-nav/[slug] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch navigation context" },
      { status: 500 }
    );
  }
}
