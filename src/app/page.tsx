import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSiteBlock } from "@/lib/site-blocks";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

export default async function HomePage() {
  const [hero, about, categories, posts] = await Promise.all([
    getSiteBlock<{ title: string; buttonText: string; body: string }>("home.hero"),
    getSiteBlock<{ bio: string; buttonText: string; imageUrl: string }>("home.about"),
    prisma.category.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { posts: true } } } }),
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 6,
      include: { category: true },
    }),
  ]);

  const totalPosts = categories.reduce((sum, c) => sum + c._count.posts, 0);

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        <div className="bg-ink text-white min-h-[420px] flex flex-col justify-center px-10 py-16">
          <h1 className="font-serif text-4xl md:text-5xl leading-tight mb-6">
            {hero.title}
          </h1>
          <div className="w-10 h-px bg-white mb-4" />
          <a href="#entradas" className="text-sm tracking-wide">
            {hero.buttonText}
          </a>
        </div>
        <div className="flex items-center px-10 py-12 text-sm leading-relaxed text-neutral-700 whitespace-pre-line">
          {hero.body}
        </div>
      </section>

      {/* Blog list */}
      <section id="entradas" className="px-6 md:px-10 py-14 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-10">
        <aside>
          <h2 className="font-serif text-lg mb-4">Categorías</h2>
          <div className="flex flex-col gap-1 text-sm">
            <Link href="/blog" className="py-2 border-b border-neutral-100">
              Todos los textos ({totalPosts})
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/blog?categoria=${c.slug}`}
                className="py-2 border-b border-neutral-100"
              >
                {c.name} ({c._count.posts})
              </Link>
            ))}
          </div>
        </aside>

        <div>
          <h2 className="font-serif text-2xl mb-6">Entradas recientes</h2>
          {posts.length === 0 ? (
            <p className="text-sm text-neutral-500">
              Aún no hay entradas publicadas.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="border border-neutral-100">
                  <div className="aspect-square bg-neutral-100 overflow-hidden">
                    {post.coverImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif font-bold text-sm">{post.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Ángeles Nava */}
      <section className="bg-neutral-100 px-6 md:px-10 py-14 grid grid-cols-1 md:grid-cols-[1fr_420px] gap-10 items-center">
        <div>
          <h2 className="font-serif text-2xl mb-5">Conoce a Ángeles Nava</h2>
          <p className="text-sm leading-relaxed text-neutral-700 whitespace-pre-line mb-6 max-w-xl">
            {about.bio}
          </p>
          <Link
            href="/acerca-de-nosotros"
            className="inline-block bg-accent text-white text-sm px-6 py-2.5"
          >
            {about.buttonText}
          </Link>
        </div>
        <div className="aspect-[4/3] bg-neutral-300 overflow-hidden">
          {about.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={about.imageUrl} alt="Ángeles Nava" className="w-full h-full object-cover" />
          )}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
