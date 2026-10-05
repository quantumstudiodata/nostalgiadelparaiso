import Link from "next/link";
import { EditableText, EditableImage } from "@/components/site/editable";
import { updateSiteBlockField } from "@/app/actions/site-content";

type CategoryWithCount = {
  id: string;
  name: string;
  slug: string;
  _count: { posts: number };
};

const saveAuthorName = updateSiteBlockField.bind(null, "sidebar.author", "name");
const saveAuthorBio = updateSiteBlockField.bind(null, "sidebar.author", "bio");
const saveAuthorAvatar = updateSiteBlockField.bind(null, "sidebar.author", "avatarUrl");

export function BlogSidebar({
  categories,
  totalPosts,
  activeSlug,
  authorName,
  authorBio,
  authorAvatarUrl,
  canEdit = false,
}: {
  categories: CategoryWithCount[];
  totalPosts: number;
  activeSlug?: string;
  authorName: string;
  authorBio: string;
  authorAvatarUrl?: string | null;
  canEdit?: boolean;
}) {
  return (
    <aside className="flex flex-col gap-6">
      <div>
        <h2 className="font-cormorant font-semibold text-xl tracking-wide mb-4">Categorías</h2>
        <div className="flex flex-col border border-neutral-200 text-[15px] py-2">
          <Link href="/blog" className={`px-2 py-3 hover:text-accent ${!activeSlug ? "text-accent" : ""}`}>
            Todos los textos ({totalPosts})
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/blog?categoria=${c.slug}`}
              className={`px-2 py-3 hover:text-accent ${c.slug === activeSlug ? "text-accent" : ""}`}
            >
              {c.name} ({c._count.posts})
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-ink px-4 pt-16 pb-8">
        <div className="bg-white p-2.5">
          <h3 className="font-serif font-bold text-[15px] leading-snug text-center mb-2.5">
            Recibe todas
            <br />
            las entradas.
          </h3>
          <div className="bg-ink p-2.5 pb-6">
            <label className="block font-serif italic text-[11px] text-white mb-2">
              Email <span className="text-neutral-500">*</span>
            </label>
            <input type="email" className="w-full bg-white border-2 border-neutral-500 px-2 py-1.5 text-sm mb-6" />
            <button className="bg-slate text-white font-serif text-sm px-10 py-3">Suscribirse</button>
          </div>
        </div>

        <div className="text-white text-center mt-16">
          <EditableText
            as="h3"
            canEdit={canEdit}
            value={authorName}
            onSave={saveAuthorName}
            className="font-serif text-[28px] mb-4"
          />
          {(authorAvatarUrl || canEdit) && (
            <EditableImage
              canEdit={canEdit}
              url={authorAvatarUrl ?? ""}
              onSave={saveAuthorAvatar}
              className="w-[120px] h-[120px] rounded-full overflow-hidden mx-auto mb-5"
            />
          )}
          <EditableText
            as="p"
            canEdit={canEdit}
            multiline
            value={authorBio}
            onSave={saveAuthorBio}
            className="text-[11px] leading-relaxed"
          />
        </div>
      </div>
    </aside>
  );
}
