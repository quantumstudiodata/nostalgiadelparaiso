import Link from "next/link";

type CategoryWithCount = {
  id: string;
  name: string;
  slug: string;
  _count: { posts: number };
};

export function BlogSidebar({
  categories,
  totalPosts,
  activeSlug,
  authorName,
  authorBio,
  authorAvatarUrl,
}: {
  categories: CategoryWithCount[];
  totalPosts: number;
  activeSlug?: string;
  authorName: string;
  authorBio: string;
  authorAvatarUrl?: string | null;
}) {
  return (
    <aside className="flex flex-col gap-8">
      <div>
        <h2 className="font-serif text-lg mb-4">Categorías</h2>
        <div className="flex flex-col gap-1 text-sm">
          <Link
            href="/blog"
            className={`py-2 border-b border-neutral-100 ${!activeSlug ? "font-bold" : ""}`}
          >
            Todos los textos ({totalPosts})
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/blog?categoria=${c.slug}`}
              className={`py-2 border-b border-neutral-100 ${c.slug === activeSlug ? "font-bold" : ""}`}
            >
              {c.name} ({c._count.posts})
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white border border-neutral-200">
        <div className="p-5">
          <h3 className="font-serif text-base mb-3">
            Recibe todas
            <br />
            las entradas.
          </h3>
          <label className="block text-xs italic text-neutral-500 mb-1">Email *</label>
          <input className="w-full border border-neutral-300 px-3 py-2 text-sm mb-3" />
          <button className="w-full bg-ink text-white text-sm py-2.5">Suscribirse</button>
        </div>
      </div>

      <div className="bg-ink text-white p-5">
        <h3 className="font-serif text-lg mb-3">{authorName}</h3>
        {authorAvatarUrl && (
          <div className="w-24 h-24 rounded-full overflow-hidden mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={authorAvatarUrl} alt={authorName} className="w-full h-full object-cover" />
          </div>
        )}
        <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line">
          {authorBio}
        </p>
      </div>
    </aside>
  );
}
