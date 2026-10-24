import { cache } from "react";
import { getSiteBlock } from "@/lib/site-blocks";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_TITLE } from "@/lib/seo";

export type PageSeo = { title: string; description: string };
export type SiteSeo = { title: string; description: string; keywords: string[]; home: PageSeo; blog: PageSeo; about: PageSeo };

export const SEO_DEFAULTS = {
  blogTitle: "Blog",
  blogDescription: "Poemas, textos y reflexiones de Ángeles Nava y las voces de la comunidad de Nostalgia del Paraíso.",
  aboutTitle: "Ángeles Nava · Acerca de",
  aboutDescription: "Conoce a Ángeles Nava, escritora, tallerista y fundadora de Nostalgia del Paraíso, un ecosistema cultural de poesía y cultura de paz.",
};

/** Site-wide and per-page SEO edited in the panel ("SEO del sitio"); empty fields use the defaults. */
export const getSiteSeo = cache(async (): Promise<SiteSeo> => {
  const f = await getSiteBlock<Record<string, string | undefined>>("site.seo");
  const v = (key: string, fallback: string) => f[key]?.trim() || fallback;
  const description = v("description", SITE_DESCRIPTION);
  const keywords = f.keywords?.trim()
    ? f.keywords.split(",").map((k) => k.trim()).filter(Boolean)
    : SITE_KEYWORDS;
  return {
    title: v("title", SITE_TITLE),
    description,
    keywords,
    home: { title: v("homeTitle", ""), description: v("homeDescription", description) },
    blog: { title: v("blogTitle", SEO_DEFAULTS.blogTitle), description: v("blogDescription", SEO_DEFAULTS.blogDescription) },
    about: { title: v("aboutTitle", SEO_DEFAULTS.aboutTitle), description: v("aboutDescription", SEO_DEFAULTS.aboutDescription) },
  };
});
