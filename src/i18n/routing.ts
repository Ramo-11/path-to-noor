import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar", "es"],
  defaultLocale: "en",
  localePrefix: "always",
});
