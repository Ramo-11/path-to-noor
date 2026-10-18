import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export const MESSAGE_NAMESPACES = [
  "common",
  "learning",
  "stages",
  "nav",
  "footer",
  "home",
  "start",
  "paths",
  "lesson",
  "check",
  "blocks",
  "library",
  "saved",
  "journey",
  "settings",
  "auth",
  "forgotPassword",
  "resetPassword",
  "onboarding",
  "mentor",
  "contact",
  "legal",
  "system",
  "verifyEmail",
  "feedback",
  "search",
  "install",
] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "en" | "ar" | "es")) {
    locale = routing.defaultLocale;
  }

  const entries = await Promise.all(
    MESSAGE_NAMESPACES.map(async (namespace) => [
      namespace,
      (await import(`../messages/${locale}/${namespace}.json`)).default,
    ])
  );

  return {
    locale,
    messages: Object.fromEntries(entries),
  };
});
