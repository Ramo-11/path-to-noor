const HIDDEN_TAB_BAR_ROUTES = [
  "/start",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/onboarding",
];

export function isTabBarHidden(pathname: string): boolean {
  return HIDDEN_TAB_BAR_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}
