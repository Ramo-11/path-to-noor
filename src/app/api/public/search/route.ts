import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth-config";
import { searchPublicLessons } from "@/lib/data";
import { rateLimitShared, getClientIp } from "@/lib/rate-limit";

const searchSchema = z.object({
  q: z.string().trim().min(2).max(80),
  locale: z.enum(["en", "ar", "es"]).default("en"),
});

export async function GET(request: NextRequest) {
  const limit = await rateLimitShared(`search:${getClientIp(request.headers)}`, 60, 60 * 1000);
  if (!limit.success) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const params = request.nextUrl.searchParams;
  const parsed = searchSchema.safeParse({
    q: params.get("q") ?? "",
    locale: params.get("locale") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  try {
    const session = await auth();
    const results = await searchPublicLessons(parsed.data.q, parsed.data.locale, session?.user);
    return NextResponse.json(
      { data: { results } },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("[API] GET /public/search error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
