import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/env";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/onboarding",
          "/profile",
          "/bookmarks",
          "/*/onboarding",
          "/*/profile",
          "/*/bookmarks",
          "/reset-password",
          "/*/reset-password",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
