import { notFound, permanentRedirect } from "next/navigation";
import { slugify } from "@/lib/slug";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isManager } from "@/lib/permissions";
import { sanitizeHtml } from "@/lib/sanitize";
import { getSiteBlock } from "@/lib/site-blocks";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { CategoriesBox, AuthorCard } from "@/components/site/blog-sidebar";
import { SubscribeForm } from "@/components/site/subscribe-form";
import { PostCard } from "@/components/site/post-card";
import { CommentForm } from "@/components/site/comment-form";
import { addComment, deleteComment } from "@/app/actions/community";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await prisma.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: true,
      author: true,
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

  const [session, categories, related, founder] = await Promise.all([
    auth(),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { posts: { where: { status: "PUBLISHED" } } } } },
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED", categoryId: post.categoryId, id: { not: post.id } },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: { category: true, author: true },
    }),
    getSiteBlock<{ name?: string; bio?: string; avatarUrl?: string }>("sidebar.author"),
  ]);
  // The founder's profile lives in the editable sidebar block; use it when her user record has no bio yet.
  const isFounder = founder.name?.trim().toLowerCase() === post.author.name.trim().toLowerCase();
  const authorBio = post.author.bio || (isFounder ? founder.bio ?? "" : "");
  const authorAvatar = post.author.avatarUrl || (isFounder ? founder.avatarUrl : null);
  const viewer = session?.user;
  const totalPosts = categories.reduce((sum, c) => sum + c._count.posts, 0);
  const date = post.publishedAt?.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <SiteHeader />

      <div className="max-w-[1280px] mx-auto w-full px-6 md:px-10 pt-12 pb-20 grid grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)_220px] gap-10 items-start">
        <aside className="order-3 lg:order-1 flex flex-col gap-6">
          <SubscribeForm id="suscribirse" />
          <AuthorCard name={post.author.name} bio={authorBio} avatarUrl={authorAvatar}>
            <Link
              href={`/blog?categoria=${post.category.slug}`}
              className="inline-block mt-5 bg-lilac text-ink rounded-full px-5 py-2.5 text-sm font-medium"
            >
              Leer más
            </Link>
          </AuthorCard>
        </aside>

        <main className="order-1 lg:order-2 min-w-0">
          <article>
            <div className="flex items-center gap-3 text-sm">
              {authorAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={authorAvatar} alt="" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <span className="w-9 h-9 rounded-full bg-mist" />
              )}
              <div>
                <div className="font-medium">{post.author.name}</div>
                <div className="text-neutral-600 text-[13px]">{date}</div>
              </div>
              <Link href={`/blog?categoria=${post.category.slug}`} className="ml-auto text-[11px] font-bold tracking-[0.12em] uppercase text-accent-dark">
                {post.category.name}
              </Link>
            </div>
            <h1 className="mt-5 font-serif font-semibold text-[30px] md:text-[36px] leading-tight">{post.title}</h1>

            {post.coverImage && (
              <div className="mt-6 rounded-md overflow-hidden bg-mist">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.coverImage} alt="" className="w-full max-h-[520px] object-cover" />
              </div>
            )}

            <div
              className="post-content mt-7 prose prose-neutral max-w-none text-[16px] leading-relaxed [&_h1]:font-serif [&_h2]:font-serif [&_h3]:font-serif"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
            />
          </article>

          {related.length > 0 && (
            <section className="mt-16 pt-8 border-t border-mist">
              <div className="flex items-baseline justify-between">
                <h2 className="font-serif font-semibold text-xl">Entradas relacionadas</h2>
                <Link href={`/blog?categoria=${post.category.slug}`} className="text-sm underline underline-offset-4">
                  Ver todo
                </Link>
              </div>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                {related.map((r) => (
                  <PostCard key={r.id} post={r} showAuthor={false} compact />
                ))}
              </div>
            </section>
          )}

          <section id="comentarios" className="mt-16 pt-8 border-t border-mist">
            <h2 className="font-serif font-semibold text-xl">
              Comentarios {post.comments.length > 0 && <span className="text-neutral-500 font-normal">({post.comments.length})</span>}
            </h2>

            {post.comments.length === 0 && <p className="mt-3 text-sm text-neutral-600">Aún no hay comentarios. ¡Sé la primera persona en comentar!</p>}

            <ul className="mt-6 flex flex-col gap-5">
              {post.comments.map((c) => (
                <li key={c.id} className="flex gap-3">
                  {c.user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.user.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                  ) : (
                    <span className="w-9 h-9 rounded-full bg-lilac shrink-0 flex items-center justify-center text-sm font-medium">
                      {c.user.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 text-sm">
                      <span className="font-medium">{c.user.name}</span>
                      <span className="text-neutral-500 text-xs">
                        {c.createdAt.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      {viewer && (viewer.id === c.user.id || isManager(viewer.role)) && (
                        <form action={deleteComment.bind(null, c.id)} className="ml-auto">
                          <button className="text-xs text-accent-dark hover:underline">Borrar</button>
                        </form>
                      )}
                    </div>
                    <p className="mt-1 text-[15px] leading-relaxed whitespace-pre-line">{c.body}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {viewer ? (
                <CommentForm action={addComment.bind(null, post.id)} />
              ) : (
                <p className="text-sm bg-panel rounded-lg p-4">
                  <Link href="/admin/login" className="font-medium underline underline-offset-4">Inicia sesión</Link> o{" "}
                  <Link href="/registro" className="font-medium underline underline-offset-4">crea una cuenta</Link> para comentar.
                </p>
              )}
            </div>
          </section>
        </main>

        <aside className="order-2 lg:order-3">
          <CategoriesBox categories={categories} totalPosts={totalPosts} activeSlug={post.category.slug} />
        </aside>
      </div>

      <SiteFooter />
    </>
  );
}
