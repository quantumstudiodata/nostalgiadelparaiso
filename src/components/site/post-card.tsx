import Link from "next/link";

type PostCardPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  category: { name: string };
  writer: { id: string; name: string; avatarUrl: string | null };
};

/** Vertical post card: image, category, title, excerpt and author. */
export function PostCard({ post, showAuthor = true, compact = false }: { post: PostCardPost; showAuthor?: boolean; compact?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex flex-col">
      <div className={`${compact ? "h-[150px]" : "h-[220px] lg:h-[260px]"} rounded-lg bg-mist overflow-hidden`}>
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        )}
      </div>
      <div className="mt-[18px] lg:mt-[22px] text-[13px] font-bold tracking-[0.12em] uppercase text-accent-dark">{post.category.name}</div>
      <h3 className={`mt-1.5 lg:mt-2 font-serif font-semibold leading-[1.25] group-hover:text-accent-dark ${compact ? "text-lg" : "text-[21px] lg:text-[22px]"}`}>{post.title}</h3>
      {post.excerpt && !compact && <p className="mt-2.5 lg:mt-3 text-[15px] leading-[1.65] text-neutral-700 line-clamp-3">{post.excerpt}</p>}
      {showAuthor && (
        <div className="mt-3.5 lg:mt-[18px] flex items-center gap-2.5 text-[15px] font-medium">
          {post.writer.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.writer.avatarUrl} alt="" className="w-8 h-8 lg:w-[34px] lg:h-[34px] rounded-full object-cover" />
          ) : (
            <span className="w-8 h-8 lg:w-[34px] lg:h-[34px] rounded-full bg-mist" />
          )}
          {post.writer.name}
        </div>
      )}
    </Link>
  );
}
