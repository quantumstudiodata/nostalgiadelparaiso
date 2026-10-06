import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { PostRow } from "@/components/site/wix-blog";

type Socials = { instagram?: string; facebook?: string; tiktok?: string };

async function getWriter(id: string) {
  return prisma.user.findFirst({ where: { id, role: { in: ["ADMIN", "EDITOR", "AUTHOR"] } } });
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const writer = await getWriter((await params).id);
  return writer ? { title: `${writer.name} · Nostalgia del Paraíso`, description: writer.bio ?? undefined } : {};
}

export default async function WriterPage({ params }: { params: Promise<{ id: string }> }) {
  const writer = await getWriter((await params).id);
  if (!writer) notFound();

  const posts = await prisma.post.findMany({
    where: { authorId: writer.id, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 12,
    include: { category: true, author: true, _count: { select: { comments: true } } },
  });
  const socials = (writer.socialLinks ?? {}) as Socials;
  const links = [
    writer.websiteUrl && { href: writer.websiteUrl, label: "Enlace del autor" },
    socials.instagram && { href: socials.instagram, label: "Instagram" },
    socials.facebook && { href: socials.facebook, label: "Facebook" },
    socials.tiktok && { href: socials.tiktok, label: "TikTok" },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <>
      <SiteHeader />
      <div className="max-w-[1040px] mx-auto w-full px-5 md:px-10 pt-8 pb-24">
        <div className="h-[160px] md:h-[240px] rounded-[10px] overflow-hidden bg-lilac">
          {writer.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={writer.coverUrl} alt="" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="-mt-14 px-4 md:px-8 flex flex-col items-center md:items-start text-center md:text-left">
          {writer.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={writer.avatarUrl} alt="" className="w-28 h-28 rounded-full object-cover border-4 border-white bg-white" />
          ) : (
            <span className="w-28 h-28 rounded-full border-4 border-white bg-mist flex items-center justify-center font-playfair text-[40px]">
              {writer.name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <h1 className="mt-3 font-playfair text-[28px] leading-tight">{writer.name}</h1>
          {writer.bio && <p className="mt-3 max-w-[640px] text-[15px] leading-[1.7] whitespace-pre-line text-neutral-700">{writer.bio}</p>}
          {links.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
              {links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="border border-ink rounded-full px-3.5 py-1.5 text-[13px] hover:bg-ink hover:text-white">
                  {l.label}
                </a>
              ))}
            </div>
          )}
        </div>

        <h2 className="mt-12 font-cormorant font-semibold text-[21px] tracking-[0.04em] mb-3">Entradas recientes</h2>
        {posts.length === 0 ? (
          <p className="text-sm text-neutral-600 border border-mist p-6">Todavía no hay entradas publicadas.</p>
        ) : (
          <div className="flex flex-col pt-px">
            {posts.map((post) => (
              <PostRow key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
      <SiteFooter />
    </>
  );
}
