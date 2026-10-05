import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getSiteBlock } from "@/lib/site-blocks";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { PostTile } from "@/components/site/post-card";
import { EditableText, EditableImage } from "@/components/site/editable";
import { updateSiteBlockField } from "@/app/actions/site-content";

export const dynamic = "force-dynamic";

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
  const canEdit = !!session?.user;

  const [about, nostalgia, recentPosts] = await Promise.all([
    getSiteBlock<{
      bio: string;
      mainImageUrl: string;
      galleryImage1Url: string;
      galleryImage2Url: string;
    }>("about.page"),
    getSiteBlock<Partial<typeof NOSTALGIA_DEFAULTS>>("about.nostalgia"),
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { id: true, slug: true, title: true, coverImage: true },
    }),
  ]);

  return (
    <>
      <SiteHeader />

      <section className="max-w-[960px] mx-auto px-6 pt-10 pb-24">
        <h1 className="font-serif font-bold text-4xl md:text-[52px] leading-[1.25] mb-4">
          Conoce el rostro
          <br />
          detrás de las entradas
        </h1>

        <div className="bg-[#eeeeee] grid grid-cols-1 md:grid-cols-2 gap-x-9 gap-y-8 pb-32">
          <EditableText
            as="div"
            canEdit={canEdit}
            multiline
            value={about.bio}
            onSave={saveBio}
            className="text-[15px] leading-snug text-black px-8 md:pl-10 md:pr-4 pt-12"
          />
          <EditableImage
            canEdit={canEdit}
            url={about.mainImageUrl ?? ""}
            onSave={saveMainImage}
            className="aspect-[424/544] bg-neutral-200 overflow-hidden"
          />
          <EditableImage
            canEdit={canEdit}
            url={about.galleryImage1Url ?? ""}
            onSave={saveGallery1}
            className="aspect-[468/306] bg-neutral-200 overflow-hidden"
          />
          <EditableImage
            canEdit={canEdit}
            url={about.galleryImage2Url ?? ""}
            onSave={saveGallery2}
            className="aspect-[424/299] bg-neutral-200 overflow-hidden"
          />
        </div>
      </section>

      <section className="bg-mist py-9 px-4">
        <div className="max-w-[1205px] mx-auto bg-white grid grid-cols-1 md:grid-cols-2">
          <EditableImage
            canEdit={canEdit}
            url={nostalgia.imageUrl ?? NOSTALGIA_DEFAULTS.imageUrl}
            onSave={saveNostalgiaImage}
            className="min-h-[420px] bg-neutral-300 overflow-hidden"
          />
          <div className="px-8 md:px-[95px] py-14 md:pt-[85px] md:pb-6">
            <EditableText
              as="h2"
              canEdit={canEdit}
              value={nostalgia.title ?? NOSTALGIA_DEFAULTS.title}
              onSave={saveNostalgiaTitle}
              className="font-serif font-bold text-4xl md:text-[56px] leading-[1.2] mb-6"
            />
            <EditableText
              as="div"
              canEdit={canEdit}
              multiline
              value={nostalgia.body ?? NOSTALGIA_DEFAULTS.body}
              onSave={saveNostalgiaBody}
              className="text-[15px] leading-[1.9] text-neutral-900"
            />
          </div>
        </div>
      </section>

      {recentPosts.length > 0 && (
        <section className="max-w-[1000px] mx-auto px-6 pt-14 pb-16">
          <h2 className="font-serif font-bold text-[22px] tracking-wider mb-3">Entradas recientes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentPosts.map((post) => (
              <PostTile key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </>
  );
}
