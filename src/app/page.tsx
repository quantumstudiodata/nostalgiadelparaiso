import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { canEditSite } from "@/lib/edit-mode";
import { getSiteBlock } from "@/lib/site-blocks";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { EditableText, EditableButton, EditableButtonList, EditableImage, type EditableButtonItem } from "@/components/site/editable";
import { updateSiteBlockField, updateSiteBlockButton, updateSiteBlockButtons, updateCategoryField } from "@/app/actions/site-content";
import { renameCategory } from "@/app/actions/categories";
import { EcosystemAccordion } from "@/components/site/ecosystem-accordion";
import { RecentPosts } from "@/components/site/recent-posts";
import { AddWorkshopButton } from "@/components/site/add-workshop";
import { AnimatedTitle } from "@/components/site/animated-title";

export const dynamic = "force-dynamic";

const HERO_SUBTITLE_DEFAULT =
  "Una red viva de actividades, personas, textos e ideas que se conectan entre sí para formar comunidad.";

export default async function HomePage() {
  const session = await auth();
  const canEdit = await canEditSite(session);

  const [hero, about, author, categories, posts, sections] = await Promise.all([
    getSiteBlock<{
      title: string;
      titleSize?: string;
      subtitle?: string;
      subtitleSize?: string;
      buttonText: string;
      buttonUrl?: string;
      body: string;
      imageUrl?: string;
      buttons?: EditableButtonItem[];
    }>("home.hero"),
    getSiteBlock<{
      bio: string;
      bioSize?: string;
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
      take: 120,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        category: { select: { id: true, name: true } },
        author: { select: { name: true, avatarUrl: true } },
      },
    }),
    getSiteBlock<Record<string, string | undefined>>("home.sections"),
  ]);

  const totalPosts = categories.reduce((sum, c) => sum + c._count.posts, 0);
  // Categories in the ecosystem feed the accordion and the workshop cards, in the panel's order.
  const workshops = categories.filter((c) => c.inEcosystem);
  const ecosystemItems = workshops.map((c) => ({ id: c.id, name: c.name, description: c.description ?? "", slug: c.slug }));

  const sectionText = (key: string, fallback: string) => ({
    value: sections[key] || fallback,
    onSave: updateSiteBlockField.bind(null, "home.sections", key),
    fontSize: sections[`${key}Size`],
    onSaveSize: updateSiteBlockField.bind(null, "home.sections", `${key}Size`),
  });

  const saveHeroTitle = updateSiteBlockField.bind(null, "home.hero", "title");
  const saveHeroTitleSize = updateSiteBlockField.bind(null, "home.hero", "titleSize");
  const saveHeroSubtitleSize = updateSiteBlockField.bind(null, "home.hero", "subtitleSize");
  const saveAboutBioSize = updateSiteBlockField.bind(null, "home.about", "bioSize");
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
                fontSize={hero.titleSize}
                onSaveSize={saveHeroTitleSize}
                className="mt-5 lg:mt-7 font-serif font-extrabold text-[42px] sm:text-[60px] lg:text-[76px] leading-[1.03] tracking-[-0.02em]"
              />
            ) : (
              <AnimatedTitle
                text={hero.title}
                style={hero.titleSize ? { fontSize: `${hero.titleSize}px` } : undefined}
                className="mt-5 lg:mt-7 font-serif font-extrabold text-[42px] sm:text-[60px] lg:text-[76px] leading-[1.03] tracking-[-0.02em]"
              />
            )}
            <EditableText
              as="p"
              canEdit={canEdit}
              multiline
              value={hero.subtitle ?? HERO_SUBTITLE_DEFAULT}
              onSave={saveHeroSubtitle}
              fontSize={hero.subtitleSize}
              onSaveSize={saveHeroSubtitleSize}
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
                <EcosystemAccordion key={ecosystemItems.map((i) => i.id + i.name).join()} items={ecosystemItems} canEdit={canEdit} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent posts */}
      <section className="wrap pt-[72px] lg:pt-[120px]">
        <EditableText
          as="h2"
          canEdit={canEdit}
          {...sectionText("recentTitle", "Entradas recientes")}
          className="font-serif font-semibold text-[28px] lg:text-[40px] leading-tight"
        />
        <RecentPosts
          posts={posts}
          total={totalPosts}
          categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, count: c._count.posts }))}
        />
      </section>

      {/* Workshops and community voices */}
      <section id="talleres" className="mt-20 lg:mt-32 bg-navy text-white">
        <div className="wrap py-[72px] lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-4">
            <EditableText
              as="h2"
              canEdit={canEdit}
              {...sectionText("workshopsTitle", "Talleres y voces de la comunidad")}
              className="font-serif italic text-[29px] lg:text-[38px] leading-[1.15]"
            />
          </div>
          <div className="lg:col-start-6 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            {workshops.map((c) => {
              const saveCardTitle = renameCategory.bind(null, c.id);
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
                      value={c.name}
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
            {canEdit && <AddWorkshopButton />}
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
            fontSize={about.bioSize}
            onSaveSize={saveAboutBioSize}
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
