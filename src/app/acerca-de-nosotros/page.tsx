import { getSiteBlock } from "@/lib/site-blocks";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const about = await getSiteBlock<{ bio: string; imageUrl: string }>("home.about");

  return (
    <>
      <SiteHeader />

      <section className="max-w-4xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-[1fr_360px] gap-10">
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
          {about.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={about.imageUrl} alt="" className="w-full h-full object-cover" />
          )}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
