import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { canEditSite } from "@/lib/edit-mode";
import { getSiteBlock } from "@/lib/site-blocks";
import { postSummary } from "@/lib/email-templates";
import { readingMinutes, shortDate } from "@/lib/reading-time";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { PostCard } from "@/components/site/blog-cards";
import { CategoryChips, HeroCarousel, ListenButton, LoadMoreLink, SubscribeCard, WeeklyPicker } from "@/components/site/blog-modern";

const PAGE_SIZE = 10;
// Posts shown beside "Lo más leído" before the "Texto de la semana" band.
const FIRST_ROW = 4;

export const metadata: Metadata = {
  title: "Blog",
  description: "Poemas, textos y reflexiones de Ángeles Nava y las voces de la comunidad de Nostalgia del Paraíso.",
  alternates: { canonical: "/blog" },
};

const cardInclude = { category: true, writer: true } as const;
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

/** Published posts ordered by page views since `since` (posts without views are left out). */
async function mostViewed(since: Date, take: number) {
  const rows = await prisma.pageView.groupBy({
    by: ["postId"],
    where: { createdAt: { gte: since }, postId: { not: null } },
    _count: { postId: true },
    orderBy: { _count: { postId: "desc" } },
    take: take * 2,
  });
  const ids = rows.map((r) => r.postId!).filter(Boolean);
  const posts = await prisma.post.findMany({ where: { id: { in: ids }, status: "PUBLISHED" }, include: cardInclude });
  const views = new Map(rows.map((r) => [r.postId, r._count.postId]));
  return posts
    .map((p) => ({ post: p, views: views.get(p.id) ?? 0 }))
    .sort((a, b) => b.views - a.views)
    .slice(0, take);
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; pagina?: string; q?: string }>;
}) {
  const { categoria, pagina, q } = await searchParams;
  const session = await auth();
  const canEdit = await canEditSite(session);
  const query = q?.trim();

  const where: Prisma.PostWhereInput = {
    status: "PUBLISHED",
    ...(categoria ? { category: { slug: categoria } } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
            { writer: { name: { contains: query, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  // "Cargar más" grows the list: page n shows the first n × PAGE_SIZE posts.
  const shown = Math.max(1, Number(pagina) || 1) * PAGE_SIZE;
  const [categories, total, posts, featured, topRead, weeklyBlock] = await Promise.all([
    prisma.category.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { posts: { where: { status: "PUBLISHED" } } } } },
    }),
    prisma.post.count({ where }),
    prisma.post.findMany({ where, orderBy: { publishedAt: "desc" }, take: shown, include: cardInclude }),
    query
      ? Promise.resolve([])
      : prisma.post.findMany({
          where: { status: "PUBLISHED", coverImage: { not: null }, ...(categoria ? { category: { slug: categoria } } : {}) },
          orderBy: { publishedAt: "desc" },
          take: 3,
          include: cardInclude,
        }),
    mostViewed(daysAgo(30), 5),
    getSiteBlock<{ slug?: string }>("blog.weekly"),
  ]);

  // "Texto de la semana": the one chosen in edit mode, else this week's most read, else the latest.
  const weekly =
    (weeklyBlock.slug && (await prisma.post.findFirst({ where: { slug: weeklyBlock.slug, status: "PUBLISHED" }, include: cardInclude }))) ||
    (await mostViewed(daysAgo(7), 1))[0]?.post ||
    posts[0];
  const weeklyOptions = canEdit
    ? await prisma.post.findMany({ where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, take: 60, select: { slug: true, title: true } })
    : [];

  // A category without photos keeps the cover with the latest posts, so the page does not jump when switching.
  const slides =
    featured.length > 0 || query
      ? featured
      : await prisma.post.findMany({
          where: { status: "PUBLISHED", coverImage: { not: null } },
          orderBy: { publishedAt: "desc" },
          take: 3,
          include: cardInclude,
        });
  const totalPosts = categories.reduce((sum, c) => sum + c._count.posts, 0);
  const activeCategory = categories.find((c) => c.slug === categoria);
  const heading = query ? `Resultados para “${query}”` : (activeCategory?.name ?? "Entradas");
  const listHref = (params: { categoria?: string; q?: string; pagina?: number }) => {
    const sp = new URLSearchParams();
    if (params.categoria) sp.set("categoria", params.categoria);
    if (params.q) sp.set("q", params.q);
    if (params.pagina && params.pagina > 1) sp.set("pagina", String(params.pagina));
    const qs = sp.toString();
    return qs ? `/blog?${qs}` : "/blog";
  };
  const chips = [{ slug: "", name: "Todas", count: totalPosts }, ...categories.map((c) => ({ slug: c.slug, name: c.name, count: c._count.posts }))];
  const firstRow = posts.slice(0, FIRST_ROW);
  const rest = posts.slice(FIRST_ROW);

  const topList = topRead.length > 0 && (
    <div className="flex flex-col gap-1 p-5 md:p-6 rounded-[22px] md:rounded-[26px] bg-panel">
      <h2 className="font-serif font-extrabold text-[19px] md:text-[24px] pb-2">Lo más leído</h2>
      {topRead.map(({ post }, i) => (
        <Link key={post.id} href={`/blog/${post.slug}`} className="group flex items-center gap-3 p-2 -mx-2 rounded-2xl transition hover:bg-white">
          <span
            className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-serif font-extrabold text-sm md:text-lg shrink-0 ${i === 0 ? "bg-accent text-white" : "bg-white"}`}
          >
            {i + 1}
          </span>
          <span className="flex flex-col min-w-0">
            <span className="font-serif font-semibold text-[14px] md:text-[15px] leading-snug group-hover:text-accent transition-colors">{post.title}</span>
          </span>
        </Link>
      ))}
    </div>
  );

  const weeklyQuote = weekly ? postSummary(weekly.content, 22) : "";

  return (
    <>
      <SiteHeader />

      {slides.length > 0 && (
        <div className="pt-3 md:pt-6">
          <HeroCarousel
            slides={slides.map((p) => ({
              slug: p.slug,
              title: p.title,
              category: p.category.name,
              excerpt: p.excerpt || postSummary(p.content, 26),
              meta: `${p.writer.name} · ${readingMinutes(p.content)} min de lectura`,
              image: p.coverImage,
            }))}
          />
        </div>
      )}

      <div className="wrap xl:px-20">
        {/* Phones: the text of the week and the most read right below the cover. */}
        {!query && (
          <div className="lg:hidden mt-4 flex flex-col gap-4">
            {weekly && (
              <section aria-label="Texto de la semana" className="relative overflow-hidden flex flex-col gap-3 p-6 rounded-[22px] bg-navy text-[#f3eee6]">
                <span aria-hidden="true" className="absolute -right-2 -top-14 font-serif font-extrabold text-[200px] leading-none text-[#2a2940]">
                  “
                </span>
                <span className="relative text-[10px] font-bold tracking-[0.2em] uppercase text-lilac">Texto de la semana</span>
                <blockquote className="relative font-cormorant italic text-[22px] leading-snug">{weeklyQuote}</blockquote>
                <span className="relative text-xs text-[#d3cde0]">
                  <strong className="text-[#f3eee6]">{weekly.title}</strong> · {weekly.writer.name}
                </span>
                <div className="relative flex gap-2">
                  <Link href={`/blog/${weekly.slug}`} className="h-10 px-5 flex items-center rounded-full bg-[#f3eee6] text-ink text-[13px] font-bold">
                    Leer completo
                  </Link>
                  <ListenButton text={`${weekly.title}. ${postSummary(weekly.content, Infinity)}`} className="h-10 px-4 text-[13px] border-[1.5px] border-[#f3eee6]/70 text-[#f3eee6]" />
                </div>
                {canEdit && <WeeklyPicker current={weeklyBlock.slug ?? ""} options={weeklyOptions} />}
              </section>
            )}
            {topList}
          </div>
        )}

        <div className="pt-8 md:pt-16 flex flex-col gap-4 md:gap-5">
          <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-8">
            <h1 className="flex-1 font-serif font-extrabold text-[28px] md:text-[52px] leading-tight tracking-[-0.02em]">
              {heading} <span className="font-normal text-base md:text-2xl text-neutral-400">{total}</span>
            </h1>
            <form action="/blog" role="search" className="flex items-center gap-2.5 h-11 md:h-12 w-full md:w-[340px] px-5 rounded-full bg-panel focus-within:ring-2 focus-within:ring-accent">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" aria-hidden="true">
                <circle cx="10.5" cy="10.5" r="7" />
                <path d="M21 21l-5.5-5.5" />
              </svg>
              <label htmlFor="buscar-entradas" className="sr-only">
                Buscar entradas
              </label>
              <input id="buscar-entradas" name="q" type="search" defaultValue={query} placeholder="Buscar por título o escritor" className="flex-1 min-w-0 bg-transparent outline-none text-sm" />
              {categoria && <input type="hidden" name="categoria" value={categoria} />}
            </form>
          </div>
          <CategoryChips
            chips={chips.map((c) => ({
              key: c.slug || "todas",
              name: c.name,
              href: listHref({ categoria: c.slug || undefined, q: query }),
              active: (c.slug || undefined) === categoria,
            }))}
          />
        </div>

        <div className="pt-6 md:pt-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 lg:gap-10 items-start">
          {posts.length === 0 ? (
            <p className="p-8 rounded-[20px] bg-panel text-center text-sm text-neutral-600">
              {query ? "No encontramos entradas con esa búsqueda." : "Aún no hay entradas en esta categoría."}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-7">
              {firstRow.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          )}
          <aside className="hidden lg:flex flex-col gap-6 sticky top-32">
            {topList}
            <SubscribeCard id="suscribirse" dark />
          </aside>
        </div>
      </div>

      {/* Large screens: the text of the week as a dark band between the posts. */}
      {!query && weekly && (
        <section aria-label="Texto de la semana" className="hidden lg:grid relative overflow-hidden mx-6 mt-20 p-16 xl:p-20 rounded-[34px] bg-navy text-[#f3eee6] grid-cols-[minmax(0,1fr)_340px] gap-14 items-center">
          <span aria-hidden="true" className="absolute left-10 -top-16 font-serif font-extrabold text-[340px] leading-none text-[#2a2940]">
            “
          </span>
          <div className="relative flex flex-col gap-5">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-lilac">Texto de la semana</span>
            <blockquote className="font-cormorant italic text-[40px] xl:text-[46px] leading-[1.2]">{weeklyQuote}</blockquote>
            <div className="flex items-center gap-3 text-[15px] text-[#d3cde0]">
              {weekly.writer.avatarUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={weekly.writer.avatarUrl} alt="" className="w-11 h-11 rounded-full object-cover" />
              )}
              <span>
                <strong className="text-[#f3eee6]">{weekly.title}</strong> · {weekly.writer.name} · {shortDate(weekly.publishedAt)}
              </span>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <Link href={`/blog/${weekly.slug}`} className="h-12 px-6 flex items-center rounded-full bg-[#f3eee6] text-ink text-[15px] font-bold transition hover:-translate-y-0.5">
                Leer completo
              </Link>
              <ListenButton text={`${weekly.title}. ${postSummary(weekly.content, Infinity)}`} className="h-12 px-5 text-[15px] border-[1.5px] border-[#f3eee6] text-[#f3eee6]" />
              {canEdit && <WeeklyPicker current={weeklyBlock.slug ?? ""} options={weeklyOptions} />}
            </div>
          </div>
          {weekly.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={weekly.coverImage} alt="" className="relative w-full h-[380px] object-cover rounded-[26px] rotate-3 shadow-[0_30px_60px_rgba(0,0,0,0.35)]" />
          )}
        </section>
      )}

      <div className="wrap xl:px-20 pb-20 md:pb-28">
        {rest.length > 0 && (
          <div className="pt-4 md:pt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-7">
            {rest.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
        {posts.length < total && (
          <div className="pt-10 md:pt-14 flex justify-center">
            <LoadMoreLink href={listHref({ categoria, q: query, pagina: shown / PAGE_SIZE + 1 })} />
          </div>
        )}
        <SubscribeCard id="suscribirse-movil" className="lg:hidden mt-10" />
      </div>

      <SiteFooter />
    </>
  );
}
