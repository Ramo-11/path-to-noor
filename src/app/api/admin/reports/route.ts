import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { LessonReport } from "@/db/models/LessonReport";
import { Lesson } from "@/db/models/Lesson";

const querySchema = z.object({
  status: z.enum(["open", "resolved", "all"]).default("open"),
  limit: z.coerce.number().int().min(1).max(200).default(100),
});

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }
    const { status, limit } = parsed.data;

    await connectDB();

    const filter: Record<string, string> = status === "all" ? { kind: "report" } : { kind: "report", status };
    const [reports, openCount, resolvedCount, tallies] = await Promise.all([
      LessonReport.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("lessonId", "title slug")
        .lean(),
      LessonReport.countDocuments({ kind: "report", status: "open" }),
      LessonReport.countDocuments({ kind: "report", status: "resolved" }),
      LessonReport.aggregate([
        { $match: { kind: { $in: ["helpful", "not_helpful"] } } },
        { $group: { _id: { lessonId: "$lessonId", kind: "$kind" }, count: { $sum: 1 } } },
      ]),
    ]);

    const byLesson = new Map<string, { helpful: number; notHelpful: number }>();
    for (const row of tallies) {
      const id = String(row._id.lessonId);
      const entry = byLesson.get(id) ?? { helpful: 0, notHelpful: 0 };
      if (row._id.kind === "helpful") entry.helpful = row.count;
      else entry.notHelpful = row.count;
      byLesson.set(id, entry);
    }

    const lessonIds = [...byLesson.keys()];
    const lessons = await Lesson.find({ _id: { $in: lessonIds } })
      .select("title slug")
      .lean();
    const lessonById = new Map(lessons.map((lesson) => [String(lesson._id), lesson]));

    const feedback = [...byLesson.entries()]
      .map(([id, counts]) => {
        const lesson = lessonById.get(id);
        return {
          lessonId: id,
          slug: lesson?.slug ?? "",
          title: lesson?.title?.en ?? "Deleted lesson",
          ...counts,
        };
      })
      .sort((a, b) => b.notHelpful - a.notHelpful || b.helpful - a.helpful);

    return NextResponse.json({ data: reports, feedback, counts: { open: openCount, resolved: resolvedCount } });
  } catch (error) {
    console.error("[API] GET /admin/reports error:", error);
    return NextResponse.json({ error: "Failed to load reports" }, { status: 500 });
  }
}
