import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isManager } from "@/lib/permissions";
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
  updateEcosystemItems,
  type EcosystemItem,
} from "@/app/actions/site-content";
import { EcosystemAccordion } from "@/components/site/ecosystem-accordion";
import { AnimatedTitle } from "@/components/site/animated-title";

export const dynamic = "force-dynamic";

const HERO_SUBTITLE_DEFAULT =
  "Una red viva de actividades, personas, textos e ideas que se conectan entre sí para formar comunidad.";

// The author's own blog is not a workshop, so it stays out of the "talleres" lists.
const AUTHOR_BLOG_SLUG = "blog-angeles-nava";

// Used until the accordion is first edited.
const DEFAULT_DESCRIPTIONS: Record<string, string> = {
  "nostalgia-del-paraiso":
    "Taller de poesía que nombra la poesía desde la balanza emocional y técnica para introducirse en las profundidades del lenguaje. Además, cuenta con una capa comunitaria que promueve la cultura de paz.",
  "olas-de-pleamar": "Un grupo de escritoras que promueven la lectura y se ayudan mutuamente.",
  "voces-del-sur":
    "Aquí escriben escritores de nuestra comunidad que son bienvenidos para dejar su huella en este espacio literario.",
  "cultura-de-paz":
    "Círculo de lectura cuyo tema fundamental es la cultura de paz: un espacio donde la lectura es un acto de resistencia frente a las fuerzas que deshumanizan.",
};

export default async function HomePage() {
  const session = await auth();
  const canEdit = isManager(session?.user?.role);

  const [hero, about, author, categories, posts, ecosystem] = await Promise.all([
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
    getSiteBlock<{ items?: EcosystemItem[] }>("home.ecosystem"),
  ]);

  const totalPosts = categories.reduce((sum, c) => sum + c._count.posts, 0);
  const workshops = categories.filter((c) => c.slug !== AUTHOR_BLOG_SLUG);
  const ecosystemItems: EcosystemItem[] =
    ecosystem.items ??
    workshops.map((c) => ({
      id: c.id,
      title: c.name,
      description: DEFAULT_DESCRIPTIONS[c.slug] ?? c.description ?? "",
      url: `/blog?categoria=${c.slug}`,
    }));
  const linkOptions = [
    ...categories.map((c) => ({ label: `Entradas de ${c.name}`, url: `/blog?categoria=${c.slug}` })),
    { label: "Todas las entradas", url: "/blog" },
    { label: "Acerca de nosotros", url: "/acerca-de-nosotros" },
  ];

  const saveHeroTitle = updateSiteBlockField.bind(null, "home.hero", "title");
  const saveHeroSubtitle = updateSiteBlockField.bind(null, "home.hero", "subtitle");
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

      {/* Hero: full-width lilac banner, title left, gradient card with the communities right */}
      <section className="bg-lilac rounded-b-xl">
        <div className="wrap grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-12 pb-7 lg:py-24">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-3 text-[13px] lg:text-sm font-bold tracking-[0.14em] uppercase text-accent-dark">
              <span className="w-7 lg:w-8 h-0.5 bg-accent-dark hero-line" />
              Ecosistema cultural
            </div>
            {canEdit ? (
              <EditableText
                as="h1"
                canEdit
                value={hero.title}
                onSave={saveHeroTitle}
                className="mt-5 lg:mt-7 font-serif font-extrabold text-[42px] sm:text-[60px] lg:text-[76px] leading-[1.03] tracking-[-0.02em]"
              />
            ) : (
              <AnimatedTitle
                text={hero.title}
                className="mt-5 lg:mt-7 font-serif font-extrabold text-[42px] sm:text-[60px] lg:text-[76px] leading-[1.03] tracking-[-0.02em]"
              />
            )}
            <EditableText
              as="p"
              canEdit={canEdit}
              multiline
              value={hero.subtitle ?? HERO_SUBTITLE_DEFAULT}
              onSave={saveHeroSubtitle}
              className="mt-5 lg:mt-8 max-w-[540px] text-[17px] lg:text-[19px] leading-relaxed text-neutral-800 hero-fade"
            />
            <div className="mt-7 lg:mt-10 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3.5">
              <EditableButton
                canEdit={canEdit}
                text={hero.buttonText}
                url={hero.buttonUrl || "/blog"}
                onSave={saveHeroButton}
                className="block sm:inline-block text-center bg-ink text-white rounded-full px-8 py-4 text-[17px] font-medium"
              />
              <EditableButtonList
                canEdit={canEdit}
                buttons={hero.buttons ?? []}
                onSave={saveHeroExtraButtons}
                buttonClassName="inline-block border-[1.5px] border-ink rounded-full px-8 py-[15px] text-[17px] font-medium"
              />
            </div>
          </div>

          <div className="lg:col-span-5 relative rounded-lg overflow-hidden lg:min-h-[480px] text-white">
            <div className="absolute inset-0">
              <EditableImage canEdit={canEdit} url={hero.imageUrl ?? ""} onSave={saveHeroImage} className="w-full h-full">
                <div className="w-full h-full hero-gradient" />
              </EditableImage>
            </div>
            <div className="relative h-full flex flex-col justify-end px-[22px] py-7 lg:p-10 pointer-events-none lg:min-h-[480px]">
              <div className="font-serif italic text-[21px] mb-3 lg:mb-4">En este ecosistema conviven</div>
              <div className="pointer-events-auto">
                <EcosystemAccordion
                  items={ecosystemItems}
                  canEdit={canEdit}
                  onSave={updateEcosystemItems}
                  linkOptions={linkOptions}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent posts */}
      <section className="wrap pt-[72px] lg:pt-[120px]">
        <h2 className="font-serif font-semibold text-[28px] lg:text-[40px] leading-tight">Entradas recientes</h2>
        <div className="mt-[18px] lg:mt-6 flex flex-wrap gap-2 lg:gap-3 text-sm lg:text-[15px]">
          <Link href="/blog" className="bg-ink text-white rounded-full px-3.5 lg:px-5 py-2 lg:py-2.5">
            Todos ({totalPosts})
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/blog?categoria=${c.slug}`}
              className="border border-ink rounded-full px-3.5 lg:px-5 py-[7px] lg:py-[9px] hover:bg-ink hover:text-white"
            >
              {c.name} ({c._count.posts})
            </Link>
          ))}
        </div>
        {posts.length === 0 ? (
          <p className="mt-10 text-neutral-600">Aún no hay entradas publicadas.</p>
        ) : (
          <div className="mt-9 lg:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12 lg:gap-y-16">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* Workshops and community voices */}
      <section id="talleres" className="mt-20 lg:mt-32 bg-navy text-white">
        <div className="wrap py-[72px] lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <h2 className="lg:col-span-4 font-serif italic text-[29px] lg:text-[38px] leading-[1.15]">Talleres y voces de la comunidad</h2>
          <div className="lg:col-start-6 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            {workshops.map((c) => {
              const saveCardTitle = updateCategoryField.bind(null, c.id, "cardTitle");
              const saveCardImage = updateCategoryField.bind(null, c.id, "imageUrl");
              return (
                <div key={c.id} className="flex gap-4 lg:gap-5 items-center bg-white/[0.06] rounded-lg p-3.5 lg:p-[18px]">
                  <EditableImage
                    canEdit={canEdit}
                    url={c.imageUrl ?? ""}
                    onSave={saveCardImage}
                    className="w-[84px] h-[84px] lg:w-[104px] lg:h-[104px] shrink-0 rounded-md overflow-hidden bg-white/10"
                  />
                  <div className="min-w-0">
                    <EditableText
                      as="div"
                      canEdit={canEdit}
                      value={c.cardTitle ?? c.name}
                      onSave={saveCardTitle}
                      className="font-serif font-semibold text-lg lg:text-[19px] leading-snug"
                    />
                    <Link href={`/blog?categoria=${c.slug}`} className="inline-block mt-1.5 text-[15px] text-lilac underline underline-offset-4">
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
      <section className="wrap py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-12 gap-9 lg:gap-12 items-center">
        <div className="lg:col-span-5 flex justify-center">
          <EditableImage
            canEdit={canEdit}
            url={about.imageUrl ?? ""}
            onSave={saveAboutImage}
            className="w-[220px] h-[220px] lg:w-[400px] lg:h-[400px] rounded-full overflow-hidden outline-[12px] lg:outline-[16px] outline-solid outline-lilac"
          />
        </div>
        <div className="lg:col-start-7 lg:col-span-6 text-center lg:text-left">
          <div className="text-[13px] lg:text-sm font-bold tracking-[0.14em] uppercase text-accent-dark">Fundadora</div>
          <h2 className="mt-2.5 lg:mt-3.5 font-serif font-extrabold text-[34px] lg:text-[50px] leading-[1.05]">{author.name || "Ángeles Nava"}</h2>
          <EditableText
            as="div"
            canEdit={canEdit}
            multiline
            value={about.bio}
            onSave={saveAboutBio}
            className="mt-[18px] lg:mt-[22px] text-left text-[17px] leading-[1.75] text-neutral-800"
          />
          <div className="mt-7 lg:mt-8 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
            <EditableButton
              canEdit={canEdit}
              text={about.buttonText}
              url={about.buttonUrl || "/acerca-de-nosotros"}
              onSave={saveAboutButton}
              className="block sm:inline-block text-center bg-ink text-white rounded-full px-8 py-4 text-[17px] font-medium"
            />
            <EditableButtonList
              canEdit={canEdit}
              buttons={about.buttons ?? []}
              onSave={saveAboutExtraButtons}
              buttonClassName="inline-block border-[1.5px] border-ink rounded-full px-8 py-[15px] text-[17px] font-medium"
            />
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
