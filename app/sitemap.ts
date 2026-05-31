import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://rentnest.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const activeListings = await prisma.listing.findMany({
    where: { status: "active" },
    select: { id: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 1000,
  });

  const listingUrls: MetadataRoute.Sitemap = activeListings.map((l) => ({
    url: `${APP_URL}/listings/${l.id}`,
    lastModified: l.createdAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${APP_URL}/listings`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${APP_URL}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...listingUrls,
  ];
}
