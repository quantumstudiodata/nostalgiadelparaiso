import type { NextConfig } from "next";

// Old Wix addresses (bookmarked or indexed by Google) keep working on the new site.
const wixRedirects = [
  { source: "/mi-blog", destination: "/blog" },
  { source: "/mi-blog/categories/voces-del-sur", destination: "/blog?categoria=voces-del-sur" },
  { source: "/mi-blog/categories/:category*", destination: "/blog" },
  { source: "/mi-blog/:path*", destination: "/blog" },
  { source: "/post/:slug", destination: "/blog/:slug" },
  { source: "/acerca-de", destination: "/acerca-de-nosotros" },
  { source: "/voces-del-sur", destination: "/blog?categoria=voces-del-sur" },
  { source: "/cultura-de-paz", destination: "/blog?categoria=cultura-de-paz" },
  { source: "/taller-olas-de-pleamar", destination: "/blog?categoria=olas-de-pleamar" },
  { source: "/taller-alumnos", destination: "/blog?categoria=nostalgia-del-paraiso" },
  { source: "/entradas-%C3%A1ngeles-nava", destination: "/blog?categoria=blog-angeles-nava" },
  { source: "/t%C3%A9rminos-y-condiciones", destination: "/terminos-y-condiciones" },
  { source: "/pol%C3%ADtica-de-privacidad", destination: "/politica-de-privacidad" },
].map((r) => ({ ...r, permanent: true }));

const nextConfig: NextConfig = {
  async redirects() {
    return wixRedirects;
  },
};

export default nextConfig;
