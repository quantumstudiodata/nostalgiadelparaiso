import { getSiteBlock } from "@/lib/site-blocks";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
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
            <div className="text-sm leading-relaxed text-neutral-700 whitespace-pre-line">
              {about.bio}
            </div>
          </div>
          <div className="aspect-[3/4] bg-neutral-100 overflow-hidden">
            {about.mainImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={about.mainImageUrl} alt="Ángeles Nava" className="w-full h-full object-cover" />
            )}
          </div>
        </div>

        {(about.galleryImage1Url || about.galleryImage2Url) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl">
            {about.galleryImage1Url && (
              <div className="aspect-[4/3] bg-neutral-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={about.galleryImage1Url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            {about.galleryImage2Url && (
              <div className="aspect-[4/3] bg-neutral-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={about.galleryImage2Url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        )}
      </section>

      <SiteFooter />
    </>
  );
}
