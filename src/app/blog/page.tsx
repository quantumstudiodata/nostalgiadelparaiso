import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSiteBlock } from "@/lib/site-blocks";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { BlogSidebar } from "@/components/site/blog-sidebar";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;

  const [categories, posts, author] = await Promise.all([
    prisma.category.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { posts: true } } },
    }),
    prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        ...(categoria ? { category: { slug: categoria } } : {}),
      },
      orderBy: { publishedAt: "desc" },
      include: { category: true, author: true },
    }),
    getSiteBlock<{ name: string; bio: string; avatarUrl: string }>("sidebar.author"),
  ]);

  const totalPosts = categories.reduce((sum, c) => sum + c._count.posts, 0);
  const activeCategory = categories.find((c) => c.slug === categoria);

  return (
    <>
      <SiteHeader />

      {activeCategory && (
        <section
          className="grid grid-cols-1 md:grid-cols-2"
          style={{
            backgroundImage: activeCategory.imageUrl
              ? undefined
              : "linear-gradient(135deg, #0e0e11 0%, #1c1a1f 100%)",
          }}
        >
          <div className="bg-ink text-white min-h-[280px] flex flex-col justify-center px-6 md:px-10 py-14">
            <h1 className="font-serif text-3xl md:text-4xl leading-tight mb-6">
              {activeCategory.cardTitle ?? activeCategory.name}
            </h1>
            <Link
              href="#entradas"
              className="inline-block bg-[#f5d76e] text-ink text-sm px-6 py-2.5 w-fit"
            >
              Conoce sus entradas
            </Link>
          </div>
          {activeCategory.description && (
            <div className="flex items-center px-6 md:px-10 py-10 text-sm leading-relaxed text-neutral-700 whitespace-pre-line">
              <div>
                <h2 className="font-serif text-lg mb-3">
                  Acerca de {activeCategory.cardTitle ?? activeCategory.name}
                </h2>
                {activeCategory.description}
              </div>
            </div>
          )}
        </section>
      )}

      <section id="entradas" className="site-container px-6 md:px-10 py-12 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10">
        <BlogSidebar
          categories={categories}
          totalPosts={totalPosts}
          activeSlug={categoria}
          authorName={author.name || "Ángeles Nava"}
          authorBio={author.bio}
          authorAvatarUrl={author.avatarUrl}
        />

        <div>
          <h2 className="font-serif text-2xl mb-6">
            {activeCategory ? `Lista de entradas de ${activeCategory.name}` : "Lista de todos los textos"}
          </h2>

          {posts.length === 0 ? (
            <p className="text-sm text-neutral-500">No hay entradas en esta categoría todavía.</p>
          ) : (
            <div className="flex flex-col gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="grid grid-cols-[110px_1fr] gap-4 pb-6 border-b border-neutral-100"
                >
                  <div className="aspect-square bg-neutral-100 overflow-hidden">
                    {post.coverImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">
                      {post.author.name} ·{" "}
                      {post.publishedAt?.toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                    </div>
                    <div className="text-xs text-accent mb-1">{post.category.name}</div>
                    <h3 className="font-serif font-bold text-base mb-1">{post.title}</h3>
                    {post.excerpt && (
                      <p className="text-sm text-neutral-600 line-clamp-2">{post.excerpt}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
