"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useEffect, useRef } from "react";

export function OnboardingRedirect() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const redirectingRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!session?.user) return;

    // Admin users don't need userType
    const role = session.user.role;
    if (role === "admin" || role === "super_admin") return;

    // Already on onboarding page
    if (pathname === "/onboarding") {
      redirectingRef.current = false;
      return;
    }

    // Missing userType → redirect to onboarding (only once)
    if (!session.user.userType && !redirectingRef.current) {
      redirectingRef.current = true;
      router.replace("/onboarding");
    }
  }, [status, session?.user?.userType, session?.user?.role, pathname, router]);

  return null;
}
