import { MetadataRoute } from "next/types";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      images: [
        `${baseUrl}/images/portrait.webp`,
        `${baseUrl}/og-image.png`,
      ],
    },
  ];
}
