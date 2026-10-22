import Link from "next/link";
import { EditableText, EditableImage } from "@/components/site/editable";
import { updateSiteBlockField } from "@/app/actions/site-content";
import { readingMinutes, shortDate } from "@/lib/reading-time";

const saveAuthorName = updateSiteBlockField.bind(null, "sidebar.author", "name");
const saveAuthorBio = updateSiteBlockField.bind(null, "sidebar.author", "bio");
const saveAuthorAvatar = updateSiteBlockField.bind(null, "sidebar.author", "avatarUrl");

/** Lilac card with Ángeles Nava's photo overlapping its top edge (editable in edit mode). */
export function FounderCard({
  name,
  bio,
  avatarUrl,
  canEdit = false,
  instagram,
}: {
  name: string;
  bio: string;
  avatarUrl?: string | null;
  canEdit?: boolean;
  instagram?: string;
}) {
  return (
    <div className="mt-12 flex flex-col gap-3 px-6 pb-6 md:px-7 md:pb-7 bg-lilac rounded-[22px] md:rounded-[28px]">
      {canEdit ? (
        <EditableImage canEdit url={avatarUrl ?? ""} onSave={saveAuthorAvatar} className="-mt-12 w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-[5px] border-white shadow-lg" />
      ) : (
        avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={name} className="-mt-12 w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-[5px] border-white shadow-lg" />
        )
      )}
      {canEdit ? (
        <EditableText as="h2" canEdit value={name} onSave={saveAuthorName} className="font-serif font-extrabold text-[20px] md:text-[26px] leading-tight" />
      ) : (
        <h2 className="font-serif font-extrabold text-[20px] md:text-[26px] leading-tight">{name}</h2>
      )}
      {canEdit ? (
        <EditableText as="p" canEdit multiline value={bio} onSave={saveAuthorBio} className="text-[13px] md:text-sm leading-relaxed text-[#2a2b40]" />
      ) : (
        bio && <p className="text-[13px] md:text-sm leading-relaxed text-[#2a2b40] whitespace-pre-line">{bio}</p>
      )}
      <div className="flex gap-2 pt-1">
        <Link href="/acerca-de-nosotros" className="bg-ink text-white rounded-full px-5 py-2.5 text-[13px] font-bold transition hover:-translate-y-0.5">
          Leer más
        </Link>
        {instagram && (
          <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white flex items-center justify-center transition hover:-translate-y-0.5">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

export type CardPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  publishedAt: Date | null;
  category: { name: string };
  writer: { name: string; avatarUrl: string | null };
};

/** Rounded post card with a photo; lifts on hover. `compact` for carousels. */
export function PostCard({ post, compact = false, className = "" }: { post: CardPost; compact?: boolean; className?: string }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`lift group flex flex-col bg-white rounded-[20px] md:rounded-[24px] overflow-hidden shadow-[0_8px_24px_rgba(17,17,30,0.07)] ring-1 ring-black/[0.04] ${className}`}
    >
      <span className={`block overflow-hidden bg-panel ${compact ? "h-36 md:h-52" : "h-44 md:h-56"}`}>
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
        )}
      </span>
      <span className="flex flex-col gap-1.5 md:gap-2 px-4 pt-3.5 pb-4 md:px-6 md:pt-5 md:pb-6">
        <span className="text-[10px] md:text-[11px] font-bold tracking-[0.12em] uppercase text-accent">{post.category.name}</span>
        <span className="font-serif font-semibold text-[16px] md:text-[21px] leading-snug group-hover:text-accent transition-colors">{post.title}</span>
        {!compact && post.excerpt && <span className="text-[13px] md:text-sm leading-relaxed text-neutral-600 line-clamp-2">{post.excerpt}</span>}
        <span className="flex items-center gap-2 pt-1 text-[11px] md:text-xs text-neutral-500">
          {post.writer.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.writer.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
          )}
          {post.writer.name} · {shortDate(post.publishedAt)} · {readingMinutes(post.content)} min
        </span>
      </span>
    </Link>
  );
}
