"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useEffect } from "react";

export function OnboardingRedirect() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!session?.user) return;

    // Admin users don't need userType
    const role = session.user.role;
    if (role === "admin" || role === "super_admin") return;

    // Already on onboarding page
    if (pathname === "/onboarding") return;

    // Missing userType → redirect to onboarding
    if (!session.user.userType) {
      router.replace("/onboarding");
    }
  }, [session, status, pathname, router]);

  return null;
}
