import { NextRequest, NextResponse } from "next/server";
import { sendContactFormEmail } from "@/lib/email";
import { rateLimitShared, getClientIp } from "@/lib/rate-limit";
import { checkBot } from "@/lib/bot-guard";
import { contactSchema, CONTACT_TOPICS } from "@/lib/validations";

const TOPIC_LABELS: Record<(typeof CONTACT_TOPICS)[number], string> = {
  question: "Question",
  mentor: "Mentor request",
  technical: "Technical issue",
  feedback: "Feedback or lesson correction",
  other: "Other",
};

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const limit = await rateLimitShared(`contact:${ip}`, 3, 15 * 60 * 1000);
    if (!limit.success) {
      return NextResponse.json({ error: "rate_limit" }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }

    const verdict = await checkBot(body, request, "contact");
    if (verdict === "bot") return NextResponse.json({ success: true });
    if (verdict === "challenge_failed") {
      return NextResponse.json({ error: "verification_failed" }, { status: 400 });
    }

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check the form for errors." },
        { status: 400 }
      );
    }
    const { name, email, subject, message, topic } = parsed.data;
    const label = topic === "other" ? subject.replace(/[\r\n]+/g, " ") : TOPIC_LABELS[topic];

    await sendContactFormEmail({ name, email, subject: label, message });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] POST /contact error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
