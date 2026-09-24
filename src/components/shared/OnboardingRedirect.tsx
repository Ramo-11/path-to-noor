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

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!session?.user) return;

    const role = session.user.role;
    if (role === "admin" || role === "super_admin") return;

    if (EXEMPT_PATHS.includes(pathname)) {
      redirectingRef.current = false;
      return;
    }

    if (!session.user.userType && !redirectingRef.current) {
      redirectingRef.current = true;
      router.replace("/onboarding");
    }
  }, [status, session?.user?.userType, session?.user?.role, pathname, router]);

  return null;
}
