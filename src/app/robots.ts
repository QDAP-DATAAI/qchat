import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
    sitemap: "https://" + process.env.NEXT_PUBLIC_APP_URL + "/sitemap.xml",
  }
}
