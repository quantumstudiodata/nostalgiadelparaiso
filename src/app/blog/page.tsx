import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;

  const [categories, posts] = await Promise.all([
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
  ]);

  const totalPosts = categories.reduce((sum, c) => sum + c._count.posts, 0);
  const activeCategory = categories.find((c) => c.slug === categoria);

  return (
    <>
      <SiteHeader />

      <section className="px-6 md:px-10 py-12 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-10">
        <aside>
          <h2 className="font-serif text-lg mb-4">Categorías</h2>
          <div className="flex flex-col gap-1 text-sm">
            <Link
              href="/blog"
              className={`py-2 border-b border-neutral-100 ${!categoria ? "font-bold" : ""}`}
            >
              Todos los textos ({totalPosts})
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/blog?categoria=${c.slug}`}
                className={`py-2 border-b border-neutral-100 ${c.slug === categoria ? "font-bold" : ""}`}
              >
                {c.name} ({c._count.posts})
              </Link>
            ))}
          </div>
        </aside>

        <div>
          <h2 className="font-serif text-2xl mb-6">
            {activeCategory ? `Entradas de ${activeCategory.name}` : "Lista de todos los textos"}
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
