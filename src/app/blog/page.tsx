import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getSiteBlock } from "@/lib/site-blocks";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { BlogSidebar } from "@/components/site/blog-sidebar";
import { PostCard } from "@/components/site/post-card";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const session = await auth();
  const canEdit = !!session?.user;

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

      <section id="entradas" className="max-w-[980px] mx-auto px-6 pt-20 pb-20 grid grid-cols-1 md:grid-cols-[256px_1fr] gap-10 md:gap-16">
        <BlogSidebar
          categories={categories}
          totalPosts={totalPosts}
          activeSlug={categoria}
          authorName={author.name || "Ángeles Nava"}
          authorBio={author.bio}
          authorAvatarUrl={author.avatarUrl}
          canEdit={canEdit}
        />

        <div>
          <h2 className="font-cormorant font-semibold text-xl tracking-wide mb-4">
            {activeCategory ? `Lista de entradas de ${activeCategory.name}` : "Lista de todos los textos"}
          </h2>

          {posts.length === 0 ? (
            <p className="text-sm text-neutral-500">No hay entradas en esta categoría todavía.</p>
          ) : (
            <div className="flex flex-col">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
