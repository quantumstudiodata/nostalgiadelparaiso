import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getSiteBlock } from "@/lib/site-blocks";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { PostCard } from "@/components/site/post-card";
import { EditableText, EditableButton, EditableButtonList, EditableImage, type EditableButtonItem } from "@/components/site/editable";
import {
  updateSiteBlockField,
  updateSiteBlockButton,
  updateSiteBlockButtons,
  updateCategoryField,
} from "@/app/actions/site-content";

export const dynamic = "force-dynamic";

const HERO_SUBTITLE_DEFAULT =
  "Una red viva de actividades, personas, textos e ideas que se conectan entre sí para formar comunidad.";

// The author's own blog is not a workshop, so it stays out of the "talleres" lists.
const AUTHOR_BLOG_SLUG = "blog-angeles-nava";

export default async function HomePage() {
  const session = await auth();
  const canEdit = !!session?.user;

  const [hero, about, author, categories, posts] = await Promise.all([
    getSiteBlock<{
      title: string;
      subtitle?: string;
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
    getSiteBlock<{ name: string }>("sidebar.author"),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { posts: { where: { status: "PUBLISHED" } } } } },
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 6,
      include: { category: true, author: true },
    }),
  ]);

  const totalPosts = categories.reduce((sum, c) => sum + c._count.posts, 0);
  const workshops = categories.filter((c) => c.slug !== AUTHOR_BLOG_SLUG);

  const saveHeroTitle = updateSiteBlockField.bind(null, "home.hero", "title");
  const saveHeroSubtitle = updateSiteBlockField.bind(null, "home.hero", "subtitle");
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

      {/* Hero: full-width lilac banner, title left, gradient card with the workshops right */}
      <section className="bg-lilac rounded-b-[10px]">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 px-6 lg:pl-0 lg:pr-10 py-10 lg:min-h-[640px]">
          <div className="lg:col-span-7 lg:px-14 pt-6 lg:pt-14 pb-4">
            <div className="inline-flex items-center gap-2.5 text-[13px] font-bold tracking-[0.12em] uppercase text-accent-dark">
              <span className="w-7 h-0.5 bg-accent-dark" />
              Ecosistema cultural
            </div>
            <EditableText
              as="h1"
              canEdit={canEdit}
              value={hero.title}
              onSave={saveHeroTitle}
              className="mt-[22px] font-serif font-extrabold text-[56px] sm:text-[80px] lg:text-[104px] leading-[0.95] tracking-[-0.02em]"
            />
            <EditableText
              as="p"
              canEdit={canEdit}
              multiline
              value={hero.subtitle ?? HERO_SUBTITLE_DEFAULT}
              onSave={saveHeroSubtitle}
              className="mt-8 max-w-[520px] text-[19px] leading-relaxed text-neutral-800"
            />
            <div className="mt-9 flex flex-wrap items-center gap-3.5">
              <EditableButton
                canEdit={canEdit}
                text={hero.buttonText}
                url={hero.buttonUrl || "/blog"}
                onSave={saveHeroButton}
                className="inline-block bg-ink text-white rounded-full px-7 py-4 text-[15px] font-medium"
              />
              <EditableButtonList
                canEdit={canEdit}
                buttons={hero.buttons ?? []}
                onSave={saveHeroExtraButtons}
                buttonClassName="inline-block border-[1.5px] border-ink rounded-full px-7 py-[15px] text-[15px] font-medium"
              />
            </div>
          </div>

          <div className="lg:col-span-5 relative rounded-md overflow-hidden min-h-[420px] text-white">
            <div className="absolute inset-0">
              <EditableImage canEdit={canEdit} url={hero.imageUrl ?? ""} onSave={saveHeroImage} className="w-full h-full">
                <div className="w-full h-full hero-gradient" />
              </EditableImage>
            </div>
            <div className="relative h-full flex flex-col justify-end p-8 lg:p-12 pointer-events-none">
              <div className="font-serif italic text-[22px] mb-5">En este ecosistema conviven</div>
              <div className="flex flex-col border-t border-white/45">
                {workshops.map((c, i) => (
                  <Link
                    key={c.id}
                    href={`/blog?categoria=${c.slug}`}
                    className="pointer-events-auto flex justify-between py-4 border-b border-white/45 text-[17px] hover:text-lilac"
                  >
                    <span>{c.name}</span>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent posts */}
      <section className="max-w-[1280px] mx-auto w-full px-6 md:px-14 pt-[88px]">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <h2 className="font-serif font-semibold text-4xl md:text-[56px] tracking-[-0.01em]">Entradas recientes</h2>
          <div className="flex flex-wrap gap-2.5 lg:justify-end">
            <Link href="/blog" className="bg-ink text-white rounded-full px-[18px] py-2.5 text-sm">
              Todos ({totalPosts})
            </Link>
            {categories.map((c) => (
              <Link key={c.id} href={`/blog?categoria=${c.slug}`} className="border border-ink rounded-full px-[18px] py-[9px] text-sm hover:bg-ink hover:text-white">
                {c.name} ({c._count.posts})
              </Link>
            ))}
          </div>
        </div>
        {posts.length === 0 ? (
          <p className="mt-10 text-neutral-600">Aún no hay entradas publicadas.</p>
        ) : (
          <div className="mt-11 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-12">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* The ecosystem, in its own words */}
      <section className="max-w-[1280px] mx-auto w-full px-6 md:px-14 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <h2 className="lg:col-span-4 font-serif italic text-4xl md:text-[44px] leading-[1.1]">¿Qué es Nostalgia del paraíso?</h2>
          <EditableText
            as="div"
            canEdit={canEdit}
            multiline
            boldLeads
            value={hero.body}
            onSave={saveHeroBody}
            className="lg:col-span-8 text-[16px] leading-[1.8] text-neutral-800"
          />
        </div>
      </section>

      {/* Workshops and community voices */}
      <section id="talleres" className="mt-[104px] bg-navy text-white px-6 md:px-14 py-[88px]">
        <div className="max-w-[1168px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
          <h2 className="lg:col-span-4 font-serif italic text-4xl md:text-5xl leading-[1.05]">Talleres y voces de la comunidad</h2>
          <div className="lg:col-start-6 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {workshops.map((c) => {
              const saveCardTitle = updateCategoryField.bind(null, c.id, "cardTitle");
              const saveCardImage = updateCategoryField.bind(null, c.id, "imageUrl");
              return (
                <div key={c.id} className="flex gap-[18px] items-center bg-white/[0.06] rounded-md p-3.5">
                  <EditableImage
                    canEdit={canEdit}
                    url={c.imageUrl ?? ""}
                    onSave={saveCardImage}
                    className="w-[92px] h-[92px] shrink-0 rounded overflow-hidden bg-white/10"
                  />
                  <div className="min-w-0">
                    <EditableText
                      as="div"
                      canEdit={canEdit}
                      value={c.cardTitle ?? c.name}
                      onSave={saveCardTitle}
                      className="font-serif font-semibold text-xl leading-snug"
                    />
                    <Link href={`/blog?categoria=${c.slug}`} className="inline-block mt-1.5 text-sm text-lilac underline underline-offset-4">
                      {c._count.posts} textos · Leer entradas
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About the founder */}
      <section className="max-w-[1280px] mx-auto w-full px-6 md:px-14 py-[104px] flex flex-col md:flex-row gap-12 md:gap-[72px] items-center">
        <EditableImage
          canEdit={canEdit}
          url={about.imageUrl ?? ""}
          onSave={saveAboutImage}
          className="w-[280px] h-[280px] md:w-[380px] md:h-[380px] shrink-0 rounded-full overflow-hidden outline-[14px] outline-solid outline-lilac"
        />
        <div>
          <div className="text-[13px] font-bold tracking-[0.12em] uppercase text-accent-dark">Fundadora</div>
          <h2 className="mt-3 font-serif font-extrabold text-5xl md:text-[72px] leading-none">{author.name || "Ángeles Nava"}</h2>
          <EditableText
            as="div"
            canEdit={canEdit}
            multiline
            value={about.bio}
            onSave={saveAboutBio}
            className="mt-[22px] max-w-[600px] text-lg leading-relaxed text-neutral-800"
          />
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <EditableButton
              canEdit={canEdit}
              text={about.buttonText}
              url={about.buttonUrl || "/acerca-de-nosotros"}
              onSave={saveAboutButton}
              className="inline-block bg-ink text-white rounded-full px-7 py-4 text-[15px] font-medium"
            />
            <EditableButtonList
              canEdit={canEdit}
              buttons={about.buttons ?? []}
              onSave={saveAboutExtraButtons}
              buttonClassName="inline-block border-[1.5px] border-ink rounded-full px-7 py-[15px] text-[15px] font-medium"
            />
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
