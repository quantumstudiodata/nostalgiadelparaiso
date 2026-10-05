import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getSiteBlock } from "@/lib/site-blocks";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { BlogSidebar } from "@/components/site/blog-sidebar";
import { PostCard } from "@/components/site/post-card";
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
      take: 4,
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

      {/* Hero: dark panel with the title on the left, white text card on the right */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#1b1a2c] via-[#d3d6e0] via-60% to-[#1b1a2c]">
        <div className="absolute inset-y-0 left-0 w-full md:w-[40%]">
          <EditableImage canEdit={canEdit} url={hero.imageUrl ?? ""} onSave={saveHeroImage} className="w-full h-full">
            <div className="w-full h-full bg-gradient-to-br from-[#1b1a2c] via-[#3a4566] to-[#c9ccd6]" />
          </EditableImage>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-[40%_60%] md:min-h-[767px] pointer-events-none">
          <div className="relative text-white px-8 md:pl-[155px] md:pr-4 pt-16 md:pt-[100px] pb-16">
            <div className="hidden md:flex absolute left-[30px] top-[290px] flex-col items-center gap-3 text-[11px] tracking-wider">
              <span className="[writing-mode:vertical-rl]">DESLIZA ABAJO</span>
              <svg width="10" height="50" viewBox="0 0 10 50" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M5 0v48M1 44l4 5 4-5" />
              </svg>
            </div>
            <div className="pointer-events-auto">
              <EditableText
                as="h1"
                canEdit={canEdit}
                value={hero.title}
                onSave={saveHeroTitle}
                className="font-serif font-bold text-5xl md:text-[68px] leading-[1.2] mb-8"
              />
            </div>
            <div className="w-16 h-px bg-white mb-3" />
            <div className="flex flex-wrap items-center gap-3 pl-9 pointer-events-auto">
              <EditableButton
                canEdit={canEdit}
                text={hero.buttonText}
                url={hero.buttonUrl || "/acerca-de-nosotros"}
                onSave={saveHeroButton}
                className="text-[11px] text-white md:text-ink"
              />
              <svg width="42" height="24" viewBox="0 0 42 24" fill="none" strokeWidth="3" className="-mt-2 stroke-white md:stroke-black">
                <path d="M2 22 21 4l19 18" />
              </svg>
              <EditableButtonList
                canEdit={canEdit}
                buttons={hero.buttons ?? []}
                onSave={saveHeroExtraButtons}
                buttonClassName="text-xs bg-white/15 px-4 py-2"
              />
            </div>
          </div>

          <div className="bg-white md:mt-[19px] px-6 md:pl-[86px] md:pr-[130px] py-12 md:pt-[86px] pointer-events-auto">
            <EditableText
              as="div"
              canEdit={canEdit}
              multiline
              boldLeads
              value={hero.body}
              onSave={saveHeroBody}
              className="text-[13px] leading-[1.8] text-neutral-800 text-justify"
            />
          </div>
        </div>
      </section>

      {/* Blog list */}
      <section id="entradas" className="max-w-[980px] mx-auto px-6 pt-16 pb-20 grid grid-cols-1 md:grid-cols-[224px_1fr] gap-10 md:gap-16">
        <BlogSidebar
          categories={categories}
          totalPosts={totalPosts}
          authorName={author.name || "Ángeles Nava"}
          authorBio={author.bio}
          authorAvatarUrl={author.avatarUrl}
          canEdit={canEdit}
        />

        <div>
          <h2 className="font-serif font-bold text-2xl mt-24 mb-16">Entradas recientes</h2>
          {posts.length === 0 ? (
            <p className="text-sm text-neutral-500">Aún no hay entradas publicadas.</p>
          ) : (
            <div className="flex flex-col">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link href="/blog" className="text-sm underline underline-offset-4">
              Ver todas las entradas
            </Link>
          </div>
        </div>
      </section>

      {/* Category cards */}
      <section className="max-w-[1260px] mx-auto px-6 py-28">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-10">
          {categories.map((c) => {
            const saveCardTitle = updateCategoryField.bind(null, c.id, "cardTitle");
            const saveCardImage = updateCategoryField.bind(null, c.id, "imageUrl");
            return (
              <div key={c.id} className="flex flex-col items-center text-center">
                <EditableImage
                  canEdit={canEdit}
                  url={c.imageUrl ?? ""}
                  onSave={saveCardImage}
                  className="w-full aspect-[3/4] bg-neutral-300 overflow-hidden mb-4"
                />
                <EditableText
                  as="div"
                  canEdit={canEdit}
                  value={c.cardTitle ?? c.name}
                  onSave={saveCardTitle}
                  className="text-[13px] text-ink mb-3"
                />
                <Link
                  href={`/blog?categoria=${c.slug}`}
                  className="bg-ink text-white text-[13px] px-6 py-2.5 mt-auto"
                >
                  Leer entradas
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* About Ángeles Nava */}
      <section className="bg-mist py-14 px-4">
        <div className="max-w-[1245px] mx-auto bg-white grid grid-cols-1 md:grid-cols-[1fr_408px]">
          <div className="px-8 md:pl-[230px] md:pr-[100px] py-12">
            <h2 className="font-serif font-bold text-[28px] mb-6">Conoce a Ángeles Nava</h2>
            <EditableText
              as="div"
              canEdit={canEdit}
              multiline
              value={about.bio}
              onSave={saveAboutBio}
              className="text-[13px] leading-relaxed text-neutral-800 text-justify mb-8"
            />
            <div className="flex flex-wrap items-center gap-3 pl-7">
              <EditableButton
                canEdit={canEdit}
                text={about.buttonText}
                url={about.buttonUrl || "/acerca-de-nosotros"}
                onSave={saveAboutButton}
                className="text-[11px] text-ink"
              />
              <svg width="42" height="24" viewBox="0 0 42 24" fill="none" stroke="black" strokeWidth="3" className="-mt-2">
                <path d="M2 22 21 4l19 18" />
              </svg>
              <EditableButtonList
                canEdit={canEdit}
                buttons={about.buttons ?? []}
                onSave={saveAboutExtraButtons}
                buttonClassName="inline-block bg-ink text-white text-xs px-6 py-2.5"
              />
            </div>
          </div>
          <EditableImage
            canEdit={canEdit}
            url={about.imageUrl ?? ""}
            onSave={saveAboutImage}
            className="min-h-[360px] md:min-h-[520px] bg-neutral-300 overflow-hidden"
          />
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
