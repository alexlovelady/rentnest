import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://rentnest.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/tenant-portal", "/api/", "/sign/"],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
