import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/email";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // Photos (/api/images) and share previews (/api/og) must stay reachable for Google Images and social apps.
      allow: ["/", "/api/images/", "/api/og/"],
      disallow: ["/admin", "/api/", "/cuenta", "/recuperar", "/registro/verificar", "/suscripcion", "/baja"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
