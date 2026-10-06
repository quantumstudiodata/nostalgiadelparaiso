import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/email";

export const dynamic = "force-dynamic";

/** Every public page, so Google finds all the posts. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [posts, categories, writers] = await Promise.all([
    prisma.post.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true }, orderBy: { publishedAt: "desc" } }),
    prisma.category.findMany({ select: { slug: true } }),
    prisma.writer.findMany({ where: { posts: { some: { status: "PUBLISHED" } } }, select: { id: true, updatedAt: true } }),
  ]);
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/acerca-de-nosotros`, changeFrequency: "monthly", priority: 0.8 },
    ...categories.map((c) => ({ url: `${base}/blog?categoria=${c.slug}`, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...writers.map((w) => ({ url: `${base}/autor/${w.id}`, lastModified: w.updatedAt, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
