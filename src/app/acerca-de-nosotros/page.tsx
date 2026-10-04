import { auth } from "@/auth";
import { getSiteBlock } from "@/lib/site-blocks";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { EditableText, EditableImage } from "@/components/site/editable";
import { updateSiteBlockField } from "@/app/actions/site-content";

export const dynamic = "force-dynamic";

const saveBio = updateSiteBlockField.bind(null, "about.page", "bio");
const saveMainImage = updateSiteBlockField.bind(null, "about.page", "mainImageUrl");
const saveGallery1 = updateSiteBlockField.bind(null, "about.page", "galleryImage1Url");
const saveGallery2 = updateSiteBlockField.bind(null, "about.page", "galleryImage2Url");

export default async function AboutPage() {
  const session = await auth();
  const canEdit = !!session?.user;

  const about = await getSiteBlock<{
    bio: string;
    mainImageUrl: string;
    galleryImage1Url: string;
    galleryImage2Url: string;
  }>("about.page");

  return (
    <>
      <SiteHeader />

      <section className="site-container px-6 md:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-10 mb-10">
          <div>
            <h1 className="font-serif text-3xl leading-tight mb-8">
              Conoce el rostro
              <br />
              detrás de las entradas
            </h1>
            <EditableText
              as="div"
              canEdit={canEdit}
              multiline
              value={about.bio}
              onSave={saveBio}
              className="text-sm leading-relaxed text-neutral-700"
            />
          </div>
          <EditableImage
            canEdit={canEdit}
            url={about.mainImageUrl ?? ""}
            onSave={saveMainImage}
            className="aspect-[3/4] bg-neutral-100 overflow-hidden"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl">
          <EditableImage
            canEdit={canEdit}
            url={about.galleryImage1Url ?? ""}
            onSave={saveGallery1}
            className="aspect-[4/3] bg-neutral-100 overflow-hidden"
          />
          <EditableImage
            canEdit={canEdit}
            url={about.galleryImage2Url ?? ""}
            onSave={saveGallery2}
            className="aspect-[4/3] bg-neutral-100 overflow-hidden"
          />
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
