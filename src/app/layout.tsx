import type { Metadata } from "next";
import { DM_Sans, Fraunces, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { PageTracker } from "@/components/site/page-tracker";
import { siteUrl } from "@/lib/email";
import { ADSENSE_CLIENT, SITE_NAME } from "@/lib/seo";
import { getSiteSeo } from "@/lib/site-seo";

const sansBody = DM_Sans({
  variable: "--font-sans-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const serifDisplay = Fraunces({
  variable: "--font-serif-display",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  style: ["normal", "italic"],
});

// The blog list and post pages keep the original Wix look: Playfair titles, Cormorant headings.
const playfair = Playfair_Display({
  variable: "--font-playfair-src",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant-src",
  subsets: ["latin"],
  weight: ["600"],
});

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSiteSeo();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: seo.title, template: `%s | ${SITE_NAME}` },
    description: seo.description,
    keywords: seo.keywords,
    authors: [{ name: "Ángeles Nava" }],
    creator: "Ángeles Nava",
    applicationName: SITE_NAME,
    openGraph: {
      type: "website",
      locale: "es_MX",
      siteName: SITE_NAME,
      title: seo.title,
      description: seo.description,
      url: "/",
      images: [{ url: "/images/hero-portada.jpg", width: 1920, height: 1282, type: "image/jpeg", alt: SITE_NAME }],
    },
    alternates: { types: { "application/rss+xml": [{ url: "/feed.xml", title: "Nostalgia del Paraíso" }] } },
    // Lets AdSense confirm the site belongs to the account.
    other: { "google-adsense-account": ADSENSE_CLIENT },
    twitter: { card: "summary_large_image", title: seo.title, description: seo.description, images: ["/images/hero-portada.jpg"] },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${sansBody.variable} ${serifDisplay.variable} ${playfair.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <PageTracker />
      </body>
    </html>
  );
}
