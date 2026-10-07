import Link from "next/link";
import { EditableText, EditableImage } from "@/components/site/editable";
import { updateSiteBlockField } from "@/app/actions/site-content";
import { WixSubscribe } from "@/components/site/wix-subscribe";
import { LikeButton, PostMenu } from "@/components/site/post-actions";
import { readingMinutes, shortDate } from "@/lib/reading-time";

type CategoryWithCount = { id: string; name: string; slug: string; _count: { posts: number } };

const saveAuthorName = updateSiteBlockField.bind(null, "sidebar.author", "name");
const saveAuthorBio = updateSiteBlockField.bind(null, "sidebar.author", "bio");
const saveAuthorAvatar = updateSiteBlockField.bind(null, "sidebar.author", "avatarUrl");

/** "Categorías" box as on the original site. */
export function WixCategories({
  categories,
  totalPosts,
  activeSlug,
}: {
  categories: CategoryWithCount[];
  totalPosts: number;
  activeSlug?: string;
}) {
  const items = [
    { key: "todos", href: "/blog", label: "Todos los textos", count: totalPosts, active: !activeSlug },
    ...categories.map((c) => ({ key: c.id, href: `/blog?categoria=${c.slug}`, label: c.name, count: c._count.posts, active: c.slug === activeSlug })),
  ];
  return (
    <div>
      <h2 className="font-cormorant font-semibold text-[21px] tracking-[0.04em] mb-3">Categorías</h2>
      <nav className="border border-mist py-1.5 text-[15px]">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={`block px-3 py-3 truncate hover:text-accent ${item.active ? "text-accent" : ""}`}
          >
            {item.label} ({item.count})
          </Link>
        ))}
      </nav>
    </div>
  );
}

/** Black column with the subscribe card and the founder's card. */
export function WixBlackColumn({
  authorName,
  authorBio,
  authorAvatarUrl,
  canEdit = false,
  editable = true,
  moreHref = "/acerca-de-nosotros",
}: {
  authorName: string;
  authorBio: string;
  authorAvatarUrl?: string | null;
  canEdit?: boolean;
  editable?: boolean;
  moreHref?: string;
}) {
  const edit = canEdit && editable;
  return (
    <div className="bg-ink text-white px-4 pt-[72px] pb-10">
      <WixSubscribe />
      <div className="mt-16 text-center">
        {edit ? (
          <EditableText as="h2" canEdit value={authorName} onSave={saveAuthorName} className="font-playfair text-[28px]" />
        ) : (
          <h2 className="font-playfair text-[28px]">{authorName}</h2>
        )}
        {(authorAvatarUrl || edit) &&
          (edit ? (
            <EditableImage canEdit url={authorAvatarUrl ?? ""} onSave={saveAuthorAvatar} className="mt-4 w-[170px] h-[170px] rounded-full overflow-hidden mx-auto" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={authorAvatarUrl!} alt={authorName} className="mt-4 w-[170px] h-[170px] rounded-full object-cover mx-auto" />
          ))}
        {edit ? (
          <EditableText as="p" canEdit multiline value={authorBio} onSave={saveAuthorBio} className="mt-4 text-[13px] leading-[1.55]" />
        ) : (
          authorBio && <p className="mt-4 text-[13px] leading-[1.55] whitespace-pre-line">{authorBio}</p>
        )}
        <Link href={moreHref} className="inline-block mt-6 bg-[#f6c64e] text-ink font-playfair italic text-[15px] px-8 py-2.5 rounded-md">
          Leer más
        </Link>
      </div>
    </div>
  );
}

type PostRowPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  likes: number;
  publishedAt: Date | null;
  category: { name: string };
  writer: { id: string; name: string; avatarUrl: string | null };
  _count: { comments: number };
};

/** Horizontal post card (image left, details right) as in the original blog list. */
export function PostRow({ post }: { post: PostRowPost }) {
  const href = `/blog/${post.slug}`;
  return (
    <article className="relative grid grid-cols-1 sm:grid-cols-2 border border-mist -mt-px bg-white">
      <Link href={href} className="block h-[220px] sm:h-[230px] bg-mist overflow-hidden" tabIndex={-1} aria-hidden="true">
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
        )}
      </Link>
      <div className="px-6 sm:px-[34px] pt-6 pb-4 flex flex-col min-w-0">
        <div className="flex items-center gap-2.5">
          {post.writer.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.writer.avatarUrl} alt={post.writer.name} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <span className="w-8 h-8 rounded-full bg-lilac" />
          )}
          <div className="text-xs leading-snug min-w-0">
            <Link href={`/autor/${post.writer.id}`} className="relative z-10 block truncate hover:text-accent">
              {post.writer.name}
            </Link>
            <div className="text-neutral-600">
              {shortDate(post.publishedAt)} · {readingMinutes(post.content)} min de lectura
            </div>
          </div>
          <div className="ml-auto relative z-10">
            <PostMenu url={href} title={post.title} />
          </div>
        </div>
        <div className="mt-4 text-sm text-accent">{post.category.name}</div>
        <h3 className="mt-2.5 font-playfair font-bold text-base leading-snug">
          <Link href={href} className="hover:text-accent before:absolute before:inset-0 before:content-['']">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className="mt-2.5 text-[11.5px] leading-[1.6] text-neutral-600 line-clamp-2">{post.excerpt}</p>}
        <div className="mt-auto pt-3 border-t border-mist flex items-center justify-between text-xs relative z-10">
          <Link href={`${href}#comentarios`}>
            {post._count.comments} {post._count.comments === 1 ? "comentario" : "comentarios"}
          </Link>
          <LikeButton postId={post.id} initialLikes={post.likes} />
        </div>
      </div>
    </article>
  );
}
