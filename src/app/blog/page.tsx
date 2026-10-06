import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { canEditSite } from "@/lib/edit-mode";
import { getSiteBlock } from "@/lib/site-blocks";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { WixCategories, WixBlackColumn, PostRow } from "@/components/site/wix-blog";
import { SearchPill } from "@/components/site/search-pill";

const PAGE_SIZE = 10;

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

  const [categories, total, author] = await Promise.all([
    prisma.category.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { posts: { where: { status: "PUBLISHED" } } } } },
    }),
    prisma.post.count({ where }),
    getSiteBlock<{ name: string; bio: string; avatarUrl: string }>("sidebar.author"),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(pageCount, Math.max(1, Number(pagina) || 1));
  const posts = await prisma.post.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: { category: true, writer: true, _count: { select: { comments: true } } },
  });

  const totalPosts = categories.reduce((sum, c) => sum + c._count.posts, 0);
  const activeCategory = categories.find((c) => c.slug === categoria);
  const heading = query
    ? `Resultados para “${query}”`
    : activeCategory
      ? `Lista de entradas de ${activeCategory.name}`
      : "Lista de todos los textos";
  const pageHref = (n: number) => {
    const params = new URLSearchParams();
    if (categoria) params.set("categoria", categoria);
    if (query) params.set("q", query);
    if (n > 1) params.set("pagina", String(n));
    const qs = params.toString();
    return qs ? `/blog?${qs}` : "/blog";
  };

  return (
    <>
      <SiteHeader />

      {/* Phone order: categories, posts, then the subscribe/author column. */}
      <div className="max-w-[1040px] mx-auto w-full px-5 md:px-10 pt-14 lg:pt-20 pb-24 grid grid-cols-1 lg:grid-cols-[256px_minmax(0,1fr)] lg:grid-rows-[auto_1fr] gap-x-[72px] gap-y-10 items-start">
        <aside className="lg:col-start-1 lg:row-start-1 flex flex-col gap-3">
          <WixCategories categories={categories} totalPosts={totalPosts} activeSlug={categoria} />
          <SearchPill variant="filled" defaultValue={query} />
        </aside>

        <div className="lg:col-start-1 lg:row-start-2">
          <WixBlackColumn
            authorName={author.name || "Ángeles Nava"}
            authorBio={author.bio}
            authorAvatarUrl={author.avatarUrl}
            canEdit={canEdit}
          />
        </div>

        <main className="row-start-2 lg:col-start-2 lg:row-start-1 lg:row-span-2 min-w-0">
          <h1 className="font-cormorant font-semibold text-[21px] tracking-[0.04em] mb-3">{heading}</h1>

          {posts.length === 0 ? (
            <p className="text-sm text-neutral-600 border border-mist p-6">
              {query ? "No encontramos entradas con esa búsqueda." : "No hay entradas en esta categoría todavía."}
            </p>
          ) : (
            <div className="flex flex-col pt-px">
              {posts.map((post) => (
                <PostRow key={post.id} post={post} />
              ))}
            </div>
          )}

          {pageCount > 1 && (
            <nav aria-label="Páginas" className="mt-8 flex justify-center items-center flex-wrap gap-1 text-sm">
              {page > 1 && (
                <Link href={pageHref(page - 1)} aria-label="Página anterior" className="w-9 h-9 flex items-center justify-center">
                  ‹
                </Link>
              )}
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={pageHref(n)}
                  aria-current={n === page ? "page" : undefined}
                  className={`w-9 h-9 flex items-center justify-center ${n === page ? "text-accent font-bold" : "hover:text-accent"}`}
                >
                  {n}
                </Link>
              ))}
              {page < pageCount && (
                <Link href={pageHref(page + 1)} aria-label="Página siguiente" className="w-9 h-9 flex items-center justify-center">
                  ›
                </Link>
              )}
            </nav>
          )}
        </main>
      </div>

      <SiteFooter />
    </>
  );
}
