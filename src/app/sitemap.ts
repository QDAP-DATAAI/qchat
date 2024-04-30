import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: process.env.NEXTAUTH_URL_INTERNAL,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
  ]
}
