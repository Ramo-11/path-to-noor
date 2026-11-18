import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth-config";
import { getPublicTopicBySlug } from "@/lib/data";
import { getCompletedLessonIds } from "@/lib/learning";
import { routing } from "@/i18n/routing";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { buildSubjectContent } from "@/components/library/library-data";
import type { SubjectMePayload } from "@/components/library/library-types";

const HEADERS = { "Cache-Control": "private, no-store" };

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const requested = request.nextUrl.searchParams.get("locale") ?? "";
  const locale = routing.locales.find((value) => value === requested) ?? routing.defaultLocale;

  const session = await auth();
  const user = session?.user;
  if (!user?.id) {
    const guest: SubjectMePayload = { signedIn: false };
    return NextResponse.json(guest, { headers: HEADERS });
  }

  try {
    const topic = await getPublicTopicBySlug(slug);
    if (!topic) {
      return NextResponse.json({ error: "Subject not found." }, { status: 404, headers: HEADERS });
    }
    const topicId = topic._id.toString();
    await connectDB();
    const [content, completedLessonIds, record] = await Promise.all([
      buildSubjectContent(topicId, { userType: user.userType, isGuest: false }, locale),
      getCompletedLessonIds(user.id),
      User.findById(user.id).select("completedTopics").lean(),
    ]);
    const isLearned = (
      (record as { completedTopics?: { topicId?: { toString(): string } }[] } | null)?.completedTopics || []
    ).some((entry) => entry.topicId?.toString() === topicId);
    const payload: SubjectMePayload = {
      signedIn: true,
      content,
      completedLessonIds: [...completedLessonIds],
      isLearned,
    };
    return NextResponse.json(payload, { headers: HEADERS });
  } catch (error) {
    console.error("[API] GET /me/library/[slug] error:", error);
    return NextResponse.json(
      { error: "We could not load this subject. Please try again." },
      { status: 500, headers: HEADERS }
    );
  }
}
