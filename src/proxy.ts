import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

const isDev = process.env.NODE_ENV !== "production";

function buildCsp(nonce: string): string {
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com https://challenges.cloudflare.com${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com https://placehold.co https://www.google-analytics.com https://www.googletagmanager.com",
    "font-src 'self' data:",
    "media-src 'self' blob: https://res.cloudinary.com",
    "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://challenges.cloudflare.com",
    "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://challenges.cloudflare.com",
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://accounts.google.com",
    "frame-ancestors 'none'",
  ];
  if (!isDev) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

const HIDDEN_PATH = /^\/\.(?!well-known(?:\/|$))/;
const PROBE_DIR =
  /^\/(?:wp-[\w-]+|wordpress|xmlrpc|vendor|phpunit|cgi-bin|actuator|_ignition|geoserver|phpmyadmin|@fs|@vite)(?:[/.]|$)/i;
const PROBE_FILE =
  /(?:\.(?:php\d?|aspx?|jsp|cgi|env(?:\.[\w.-]+)?|sql|ya?ml|ini|log|bak|old|save|swp|toml|conf|config|sh|ps1)|~)$/i;
const ADMIN_PATH = /^\/admin(?:\/|$)/;
const SESSION_COOKIE = /^(?:__Secure-)?(?:authjs|next-auth)\.session-token(?:\.\d+)?$/;
const HINT_COOKIE = "bd_auth";
const APP_PATH = /^\/(?!api(?:\/|$)|_next|_vercel)[^.]*$/;

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (HIDDEN_PATH.test(pathname) || PROBE_DIR.test(pathname) || PROBE_FILE.test(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  if (!ADMIN_PATH.test(pathname) && !APP_PATH.test(pathname)) return NextResponse.next();

  if (!ADMIN_PATH.test(pathname)) {
    const response = intlMiddleware(request);
    const hasSession = request.cookies.getAll().some(({ name }) => SESSION_COOKIE.test(name));
    const hinted = request.cookies.get(HINT_COOKIE)?.value === "1";
    if (hasSession && !hinted) {
      response.cookies.set(HINT_COOKIE, "1", {
        path: "/",
        sameSite: "lax",
        secure: !isDev,
        maxAge: 60 * 60 * 24 * 30,
      });
    } else if (!hasSession && request.cookies.has(HINT_COOKIE)) {
      response.cookies.delete(HINT_COOKIE);
    }
    return response;
  }

  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);

  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("content-security-policy", csp);

  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image).*)",
  ],
};
