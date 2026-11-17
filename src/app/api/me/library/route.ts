import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth-config";
import { getCompletedLessonIds } from "@/lib/learning";
import { routing } from "@/i18n/routing";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { buildLibrarySubjects } from "@/components/library/library-data";
import type { LibraryMePayload } from "@/components/library/library-types";

const HEADERS = { "Cache-Control": "private, no-store" };

export async function GET(request: NextRequest) {
  const requested = request.nextUrl.searchParams.get("locale") ?? "";
  const locale = routing.locales.find((value) => value === requested) ?? routing.defaultLocale;

  const session = await auth();
  const user = session?.user;
  if (!user?.id) {
    const guest: LibraryMePayload = { signedIn: false };
    return NextResponse.json(guest, { headers: HEADERS });
  }

  try {
    await connectDB();
    const [completedLessonIds, record] = await Promise.all([
      getCompletedLessonIds(user.id),
      User.findById(user.id).select("completedTopics").lean(),
    ]);
    const learnedTopicIds = new Set(
      (
        (record as { completedTopics?: { topicId?: { toString(): string } }[] } | null)?.completedTopics || []
      ).map((entry) => entry.topicId?.toString() ?? "")
    );
    const subjects = await buildLibrarySubjects(
      { userType: user.userType, isGuest: false },
      locale,
      completedLessonIds,
      learnedTopicIds
    );
    const payload: LibraryMePayload = { signedIn: true, subjects };
    return NextResponse.json(payload, { headers: HEADERS });
  } catch (error) {
    console.error("[API] GET /me/library error:", error);
    return NextResponse.json(
      { error: "We could not load the library. Please try again." },
      { status: 500, headers: HEADERS }
    );
  }
}
