import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getSiteBlock } from "@/lib/site-blocks";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { BlogSidebar } from "@/components/site/blog-sidebar";
import { PostCard } from "@/components/site/post-card";
import { EditableText, EditableImage } from "@/components/site/editable";
import { updateCategoryField } from "@/app/actions/site-content";

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

  const saveCardTitle = activeCategory
    ? updateCategoryField.bind(null, activeCategory.id, "cardTitle")
    : undefined;
  const saveDescription = activeCategory
    ? updateCategoryField.bind(null, activeCategory.id, "description")
    : undefined;
  const saveImage = activeCategory
    ? updateCategoryField.bind(null, activeCategory.id, "imageUrl")
    : undefined;

  return (
    <>
      <SiteHeader />

      {activeCategory && saveCardTitle && saveDescription && saveImage && (
        <section className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative min-h-[280px] text-white">
            <EditableImage
              canEdit={canEdit}
              url={activeCategory.imageUrl ?? ""}
              onSave={saveImage}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#0e0e11] to-[#1c1a1f]" />
            </EditableImage>
            {activeCategory.imageUrl && <div className="absolute inset-0 bg-black/40 pointer-events-none" />}
            <div className="relative flex flex-col justify-center h-full px-6 md:px-10 py-14">
              <EditableText
                as="h1"
                canEdit={canEdit}
                value={activeCategory.cardTitle ?? activeCategory.name}
                onSave={saveCardTitle}
                className="font-serif font-bold text-3xl md:text-5xl leading-tight mb-6"
              />
              <Link
                href="#entradas"
                className="inline-block bg-[#f5d76e] text-ink text-sm px-6 py-2.5 w-fit"
              >
                Conoce sus entradas
              </Link>
            </div>
          </div>
          <div className="flex items-center px-6 md:px-10 py-10 text-sm leading-relaxed text-neutral-700">
            <div className="w-full">
              <h2 className="font-serif font-bold text-xl mb-3">
                Acerca de {activeCategory.cardTitle ?? activeCategory.name}
              </h2>
              <EditableText
                as="div"
                canEdit={canEdit}
                multiline
                value={activeCategory.description ?? ""}
                onSave={saveDescription}
                placeholder="Agrega una descripción para esta categoría..."
              />
            </div>
          </div>
        </section>
      )}

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
