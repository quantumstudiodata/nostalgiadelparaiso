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
  const items = [
    { key: "todos", href: "/blog", label: "Todos los textos", count: totalPosts, active: !activeSlug },
    ...categories.map((c) => ({
      key: c.id,
      href: `/blog?categoria=${c.slug}`,
      label: c.name,
      count: c._count.posts,
      active: c.slug === activeSlug,
    })),
  ];

  return (
    <aside className="flex flex-col gap-7">
      <div className="border border-mist rounded-lg p-[22px]">
        <h2 className="font-serif font-semibold text-[22px] mb-3.5">Categorías</h2>
        <nav className="flex flex-col text-[15px]">
          {items.map((item) =>
            item.active ? (
              <Link
                key={item.key}
                href={item.href}
                aria-current="page"
                className="flex justify-between px-3 py-2.5 -mx-3 my-1 bg-ink text-white rounded-full"
              >
                <span>{item.label}</span>
                <span>{item.count}</span>
              </Link>
            ) : (
              <Link
                key={item.key}
                href={item.href}
                className="flex justify-between py-2.5 border-b border-neutral-100 last:border-0 hover:text-accent-dark"
              >
                <span>{item.label}</span>
                <span className="text-neutral-500">{item.count}</span>
              </Link>
            ),
          )}
        </nav>
      </div>

      <div className="bg-navy text-white rounded-lg p-7 text-center">
        {(authorAvatarUrl || canEdit) && (
          <EditableImage
            canEdit={canEdit}
            url={authorAvatarUrl ?? ""}
            onSave={saveAuthorAvatar}
            className="w-[120px] h-[120px] rounded-full overflow-hidden mx-auto outline-[6px] outline-solid outline-lilac"
          />
        )}
        <EditableText
          as="h2"
          canEdit={canEdit}
          value={authorName}
          onSave={saveAuthorName}
          className="font-serif font-semibold text-[28px] mt-[18px]"
        />
        <EditableText
          as="p"
          canEdit={canEdit}
          multiline
          value={authorBio}
          onSave={saveAuthorBio}
          className="mt-3 text-sm leading-relaxed text-lilac"
        />
      </div>

      <form id="suscribirse" className="bg-lilac rounded-lg p-[22px] flex flex-col gap-2.5">
        <h2 className="font-serif font-semibold text-xl">Recibe todas las entradas</h2>
        <label htmlFor="sidebar-email" className="text-[13px] font-medium">Email</label>
        <input id="sidebar-email" type="email" className="h-11 rounded-md bg-white px-3 text-[15px]" />
        <button type="submit" className="h-11 rounded-full bg-ink text-white text-sm font-medium">
          Suscribirse
        </button>
      </form>
    </aside>
  );
}
