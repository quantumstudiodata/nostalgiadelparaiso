import { requireManagerPage } from "@/lib/permissions";
import { getSiteBlock } from "@/lib/site-blocks";
import { getSiteSeo } from "@/lib/site-seo";
import { SiteSeoForm } from "@/components/admin/site-seo-form";

export const dynamic = "force-dynamic";

export default async function SiteSeoPage() {
  await requireManagerPage();
  const [saved, seo] = await Promise.all([getSiteBlock<Record<string, string>>("site.seo"), getSiteSeo()]);

  return (
    <div className="px-5 md:px-10 py-9 flex flex-col gap-6">
      <div>
        <h1 className="font-bold text-[28px]">SEO del sitio</h1>
        <p className="mt-1 text-[15px] text-neutral-600 max-w-[720px]">
          Cómo aparece tu página en Google. Lo que dejes vacío usa el texto que se muestra en gris. El SEO de cada entrada se cambia
          dentro de la entrada, en el recuadro “Google (SEO)”.
        </p>
      </div>
      <SiteSeoForm
        saved={saved}
        defaults={{
          title: seo.title,
          description: seo.description,
          keywords: seo.keywords.join(", "),
          homeTitle: seo.title,
          homeDescription: seo.description,
          blogTitle: seo.blog.title,
          blogDescription: seo.blog.description,
          aboutTitle: seo.about.title,
          aboutDescription: seo.about.description,
        }}
      />
    </div>
  );
}
