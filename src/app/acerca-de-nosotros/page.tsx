import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { canEditSite } from "@/lib/edit-mode";
import { getSiteBlock } from "@/lib/site-blocks";
import { getSocialLinks } from "@/lib/social-links";
import { jsonLdString, siteJsonLd } from "@/lib/seo";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { PostCard } from "@/components/site/post-card";
import { EditableText, EditableImage } from "@/components/site/editable";
import { updateSiteBlockField } from "@/app/actions/site-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ángeles Nava · Acerca de",
  description: "Conoce a Ángeles Nava, escritora, tallerista y fundadora de Nostalgia del Paraíso, un ecosistema cultural de poesía y cultura de paz.",
  alternates: { canonical: "/acerca-de-nosotros" },
  openGraph: { images: [{ url: "/images/angeles-nava.jpeg", alt: "Ángeles Nava" }] },
};

const saveBio = updateSiteBlockField.bind(null, "about.page", "bio");
const saveMainImage = updateSiteBlockField.bind(null, "about.page", "mainImageUrl");
const saveGallery1 = updateSiteBlockField.bind(null, "about.page", "galleryImage1Url");
const saveGallery2 = updateSiteBlockField.bind(null, "about.page", "galleryImage2Url");

const saveNostalgiaTitle = updateSiteBlockField.bind(null, "about.nostalgia", "title");
const saveNostalgiaBody = updateSiteBlockField.bind(null, "about.nostalgia", "body");
const saveNostalgiaImage = updateSiteBlockField.bind(null, "about.nostalgia", "imageUrl");

const NOSTALGIA_DEFAULTS = {
  title: "Acerca de Nostalgia del Paraíso",
  body:
    "Nostalgia del paraíso es un hogar literario donde se promueve la cultura de paz y se entrelaza mi voz como escritora, tallerista, mediadora cultural y fundadora de este ecosistema cultural y umbral del pensamiento con otras voces de la comunidad creando una fusión de contenidos que invitan al disfrute, la reflexión y el diálogo.\n\n" +
    "Este espacio alberga la creatividad literaria de una comunidad que se reúne para escribir, leer, dialogar y reflexionar. Estamos conformados por alumnos del taller: Nostalgia del paraíso, Participantes del Círculo de Lectura sobre Cultura de paz: Nostalgia del Paraíso, Miembros del Taller Olas de Pleamar y otros miembros de la comunidad.\n\n" +
    "Creamos contenido, somos una red comunitaria de palabras que transforman y democratizan la literatura, fomentamos la comprensión profunda, la cultura de paz y, con ello, soñamos con un mundo más humano.\n\n" +
    "Nostalgia del paraíso nos hace dueños de nuestros pensamientos y nuestras emociones, construimos una sensibilidad mucho más sensible, hablamos de lo que somos, fuimos y de lo que podemos llegar a ser; de nuestras experiencias sin censura y de nuestra pasión por la palabra.",
  imageUrl: "/images/acerca-nostalgia.jpg",
};

export default async function AboutPage() {
  const session = await auth();
  const canEdit = await canEditSite(session);

  const [about, nostalgia, recentPosts] = await Promise.all([
    getSiteBlock<{
      bio: string;
      mainImageUrl: string;
      galleryImage1Url: string;
      galleryImage2Url: string;
      bioSize?: string;
    }>("about.page"),
    getSiteBlock<Partial<typeof NOSTALGIA_DEFAULTS> & { titleSize?: string; bodySize?: string }>("about.nostalgia"),
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: { category: true, writer: true },
    }),
  ]);

  const [socialLinks, founder] = await Promise.all([getSocialLinks(), getSiteBlock<{ bio?: string }>("sidebar.author")]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(siteJsonLd(Object.values(socialLinks), founder.bio)) }}
      />
      <SiteHeader />

      <section className="wrap pt-12 lg:pt-20 pb-20 lg:pb-28">
        <h1 className="font-serif font-extrabold text-[34px] lg:text-[52px] leading-[1.08] tracking-[-0.01em] mb-8 lg:mb-10">
          Conoce el rostro
          <br />
          detrás de las entradas
        </h1>

        <div className="bg-lilac rounded-[10px] overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-x-9 gap-y-8 pb-10">
          <EditableText
            as="div"
            canEdit={canEdit}
            multiline
            value={about.bio}
            onSave={saveBio}
            fontSize={about.bioSize}
            onSaveSize={updateSiteBlockField.bind(null, "about.page", "bioSize")}
            className="text-[17px] leading-[1.75] text-black px-6 md:pl-10 md:pr-4 pt-8 md:pt-12"
          />
          <EditableImage
            canEdit={canEdit}
            url={about.mainImageUrl ?? ""}
            alt="Ángeles Nava"
            onSave={saveMainImage}
            className="aspect-[424/544] bg-neutral-200 overflow-hidden"
          />
          <EditableImage
            canEdit={canEdit}
            url={about.galleryImage1Url ?? ""}
            alt="Ángeles Nava en un taller de Nostalgia del Paraíso"
            onSave={saveGallery1}
            className="aspect-[468/306] bg-neutral-200 overflow-hidden"
          />
          <EditableImage
            canEdit={canEdit}
            url={about.galleryImage2Url ?? ""}
            alt="Taller de poesía Nostalgia del Paraíso con Ángeles Nava"
            onSave={saveGallery2}
            className="aspect-[424/299] bg-neutral-200 overflow-hidden"
          />
        </div>
      </section>

      <section className="bg-navy py-12 lg:py-20 px-5 md:px-10">
        <div className="max-w-[1200px] mx-auto bg-white rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
          <EditableImage
            canEdit={canEdit}
            url={nostalgia.imageUrl ?? NOSTALGIA_DEFAULTS.imageUrl}
            alt="Nostalgia del Paraíso, taller de poesía"
            onSave={saveNostalgiaImage}
            className="min-h-[420px] bg-neutral-300 overflow-hidden"
          />
          <div className="px-6 md:px-14 lg:px-20 py-12 md:py-16">
            <EditableText
              as="h2"
              canEdit={canEdit}
              value={nostalgia.title ?? NOSTALGIA_DEFAULTS.title}
              onSave={saveNostalgiaTitle}
              fontSize={nostalgia.titleSize}
              onSaveSize={updateSiteBlockField.bind(null, "about.nostalgia", "titleSize")}
              className="font-serif font-extrabold text-[32px] lg:text-[46px] leading-[1.08] mb-6"
            />
            <EditableText
              as="div"
              canEdit={canEdit}
              multiline
              value={nostalgia.body ?? NOSTALGIA_DEFAULTS.body}
              onSave={saveNostalgiaBody}
              fontSize={nostalgia.bodySize}
              onSaveSize={updateSiteBlockField.bind(null, "about.nostalgia", "bodySize")}
              className="text-[17px] leading-[1.8] text-neutral-900"
            />
          </div>
        </div>
      </section>

      {recentPosts.length > 0 && (
        <section className="wrap pt-20 lg:pt-28 pb-20 lg:pb-28">
          <h2 className="font-serif font-semibold text-[28px] lg:text-[40px] mb-8 lg:mb-12">Entradas recientes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-12 gap-y-12">
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </>
  );
}
