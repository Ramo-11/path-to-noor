import { getClientIp } from "@/lib/rate-limit";

const MIN_FILL_MS = 2000;
const MAX_FILL_MS = 24 * 60 * 60 * 1000;
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type BotVerdict = "ok" | "bot" | "challenge_failed";

function clean(value: string | undefined): string {
  return (value ?? "").trim();
}

export function turnstileActive(): boolean {
  return clean(process.env.TURNSTILE_SECRET_KEY) !== "" && clean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) !== "";
}

async function verifyTurnstile(token: unknown, ip: string): Promise<boolean> {
  if (typeof token !== "string" || token.length < 5 || token.length > 4096) return false;
  const form = new URLSearchParams();
  form.set("secret", clean(process.env.TURNSTILE_SECRET_KEY));
  form.set("response", token);
  if (ip !== "unknown") form.set("remoteip", ip);
  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;
    const json = (await res.json().catch(() => null)) as { success?: boolean } | null;
    return json?.success === true;
  } catch {
    return false;
  }
}

export async function checkBot(
  body: unknown,
  request: { headers: Headers },
  route: string
): Promise<BotVerdict> {
  const ip = getClientIp(request.headers);
  const data = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;

  if (typeof data.website === "string" && data.website.trim() !== "") {
    console.warn(`[bot-guard] ${route} honeypot ip=${ip}`);
    return "bot";
  }

  const startedAt = data.formStartedAt;
  if (typeof startedAt !== "number" || !Number.isFinite(startedAt)) {
    console.warn(`[bot-guard] ${route} missing start time ip=${ip}`);
    return "bot";
  }
  const elapsed = Date.now() - startedAt;
  if (elapsed < MIN_FILL_MS || elapsed > MAX_FILL_MS) {
    console.warn(`[bot-guard] ${route} fill time ${elapsed}ms ip=${ip}`);
    return "bot";
  }

  if (turnstileActive()) {
    const ok = await verifyTurnstile(data.turnstileToken, ip);
    if (!ok) {
      console.warn(`[bot-guard] ${route} turnstile failed ip=${ip}`);
      return "challenge_failed";
    }
  }

  return "ok";
}

export function canonicalEmail(email: string): string {
  const lower = email.trim().toLowerCase();
  const at = lower.lastIndexOf("@");
  if (at < 1) return lower;
  let local = lower.slice(0, at);
  let domain = lower.slice(at + 1);
  if (domain === "gmail.com" || domain === "googlemail.com") {
    domain = "gmail.com";
    local = local.split("+")[0].replace(/\./g, "");
  }
  return `${local}@${domain}`;
}

export function looksGibberish(rawName: string): boolean {
  const name = rawName.trim();
  if (name.length < 12 || /[\s\-'.]/.test(name)) return false;
  if (!/^[A-Za-z]+$/.test(name)) return false;
  let upperAfterLower = 0;
  for (let i = 1; i < name.length; i++) {
    if (/[a-z]/.test(name[i - 1]) && /[A-Z]/.test(name[i])) upperAfterLower++;
  }
  const vowels = (name.match(/[aeiouAEIOU]/g) ?? []).length;
  const ratio = vowels / name.length;
  if (upperAfterLower >= 4) return true;
  if (upperAfterLower >= 3 && ratio < 0.3) return true;
  return false;
}
