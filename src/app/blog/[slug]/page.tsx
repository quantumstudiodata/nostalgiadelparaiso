import type { Metadata } from "next";
import { postSummary } from "@/lib/email-templates";
import { siteUrl } from "@/lib/email";
import { notFound, permanentRedirect } from "next/navigation";
import { slugify } from "@/lib/slug";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { canWritePosts, isManager } from "@/lib/permissions";
import { sanitizeHtml } from "@/lib/sanitize";
import { getSiteBlock } from "@/lib/site-blocks";
import { canEditSite } from "@/lib/edit-mode";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { FounderCard, PostCard } from "@/components/site/blog-cards";
import { ListenButton, PostActions, ScrollCarousel, SubscribeCard } from "@/components/site/blog-modern";
import { getSocialLinks } from "@/lib/social-links";
import { readingMinutes, shortDate } from "@/lib/reading-time";
import { CommentForm } from "@/components/site/comment-form";
import { Stars, WithPixelEmojis } from "@/components/site/pixel-emoji";
import { addComment, deleteComment } from "@/app/actions/community";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { title: true, excerpt: true, content: true, coverImage: true, slug: true, publishedAt: true, updatedAt: true, writer: { select: { name: true } } },
  });
  if (!post) return {};
  const description = (post.excerpt || postSummary(post.content, 35)).slice(0, 200);
  const url = `/blog/${post.slug}`;
  // Light 1200×630 preview built from the cover (see /api/og); the version busts app caches after edits.
  const image = { url: `/api/og/${post.slug}?v=${post.updatedAt.getTime()}`, width: 1200, height: 630, type: "image/jpeg", alt: post.title };
  return {
    title: post.title,
    description,
    authors: [{ name: post.writer.name }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      siteName: "Nostalgia del Paraíso",
      locale: "es_MX",
      title: post.title,
      description,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.writer.name],
      images: [image],
    },
    twitter: { card: "summary_large_image", title: post.title, description, images: [image.url] },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Writers can preview drafts from the editor ("Vista previa"); everyone else sees published posts only.
  const viewerSession = await auth();
  const canPreview = canWritePosts(viewerSession?.user?.role);
  const post = await prisma.post.findFirst({
    where: { slug, ...(canPreview ? {} : { status: "PUBLISHED" }) },
    include: {
      category: true,
      writer: true,
      comments: { orderBy: { createdAt: "asc" }, include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
    },
  });

  if (!post) {
    // Wix links use accented slugs (e.g. "límites") and sometimes a "-1" suffix; find the matching post.
    const plain = slugify(decodeURIComponent(slug));
    const candidates = [plain, plain.replace(/-\d+$/, "")].filter((c) => c && c !== slug);
    for (const candidate of candidates) {
      const match = await prisma.post.findFirst({ where: { slug: candidate, status: "PUBLISHED" }, select: { slug: true } });
      if (match) permanentRedirect(`/blog/${match.slug}`);
    }
    notFound();
  }

  const session = viewerSession;
  const [sameCategory, founder, social] = await Promise.all([
    prisma.post.findMany({
      where: { status: "PUBLISHED", categoryId: post.categoryId, id: { not: post.id } },
      orderBy: { publishedAt: "desc" },
      take: 8,
      include: { category: true, writer: true },
    }),
    getSiteBlock<{ name?: string; bio?: string; avatarUrl?: string }>("sidebar.author"),
    getSocialLinks(),
  ]);
  // "Seguir leyendo": the same category first, then the latest from the rest of the blog.
  const others =
    sameCategory.length < 8
      ? await prisma.post.findMany({
          where: { status: "PUBLISHED", categoryId: { not: post.categoryId } },
          orderBy: { publishedAt: "desc" },
          take: 8 - sameCategory.length,
          include: { category: true, writer: true },
        })
      : [];
  const related = [...sameCategory, ...others];
  // The writer's photo next to the title; the side column always shows the founder's card.
  const isFounder = founder.name?.trim().toLowerCase() === post.writer.name.trim().toLowerCase();
  const authorAvatar = post.writer.avatarUrl || (isFounder ? founder.avatarUrl : null);
  const writerHref = `/autor/${post.writer.id}`;
  const viewer = session?.user;
  const canEdit = await canEditSite(session);
  const date = post.publishedAt?.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }).replace(".", "") ?? "";
  const minutes = readingMinutes(post.content);
  const coverOnTop = post.coverImage && post.coverPlacement !== "body";
  const coverInBody = post.coverImage && post.coverPlacement !== "top";
  const listenText = `${post.title}. ${postSummary(post.content, Infinity)}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            datePublished: post.publishedAt?.toISOString(),
            dateModified: post.updatedAt.toISOString(),
            author: { "@type": "Person", name: post.writer.name, url: `${siteUrl()}/autor/${post.writer.id}` },
            publisher: { "@id": `${siteUrl()}/#organization` },
            image: post.coverImage ? new URL(post.coverImage, siteUrl()).toString() : undefined,
            mainEntityOfPage: `${siteUrl()}/blog/${post.slug}`,
          }).replace(/</g, "\\u003c"),
        }}
      />
      <SiteHeader overlay />

      {/* Cover photo across the whole top of the page, under the menu and the logo. */}
      <section className="relative h-[50vh] min-h-[360px] max-h-[460px] md:max-h-none md:h-[600px] overflow-hidden bg-navy bg-[radial-gradient(circle_at_80%_20%,#4b2d6b_0%,transparent_55%),radial-gradient(circle_at_10%_90%,#3c3e57_0%,transparent_50%)]">
        {coverOnTop && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage!} alt="" className="ken-burns absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30" />
        <Link
          href="/blog"
          className="absolute left-5 md:left-10 xl:left-20 top-[132px] md:top-[156px] rounded-full bg-white/20 backdrop-blur px-3.5 py-2 text-[12px] md:text-[13px] font-bold text-white transition hover:-translate-y-0.5"
        >
          ← Todas las entradas
        </Link>
      </section>

      {/* Title card floating over the bottom of the cover. */}
      <div className="wrap xl:px-20">
        <div className="rise-in relative -mt-24 md:-mt-44 max-w-[780px] flex flex-col gap-3 md:gap-5 p-5 md:p-11 bg-white rounded-[22px] md:rounded-[30px] shadow-[0_30px_70px_rgba(17,17,30,0.16)]">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={`/blog?categoria=${post.category.slug}`}
              className="bg-lilac text-slate rounded-full px-3 py-1.5 text-[10px] md:text-xs font-bold tracking-[0.12em] uppercase hover:bg-accent hover:text-white transition-colors"
            >
              {post.category.name}
            </Link>
            <span className="text-[11px] md:text-[13px] text-neutral-500">
              {date} · {minutes} min
            </span>
          </div>
          <h1 className="rise-in rise-in-1 font-serif font-extrabold text-[22px] md:text-[44px] leading-[1.1] tracking-[-0.02em]">{post.title}</h1>
          <div className="rise-in rise-in-2 flex flex-wrap items-center gap-3 md:gap-4 pt-1">
            <Link href={writerHref} aria-hidden="true" tabIndex={-1}>
              {authorAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={authorAvatar} alt="" className="w-9 h-9 md:w-12 md:h-12 rounded-full object-cover" />
              ) : (
                <span className="block w-9 h-9 md:w-12 md:h-12 rounded-full bg-lilac" />
              )}
            </Link>
            <span className="flex flex-col text-[12px] md:text-sm leading-snug">
              <span className="text-neutral-500">Escrito por</span>
              <Link href={writerHref} className="font-bold hover:text-accent">
                {post.writer.name}
              </Link>
            </span>
            <ListenButton text={listenText} className="ml-auto h-10 md:h-12 px-4 md:px-6 text-[13px] md:text-[15px] bg-ink text-white aria-pressed:bg-accent" />
          </div>
        </div>
        {post.status !== "PUBLISHED" && (
          <p className="mt-4 max-w-[780px] rounded-2xl bg-[#fff4e5] text-[#6b3d00] text-[13px] px-5 py-3">
            Vista previa: esta entrada es un borrador y todavía no la ve nadie más.
          </p>
        )}
      </div>

      <div className="wrap xl:px-20 pt-8 md:pt-16 grid grid-cols-1 lg:grid-cols-[64px_minmax(0,1fr)_320px] gap-x-8 xl:gap-x-14 gap-y-10 items-start">
        <div className="lg:self-stretch">
          <PostActions postId={post.id} initialLikes={post.likes} url={`/blog/${post.slug}`} title={post.title} />
        </div>

        <article className="min-w-0 max-w-[680px]">
          {coverInBody && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverImage!} alt={post.title} className="mb-6 md:mb-8 w-full max-h-[460px] object-cover rounded-[18px] md:rounded-[24px]" />
          )}
          <div className="post-content post-body drop-cap" dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }} />
          <div className="mt-8 flex flex-wrap gap-2">
            <Link href={`/blog?categoria=${post.category.slug}`} className="bg-panel rounded-full px-4 py-2 text-[13px] transition hover:-translate-y-0.5 hover:bg-lilac">
              # {post.category.name}
            </Link>
            <Link href={writerHref} className="bg-panel rounded-full px-4 py-2 text-[13px] transition hover:-translate-y-0.5 hover:bg-lilac">
              Más de {post.writer.name}
            </Link>
          </div>
        </article>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-32">
          <FounderCard
            name={founder.name || "Ángeles Nava"}
            bio={founder.bio ?? ""}
            avatarUrl={founder.avatarUrl}
            canEdit={canEdit}
            instagram={social.instagram}
          />
          <SubscribeCard id="suscribirse" />
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-16 md:mt-24 py-12 md:py-18 bg-panel">
          <div className="wrap xl:px-20">
            <ScrollCarousel title="Seguir leyendo">
              {related.map((r) => (
                <PostCard key={r.id} post={r} compact className="snap-start shrink-0 w-[240px] md:w-[320px]" />
              ))}
            </ScrollCarousel>
          </div>
        </section>
      )}

      <section id="comentarios" className="wrap xl:px-20 pt-12 md:pt-20 pb-28 md:pb-24">
        <div className="max-w-[680px] lg:ml-[96px] xl:ml-[120px]">
          <h2 className="font-serif font-extrabold text-[22px] md:text-[30px]">
            Comentarios {post.comments.length > 0 && <span className="font-normal text-neutral-400">{post.comments.length}</span>}
          </h2>

          {post.comments.length === 0 && <p className="mt-3 text-[13px] text-neutral-600">Aún no hay comentarios. ¡Sé la primera persona en comentar!</p>}

          <ul className="mt-5 flex flex-col gap-4">
            {post.comments.map((c) => {
              const name = c.user?.name ?? c.authorName ?? "Anónimo";
              return (
                <li key={c.id} className="flex gap-3">
                  {c.user?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.user.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                  ) : (
                    <span className="w-9 h-9 rounded-full bg-lilac shrink-0 flex items-center justify-center text-xs font-bold">{name.slice(0, 1).toUpperCase()}</span>
                  )}
                  <div className="flex-1 min-w-0 bg-panel rounded-[4px_18px_18px_18px] px-4 py-3">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px]">
                      <span className="font-bold">{name}</span>
                      {c.rating ? <Stars value={c.rating} /> : null}
                      <span className="text-neutral-500 text-xs">{shortDate(c.createdAt)}</span>
                      {viewer && ((c.user && viewer.id === c.user.id) || isManager(viewer.role)) && (
                        <form action={deleteComment.bind(null, c.id)} className="ml-auto">
                          <button className="text-xs text-accent hover:underline">Borrar</button>
                        </form>
                      )}
                    </div>
                    {c.body && (
                      <p className="mt-1 text-[13.5px] leading-relaxed whitespace-pre-line">
                        <WithPixelEmojis text={c.body} />
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-7 rounded-[20px] p-4 md:p-5 shadow-[0_10px_30px_rgba(17,17,30,0.08)] ring-1 ring-black/5">
            <CommentForm action={addComment.bind(null, post.id)} signedInAs={viewer?.name} />
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
