import Link from "next/link";
import { EditableText, EditableImage } from "@/components/site/editable";
import { updateSiteBlockField } from "@/app/actions/site-content";
import { SubscribeForm } from "@/components/site/subscribe-form";

type CategoryWithCount = {
  id: string;
  name: string;
  slug: string;
  _count: { posts: number };
};

const saveAuthorName = updateSiteBlockField.bind(null, "sidebar.author", "name");
const saveAuthorBio = updateSiteBlockField.bind(null, "sidebar.author", "bio");
const saveAuthorAvatar = updateSiteBlockField.bind(null, "sidebar.author", "avatarUrl");

type SidebarItem = { key: string; href: string; label: string; count: number; active: boolean };

export function CategoriesBox({
  categories,
  totalPosts,
  activeSlug,
}: {
  categories: CategoryWithCount[];
  totalPosts: number;
  activeSlug?: string;
}) {
  const items: SidebarItem[] = [
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
    <div className="border border-mist rounded-lg p-5">
      <h2 className="font-serif font-semibold text-xl mb-3">Categorías</h2>
      <nav className="flex flex-col text-sm">
        {items.map((item) =>
          item.active ? (
            <Link
              key={item.key}
              href={item.href}
              aria-current="page"
              className="flex justify-between gap-2 px-3 py-2.5 -mx-3 my-1 bg-ink text-white rounded-full"
            >
              <span>{item.label}</span>
              <span>{item.count}</span>
            </Link>
          ) : (
            <Link
              key={item.key}
              href={item.href}
              className="flex justify-between gap-2 py-2.5 border-b border-neutral-100 last:border-0 hover:text-accent-dark"
            >
              <span>{item.label}</span>
              <span className="text-neutral-500">{item.count}</span>
            </Link>
          ),
        )}
      </nav>
    </div>
  );
}

/** Dark card with a writer's photo, name and bio. Editable only for the founder's sidebar card. */
export function AuthorCard({
  name,
  bio,
  avatarUrl,
  canEdit = false,
  editable = false,
  children,
}: {
  name: string;
  bio: string;
  avatarUrl?: string | null;
  canEdit?: boolean;
  editable?: boolean;
  children?: React.ReactNode;
}) {
  const edit = canEdit && editable;
  return (
    <div className="bg-navy text-white rounded-lg p-6 text-center">
      {(avatarUrl || edit) &&
        (edit ? (
          <EditableImage
            canEdit
            url={avatarUrl ?? ""}
            onSave={saveAuthorAvatar}
            className="w-[110px] h-[110px] rounded-full overflow-hidden mx-auto outline-[6px] outline-solid outline-lilac"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl!} alt="" className="w-[110px] h-[110px] rounded-full object-cover mx-auto outline-[6px] outline-solid outline-lilac" />
        ))}
      {edit ? (
        <EditableText as="h2" canEdit value={name} onSave={saveAuthorName} className="font-serif font-semibold text-2xl mt-4" />
      ) : (
        <h2 className="font-serif font-semibold text-2xl mt-4">{name}</h2>
      )}
      {edit ? (
        <EditableText as="p" canEdit multiline value={bio} onSave={saveAuthorBio} className="mt-3 text-[13px] leading-relaxed text-lilac" />
      ) : (
        bio && <p className="mt-3 text-[13px] leading-relaxed text-lilac whitespace-pre-line">{bio}</p>
      )}
      {children}
    </div>
  );
}

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
      <CategoriesBox categories={categories} totalPosts={totalPosts} activeSlug={activeSlug} />
      <AuthorCard name={authorName} bio={authorBio} avatarUrl={authorAvatarUrl} canEdit={canEdit} editable />
      <SubscribeForm id="suscribirse" />
    </aside>
  );
}
