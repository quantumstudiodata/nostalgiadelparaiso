import sharp from "sharp";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const FALLBACK = "/images/hero-portada.jpg";

/**
 * Light preview image (1200×630 JPEG) used when a post is shared on WhatsApp,
 * Facebook, Instagram or X. Big photos make those apps show a blank preview.
 */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findFirst({
    where: { slug: decodeURIComponent(slug), status: "PUBLISHED" },
    select: { coverImage: true, content: true },
  });
  // Cover image, else the first image in the text, else the site's default photo.
  const firstInText = post?.content.match(/<img[^>]+src="([^"]+)"/i)?.[1];
  const source = post?.coverImage || firstInText || FALLBACK;

  try {
    const res = await fetch(new URL(source, request.url));
    if (!res.ok) throw new Error(`image ${res.status}`);
    const jpeg = await sharp(Buffer.from(await res.arrayBuffer()))
      .rotate()
      .resize(1200, 630, { fit: "cover", position: "attention" })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();
    return new Response(new Uint8Array(jpeg), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[/api/og]", slug, error);
    return Response.redirect(new URL(FALLBACK, request.url), 302);
  }
}
