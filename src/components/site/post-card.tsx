import Link from "next/link";

type PostCardPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  category: { name: string };
  author: { name: string; avatarUrl: string | null };
};

/** Vertical post card: image, category, title, excerpt and author. */
export function PostCard({ post, showAuthor = true }: { post: PostCardPost; showAuthor?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex flex-col">
      <div className="h-[240px] md:h-[260px] rounded-md bg-mist overflow-hidden">
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        )}
      </div>
      <div className="mt-[18px] text-xs font-bold tracking-[0.12em] uppercase text-accent-dark">{post.category.name}</div>
      <h3 className="mt-2 font-serif font-semibold text-[26px] leading-[1.15] group-hover:text-accent-dark">{post.title}</h3>
      {post.excerpt && <p className="mt-2.5 text-[15px] leading-relaxed text-neutral-700 line-clamp-3">{post.excerpt}</p>}
      {showAuthor && (
        <div className="mt-4 flex items-center gap-2.5 text-sm font-medium">
          {post.author.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.author.avatarUrl} alt="" className="w-[30px] h-[30px] rounded-full object-cover" />
          ) : (
            <span className="w-[30px] h-[30px] rounded-full bg-mist" />
          )}
          {post.author.name}
        </div>
      )}
    </Link>
  );
}
