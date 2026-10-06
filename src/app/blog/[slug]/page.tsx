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
import { WixCategories, WixBlackColumn } from "@/components/site/wix-blog";
import { SearchPill } from "@/components/site/search-pill";
import { LikeButton, PostMenu } from "@/components/site/post-actions";
import { readingMinutes, shortDate } from "@/lib/reading-time";
import { CommentForm } from "@/components/site/comment-form";
import { Stars, WithPixelEmojis } from "@/components/site/pixel-emoji";
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
  const date = shortDate(post.publishedAt);

  return (
    <>
      <SiteHeader />

      <div className="max-w-[1120px] mx-auto w-full px-5 md:px-10 pt-14 lg:pt-20 pb-24 grid grid-cols-1 lg:grid-cols-[256px_minmax(0,1fr)_180px] gap-12 lg:gap-16 items-start">
        <aside className="order-3 lg:order-1">
          {/* Phone order: categories, post, related, comments, then this column. */}
          <WixBlackColumn
            authorName={post.author.name}
            authorBio={authorBio}
            authorAvatarUrl={authorAvatar}
            editable={false}
            moreHref={isFounder ? "/acerca-de-nosotros" : `/autor/${post.author.id}`}
          />
        </aside>

        <main className="order-2 min-w-0">
          <article>
            <div className="flex items-center gap-2.5">
              {authorAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={authorAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <span className="w-8 h-8 rounded-full bg-lilac" />
              )}
              <div className="text-[13px] leading-snug">
                <div>{post.author.name}</div>
                <div className="text-xs text-neutral-600">
                  {date} · {readingMinutes(post.content)} min de lectura
                </div>
              </div>
              <div className="ml-auto">
                <PostMenu url={`/blog/${post.slug}`} title={post.title} />
              </div>
            </div>
            <h1 className="mt-5 font-playfair font-bold text-[24px] leading-snug">{post.title}</h1>

            {post.coverImage && (
              <div className="mt-5 overflow-hidden bg-mist">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.coverImage} alt="" className="w-full max-h-[460px] object-cover" />
              </div>
            )}

            <div
              className="post-content mt-5 text-[13.5px] leading-[1.65] text-neutral-900 text-justify [&_p]:my-0 [&_p+p]:mt-0 [&_h1]:font-playfair [&_h1]:font-bold [&_h1]:text-xl [&_h1]:my-4 [&_h2]:font-playfair [&_h2]:font-bold [&_h2]:text-lg [&_h2]:my-3 [&_h3]:font-playfair [&_h3]:font-bold [&_h3]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-lilac [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
            />

            <div className="mt-8 pt-3 border-t border-mist flex items-center justify-between text-xs">
              <Link href={`/blog?categoria=${post.category.slug}`} className="text-accent">
                {post.category.name}
              </Link>
              <LikeButton postId={post.id} initialLikes={post.likes} />
            </div>
          </article>

          {related.length > 0 && (
            <section className="mt-14">
              <div className="flex items-baseline justify-between">
                <h2 className="text-[15px]">Entradas relacionadas</h2>
                <Link href={`/blog?categoria=${post.category.slug}`} className="text-[13px]">
                  Ver todo
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {related.slice(0, 2).map((r) => (
                  <Link key={r.id} href={`/blog/${r.slug}`} className="border border-mist hover:text-accent">
                    <div className="h-[150px] bg-mist overflow-hidden">
                      {r.coverImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.coverImage} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <h3 className="px-4 pt-3.5 pb-6 font-playfair font-bold text-[15px] leading-snug">{r.title}</h3>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section id="comentarios" className="mt-14">
            <h2 className="text-[15px] pb-3 border-b border-mist">
              Comentarios {post.comments.length > 0 && <span className="text-neutral-500">({post.comments.length})</span>}
            </h2>

            {post.comments.length === 0 && <p className="mt-4 text-[13px] text-neutral-600">Aún no hay comentarios. ¡Sé la primera persona en comentar!</p>}

            <ul className="mt-5 flex flex-col gap-5">
              {post.comments.map((c) => {
                const name = c.user?.name ?? c.authorName ?? "Anónimo";
                return (
                  <li key={c.id} className="flex gap-3">
                    {c.user?.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-lilac shrink-0 flex items-center justify-center text-xs font-medium">
                        {name.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px]">
                        <span className="font-medium">{name}</span>
                        {c.rating ? <Stars value={c.rating} /> : null}
                        <span className="text-neutral-500 text-xs">{shortDate(c.createdAt)}</span>
                        {viewer && ((c.user && viewer.id === c.user.id) || isManager(viewer.role)) && (
                          <form action={deleteComment.bind(null, c.id)} className="ml-auto">
                            <button className="text-xs text-accent-dark hover:underline">Borrar</button>
                          </form>
                        )}
                      </div>
                      {c.body && (
                        <p className="mt-1 text-[13.5px] leading-relaxed whitespace-pre-line">
                          <WithPixelEmojis text={c.body} />
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-7">
              <CommentForm action={addComment.bind(null, post.id)} signedInAs={viewer?.name} />
            </div>
          </section>
        </main>

        <aside className="order-1 lg:order-3 flex flex-col gap-3">
          <WixCategories categories={categories} totalPosts={totalPosts} activeSlug={post.category.slug} />
          <SearchPill variant="outline" />
        </aside>
      </div>

      <SiteFooter />
    </>
  );
}
