import { siteUrl } from "@/lib/email";

export const SITE_NAME = "Nostalgia del Paraíso";
export const SITE_TITLE = "Nostalgia del Paraíso | Ecosistema cultural";
export const SITE_DESCRIPTION =
  "Nostalgia del Paraíso es el ecosistema cultural de Ángeles Nava, escritora y tallerista: poesía, talleres de escritura, círculos de lectura y cultura de paz.";
export const SITE_KEYWORDS = [
  "Ángeles Nava",
  "Angeles Nava",
  "Nostalgia del Paraíso",
  "Nostalgia del Paraiso",
  "poesía",
  "taller de poesía",
  "taller de escritura",
  "círculo de lectura",
  "cultura de paz",
  "Olas de Pleamar",
  "Voces del Sur",
];

/** Structured data so Google knows the site belongs to Ángeles Nava. */
export function siteJsonLd() {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: SITE_NAME,
        alternateName: ["Nostalgia del Paraiso", "Nostalgia del Paraíso Ángeles Nava"],
        description: SITE_DESCRIPTION,
        inLanguage: "es",
        publisher: { "@id": `${base}/#angeles-nava` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${base}/blog?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Person",
        "@id": `${base}/#angeles-nava`,
        name: "Ángeles Nava",
        alternateName: "Angeles Nava",
        jobTitle: "Escritora, tallerista y promotora de cultura de paz",
        url: `${base}/acerca-de-nosotros`,
        image: `${base}/images/angeles-nava.jpeg`,
        worksFor: { "@id": `${base}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: SITE_NAME,
        url: base,
        logo: `${base}/images/logo.png`,
        founder: { "@id": `${base}/#angeles-nava` },
      },
    ],
  };
}
