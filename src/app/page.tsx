import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getSiteBlock } from "@/lib/site-blocks";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { BlogSidebar } from "@/components/site/blog-sidebar";
import { EditableText, EditableButton, EditableButtonList, EditableImage, type EditableButtonItem } from "@/components/site/editable";
import {
  updateSiteBlockField,
  updateSiteBlockButton,
  updateSiteBlockButtons,
  updateCategoryField,
} from "@/app/actions/site-content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const canEdit = !!session?.user;

  const [hero, about, author, categories, posts] = await Promise.all([
    getSiteBlock<{
      title: string;
      buttonText: string;
      buttonUrl?: string;
      body: string;
      imageUrl?: string;
      buttons?: EditableButtonItem[];
    }>("home.hero"),
    getSiteBlock<{
      bio: string;
      buttonText: string;
      buttonUrl?: string;
      imageUrl: string;
      buttons?: EditableButtonItem[];
    }>("home.about"),
    getSiteBlock<{ name: string; bio: string; avatarUrl: string }>("sidebar.author"),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { posts: true } } },
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 6,
      include: { category: true, author: true },
    }),
  ]);

  const totalPosts = categories.reduce((sum, c) => sum + c._count.posts, 0);

  const saveHeroTitle = updateSiteBlockField.bind(null, "home.hero", "title");
  const saveHeroBody = updateSiteBlockField.bind(null, "home.hero", "body");
  const saveHeroImage = updateSiteBlockField.bind(null, "home.hero", "imageUrl");
  const saveHeroButton = updateSiteBlockButton.bind(null, "home.hero", "button");
  const saveHeroExtraButtons = updateSiteBlockButtons.bind(null, "home.hero");

  const saveAboutBio = updateSiteBlockField.bind(null, "home.about", "bio");
  const saveAboutImage = updateSiteBlockField.bind(null, "home.about", "imageUrl");
  const saveAboutButton = updateSiteBlockButton.bind(null, "home.about", "button");
  const saveAboutExtraButtons = updateSiteBlockButtons.bind(null, "home.about");

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="relative min-h-[520px] overflow-hidden">
        <EditableImage canEdit={canEdit} url={hero.imageUrl ?? ""} onSave={saveHeroImage} className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1c1a2b] via-[#34324a] to-[#6b7280]" />
        </EditableImage>
        {hero.imageUrl && <div className="absolute inset-0 bg-black/45 pointer-events-none" />}

        <div className="site-container relative grid grid-cols-1 md:grid-cols-2 gap-10 items-center min-h-[520px] px-6 md:px-10 py-16 text-white">
          <div>
            <EditableText
              as="h1"
              canEdit={canEdit}
              value={hero.title}
              onSave={saveHeroTitle}
              className="font-serif text-4xl md:text-5xl leading-tight mb-6"
            />
            <div className="w-10 h-px bg-white mb-4" />
            <div className="flex flex-wrap items-center gap-3">
              <EditableButton
                canEdit={canEdit}
                text={hero.buttonText}
                url={hero.buttonUrl || "/acerca-de-nosotros"}
                onSave={saveHeroButton}
                className="text-sm tracking-wide"
              />
              <EditableButtonList
                canEdit={canEdit}
                buttons={hero.buttons ?? []}
                onSave={saveHeroExtraButtons}
                buttonClassName="text-sm tracking-wide bg-white/15 px-4 py-2 rounded"
              />
            </div>
          </div>
          <EditableText
            as="div"
            canEdit={canEdit}
            multiline
            value={hero.body}
            onSave={saveHeroBody}
            className="text-sm leading-relaxed text-white/90 max-h-[420px] overflow-y-auto pr-2"
          />
        </div>
      </section>

      {/* Blog list */}
      <section id="entradas" className="site-container px-6 md:px-10 py-14 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10">
        <BlogSidebar
          categories={categories}
          totalPosts={totalPosts}
          authorName={author.name || "Ángeles Nava"}
          authorBio={author.bio}
          authorAvatarUrl={author.avatarUrl}
          canEdit={canEdit}
        />

        <div>
          <h2 className="font-serif text-2xl mb-6">Entradas recientes</h2>
          {posts.length === 0 ? (
            <p className="text-sm text-neutral-500">
              Aún no hay entradas publicadas.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="border border-neutral-100">
                  <div className="aspect-square bg-neutral-100 overflow-hidden">
                    {post.coverImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-neutral-500 mb-1">{post.author.name}</div>
                    <h3 className="font-serif font-bold text-sm">{post.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Category cards */}
      <section className="site-container px-6 md:px-10 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {categories.map((c) => {
            const saveCardTitle = updateCategoryField.bind(null, c.id, "cardTitle");
            const saveCardImage = updateCategoryField.bind(null, c.id, "imageUrl");
            return (
              <div key={c.id} className="flex flex-col items-center text-center">
                <EditableImage
                  canEdit={canEdit}
                  url={c.imageUrl ?? ""}
                  onSave={saveCardImage}
                  className="w-full aspect-square bg-neutral-200 overflow-hidden mb-3"
                />
                <EditableText
                  as="div"
                  canEdit={canEdit}
                  value={c.cardTitle ?? c.name}
                  onSave={saveCardTitle}
                  className="text-sm mb-3"
                />
                <Link
                  href={`/blog?categoria=${c.slug}`}
                  className="bg-ink text-white text-xs px-4 py-2.5 w-full"
                >
                  Leer entradas
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* About Ángeles Nava */}
      <section className="bg-neutral-100">
        <div className="site-container px-6 md:px-10 py-14 grid grid-cols-1 md:grid-cols-[1fr_420px] gap-10 items-center">
          <div>
            <h2 className="font-serif text-2xl mb-5">Conoce a Ángeles Nava</h2>
            <EditableText
              as="div"
              canEdit={canEdit}
              multiline
              value={about.bio}
              onSave={saveAboutBio}
              className="text-sm leading-relaxed text-neutral-700 mb-6 max-w-xl"
            />
            <div className="flex flex-wrap items-center gap-3">
              <EditableButton
                canEdit={canEdit}
                text={about.buttonText}
                url={about.buttonUrl || "/acerca-de-nosotros"}
                onSave={saveAboutButton}
                className="inline-block bg-accent text-white text-sm px-6 py-2.5"
              />
              <EditableButtonList
                canEdit={canEdit}
                buttons={about.buttons ?? []}
                onSave={saveAboutExtraButtons}
                buttonClassName="inline-block bg-neutral-800 text-white text-sm px-6 py-2.5"
              />
            </div>
          </div>
          <EditableImage
            canEdit={canEdit}
            url={about.imageUrl ?? ""}
            onSave={saveAboutImage}
            className="aspect-[4/3] bg-neutral-300 overflow-hidden"
          />
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
