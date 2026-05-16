import { NextRequest, NextResponse } from "next/server";
import { sendContactFormEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const limit = rateLimit(`contact:${ip}`, 3, 15 * 60 * 1000);
    if (!limit.success) {
      return NextResponse.json({ error: "rate_limit" }, { status: 429 });
    }

    const body = await request.json();

    // Honeypot — real users can't see this field; bots fill it.
    if (typeof body?.website === "string" && body.website.trim() !== "") {
      return NextResponse.json({ success: true });
    }

    // Min submit time — bots submit instantly.
    if (typeof body?.formLoadedAt === "number") {
      const elapsed = Date.now() - body.formLoadedAt;
      if (elapsed < 3000 || elapsed > 24 * 60 * 60 * 1000) {
        return NextResponse.json({ success: true });
      }
    } else {
      return NextResponse.json({ success: true });
    }

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check the form for errors." },
        { status: 400 }
      );
    }
    const { name, email, subject, message } = parsed.data;

    await sendContactFormEmail({ name, email, subject, message });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] POST /contact error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
