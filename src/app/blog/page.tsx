import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isManager } from "@/lib/permissions";
import { getSiteBlock } from "@/lib/site-blocks";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { BlogSidebar } from "@/components/site/blog-sidebar";
import { PostCard } from "@/components/site/post-card";

const PAGE_SIZE = 12;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; pagina?: string }>;
}) {
  const { categoria, pagina } = await searchParams;
  const session = await auth();
  const canEdit = isManager(session?.user?.role);

  const where = {
    status: "PUBLISHED" as const,
    ...(categoria ? { category: { slug: categoria } } : {}),
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
    include: { category: true, author: true },
  });

  const totalPosts = categories.reduce((sum, c) => sum + c._count.posts, 0);
  const activeCategory = categories.find((c) => c.slug === categoria);
  const pageHref = (n: number) => {
    const params = new URLSearchParams();
    if (categoria) params.set("categoria", categoria);
    if (n > 1) params.set("pagina", String(n));
    const qs = params.toString();
    return qs ? `/blog?${qs}` : "/blog";
  };

  return (
    <>
      <SiteHeader />

      <div className="max-w-[1280px] mx-auto w-full px-6 md:px-14 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-14 items-start">
        <div className="order-2 lg:order-1">
          <BlogSidebar
            categories={categories}
            totalPosts={totalPosts}
            activeSlug={categoria}
            authorName={author.name || "Ángeles Nava"}
            authorBio={author.bio}
            authorAvatarUrl={author.avatarUrl}
            canEdit={canEdit}
          />
        </div>

        <main className="order-1 lg:order-2">
          <div className="flex items-baseline justify-between gap-4 border-b border-mist pb-4">
            <h1 className="font-serif font-semibold text-2xl leading-tight">
              {activeCategory ? activeCategory.name : "Todos los textos"}
            </h1>
            <span className="text-sm text-neutral-600 shrink-0">
              {total} {total === 1 ? "texto" : "textos"}
            </span>
          </div>

          {posts.length === 0 ? (
            <p className="mt-8 text-neutral-600">No hay entradas en esta categoría todavía.</p>
          ) : (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} showAuthor={!activeCategory} />
              ))}
            </div>
          )}

          {pageCount > 1 && (
            <nav aria-label="Páginas" className="mt-12 flex justify-center flex-wrap gap-2 text-[15px]">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={pageHref(n)}
                  aria-current={n === page ? "page" : undefined}
                  className={`w-11 h-11 rounded-full flex items-center justify-center ${
                    n === page ? "bg-ink text-white" : "border border-ink hover:bg-ink hover:text-white"
                  }`}
                >
                  {n}
                </Link>
              ))}
            </nav>
          )}
        </main>
      </div>

      <SiteFooter />
    </>
  );
}
