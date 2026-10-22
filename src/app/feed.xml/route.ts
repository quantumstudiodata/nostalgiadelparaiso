import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/email";
import { postSummary } from "@/lib/email-templates";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export const dynamic = "force-dynamic";

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS feed of the latest posts: readers and search engines find new posts here. */
export async function GET() {
  const base = siteUrl();
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 30,
    include: { category: true, writer: true },
  });
  const items = posts
    .map((p) => {
      const url = `${base}/blog/${p.slug}`;
      const description = p.seoDescription || p.excerpt || postSummary(p.content, 50);
      return `<item><title>${escape(p.title)}</title><link>${url}</link><guid>${url}</guid>${
        p.publishedAt ? `<pubDate>${p.publishedAt.toUTCString()}</pubDate>` : ""
      }<dc:creator>${escape(p.writer.name)}</dc:creator><category>${escape(p.category.name)}</category><description>${escape(description)}</description></item>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${escape(SITE_NAME)}</title><link>${base}/blog</link><description>${escape(SITE_DESCRIPTION)}</description><language>es-MX</language><atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "s-maxage=600, stale-while-revalidate" } });
}
