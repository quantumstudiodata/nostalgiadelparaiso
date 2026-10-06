import { NextResponse } from "next/server";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { classifySource } from "@/lib/traffic";

const BOT_RE = /bot|crawl|spider|slurp|preview|headless|lighthouse/i;

export async function POST(request: Request) {
  if (BOT_RE.test(request.headers.get("user-agent") ?? "")) return new NextResponse(null, { status: 204 });
  const data = (await request.json().catch(() => null)) as { path?: unknown; visitorId?: unknown; sessionId?: unknown; entry?: unknown } | null;
  const path = typeof data?.path === "string" ? data.path.slice(0, 300) : "";
  const visitorId = typeof data?.visitorId === "string" ? data.visitorId.slice(0, 64) : "";
  const sessionId = typeof data?.sessionId === "string" ? data.sessionId.slice(0, 64) : "";
  if (!path.startsWith("/") || path.startsWith("/admin") || !visitorId || !sessionId) return new NextResponse(null, { status: 204 });

  let entry: { referrer?: string; search?: string } = {};
  try {
    entry = JSON.parse(String(data?.entry ?? "{}"));
  } catch {}
  const source = classifySource(String(entry.referrer ?? ""), String(entry.search ?? ""), new URL(request.url).hostname);

  after(async () => {
    const slug = path.match(/^\/blog\/([^/]+)$/)?.[1];
    const post = slug ? await prisma.post.findUnique({ where: { slug: decodeURIComponent(slug) }, select: { id: true } }) : null;
    await prisma.pageView.create({ data: { path, postId: post?.id ?? null, source, visitorId, sessionId } });
  });
  return new NextResponse(null, { status: 204 });
}
