import { NextRequest, NextResponse } from "next/server";
import { sendContactFormEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const limit = rateLimit(`contact:${ip}`, 3, 15 * 60 * 1000);
    if (!limit.success) {
      return NextResponse.json(
        { error: "rate_limit" },
        { status: 429 }
      );
    }

    const { name, email, subject, message, website, formLoadedAt } = await request.json();

    // Honeypot — real users can't see this field; bots fill it.
    if (typeof website === "string" && website.trim() !== "") {
      return NextResponse.json({ success: true });
    }

    // Min submit time — bots submit instantly.
    if (typeof formLoadedAt === "number") {
      const elapsed = Date.now() - formLoadedAt;
      if (elapsed < 3000 || elapsed > 24 * 60 * 60 * 1000) {
        return NextResponse.json({ success: true });
      }
    } else {
      return NextResponse.json({ success: true });
    }

    if (
      !name ||
      !email ||
      !subject ||
      !message ||
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof subject !== "string" ||
      typeof message !== "string"
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (name.length > 100 || email.length > 254 || subject.length > 200 || message.length > 5000) {
      return NextResponse.json(
        { error: "Input too long" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email" },
        { status: 400 }
      );
    }

    await sendContactFormEmail({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] POST /contact error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
