import Link from "next/link";

type PostCardPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  author: { name: string; avatarUrl: string | null };
};

/** Horizontal post card (image left, text right) matching the original Wix blog list. */
export function PostCard({ post }: { post: PostCardPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="grid grid-cols-1 sm:grid-cols-2 border border-neutral-200 -mt-px bg-white hover:bg-neutral-50 transition-colors"
    >
      <div className="relative aspect-[4/3] sm:aspect-auto sm:min-h-[230px] bg-neutral-100 overflow-hidden">
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>
      <div className="px-9 py-6 flex flex-col">
        <div className="flex items-center gap-2.5 mb-4 text-[13px]">
          {post.author.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.author.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <span className="w-8 h-8 rounded-full bg-neutral-300" />
          )}
          {post.author.name}
        </div>
        <h3 className="font-serif font-bold text-[17px] leading-snug mb-3">{post.title}</h3>
        {post.excerpt && <p className="text-[12px] leading-relaxed text-neutral-700 line-clamp-3">{post.excerpt}</p>}
        <div className="mt-auto pt-5 border-b border-neutral-300" />
      </div>
    </Link>
  );
}

/** Vertical post card (image on top) used in the "Entradas recientes" strip. */
export function PostTile({ post }: { post: Pick<PostCardPost, "slug" | "title" | "coverImage"> }) {
  return (
    <Link href={`/blog/${post.slug}`} className="border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors">
      <div className="aspect-[4/3] bg-neutral-100 overflow-hidden">
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
        )}
      </div>
      <h3 className="font-serif font-bold text-[17px] leading-snug px-4 pt-5 pb-12">{post.title}</h3>
    </Link>
  );
}
