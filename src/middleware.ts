import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes — pass through (auth handled by dashboard layout server component)
  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // API routes — pass through
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Public routes — next-intl locale routing
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match admin routes
    "/admin/:path*",
    // Match all public routes (next-intl)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
