"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useEffect, useRef } from "react";

const EXEMPT_PATHS = [
  "/onboarding",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/privacy",
  "/terms",
];

export function OnboardingRedirect() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const redirectingRef = useRef(false);

  const hasUser = Boolean(session?.user);
  const role = session?.user?.role;
  const userType = session?.user?.userType;
  const track = session?.user?.track;

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!hasUser) return;

    if (role === "admin" || role === "super_admin") return;

    if (EXEMPT_PATHS.includes(pathname)) {
      redirectingRef.current = false;
      return;
    }

    if (!userType && !track && !redirectingRef.current) {
      redirectingRef.current = true;
      router.replace("/onboarding");
    }
  }, [status, hasUser, userType, track, role, pathname, router]);

  return null;
}
