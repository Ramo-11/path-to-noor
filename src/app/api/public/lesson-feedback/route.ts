import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { Lesson } from "@/db/models/Lesson";
import { LessonReport, REPORT_REASONS } from "@/db/models/LessonReport";
import { getClientIp, rateLimitShared } from "@/lib/rate-limit";

const feedbackSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.enum(["helpful", "not_helpful"]),
    lessonSlug: z.string().trim().min(1).max(200),
    locale: z.enum(["en", "ar", "es"]),
    website: z.string().max(200).optional(),
  }),
  z.object({
    kind: z.literal("report"),
    lessonSlug: z.string().trim().min(1).max(200),
    locale: z.enum(["en", "ar", "es"]),
    reason: z.enum(REPORT_REASONS),
    note: z.string().trim().max(1000).optional(),
    website: z.string().max(200).optional(),
  }),
]);

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const limit = await rateLimitShared(`lesson-feedback:${ip}`, 12, 15 * 60 * 1000);
    if (!limit.success) {
      return NextResponse.json({ error: "rate_limit" }, { status: 429 });
    }

    const body = await request.json().catch(() => null);

    if (typeof body?.website === "string" && body.website.trim() !== "") {
      return NextResponse.json({ success: true });
    }

    const parsed = feedbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    const data = parsed.data;

    await connectDB();
    const lesson = await Lesson.findOne({ slug: data.lessonSlug.toLowerCase(), published: true })
      .select("_id slug")
      .lean();
    if (!lesson) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const session = await auth();
    const userId = session?.user?.id;

    await LessonReport.create({
      lessonId: lesson._id,
      lessonSlug: lesson.slug,
      locale: data.locale,
      kind: data.kind,
      reason: data.kind === "report" ? data.reason : undefined,
      note: data.kind === "report" && data.note ? data.note : undefined,
      userId: userId && /^[a-f\d]{24}$/i.test(userId) ? userId : undefined,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("[API] POST /public/lesson-feedback error:", error);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
