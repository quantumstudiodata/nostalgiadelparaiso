import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSiteBlock } from "@/lib/site-blocks";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { BlogSidebar } from "@/components/site/blog-sidebar";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [hero, about, author, categories, posts] = await Promise.all([
    getSiteBlock<{ title: string; buttonText: string; body: string; imageUrl?: string }>(
      "home.hero"
    ),
    getSiteBlock<{ bio: string; buttonText: string; imageUrl: string }>("home.about"),
    getSiteBlock<{ name: string; bio: string; avatarUrl: string }>("sidebar.author"),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { posts: true } } },
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 6,
      include: { category: true, author: true },
    }),
  ]);

  const totalPosts = categories.reduce((sum, c) => sum + c._count.posts, 0);

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section
        style={{
          backgroundImage: hero.imageUrl
            ? `linear-gradient(0deg, rgba(10,10,20,.55), rgba(10,10,20,.35)), url(${hero.imageUrl})`
            : "linear-gradient(135deg, #1c1a2b 0%, #34324a 45%, #6b7280 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="site-container grid grid-cols-1 md:grid-cols-2 gap-10 items-center min-h-[520px] px-6 md:px-10 py-16 text-white">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl leading-tight mb-6">
              {hero.title}
            </h1>
            <div className="w-10 h-px bg-white mb-4" />
            <Link href="/acerca-de-nosotros" className="text-sm tracking-wide">
              {hero.buttonText}
            </Link>
          </div>
          <div className="text-sm leading-relaxed text-white/90 whitespace-pre-line max-h-[420px] overflow-y-auto pr-2">
            {hero.body}
          </div>
        </div>
      </section>

      {/* Blog list */}
      <section id="entradas" className="site-container px-6 md:px-10 py-14 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10">
        <BlogSidebar
          categories={categories}
          totalPosts={totalPosts}
          authorName={author.name || "Ángeles Nava"}
          authorBio={author.bio}
          authorAvatarUrl={author.avatarUrl}
        />

        <div>
          <h2 className="font-serif text-2xl mb-6">Entradas recientes</h2>
          {posts.length === 0 ? (
            <p className="text-sm text-neutral-500">
              Aún no hay entradas publicadas.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="border border-neutral-100">
                  <div className="aspect-square bg-neutral-100 overflow-hidden">
                    {post.coverImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-neutral-500 mb-1">{post.author.name}</div>
                    <h3 className="font-serif font-bold text-sm">{post.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Category cards */}
      <section className="site-container px-6 md:px-10 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {categories.map((c) => (
            <div key={c.id} className="flex flex-col items-center text-center">
              <Link
                href={`/blog?categoria=${c.slug}`}
                className="w-full aspect-square bg-neutral-200 overflow-hidden mb-3 block"
              >
                {c.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.imageUrl} alt={c.cardTitle ?? c.name} className="w-full h-full object-cover" />
                )}
              </Link>
              <div className="text-sm mb-3">{c.cardTitle ?? c.name}</div>
              <Link
                href={`/blog?categoria=${c.slug}`}
                className="bg-ink text-white text-xs px-4 py-2.5 w-full"
              >
                Leer entradas
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* About Ángeles Nava */}
      <section className="bg-neutral-100">
        <div className="site-container px-6 md:px-10 py-14 grid grid-cols-1 md:grid-cols-[1fr_420px] gap-10 items-center">
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
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
