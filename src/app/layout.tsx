import type { Metadata } from "next";
import { DM_Sans, Fraunces, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { PageTracker } from "@/components/site/page-tracker";
import { siteUrl } from "@/lib/email";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_TITLE, siteJsonLd } from "@/lib/seo";

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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: "Ángeles Nava" }],
  creator: "Ángeles Nava",
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: "/images/hero-portada.jpg", alt: SITE_NAME }],
  },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION, images: ["/images/hero-portada.jpg"] },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${sansBody.variable} ${serifDisplay.variable} ${playfair.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd()).replace(/</g, "\\u003c") }} />
        {children}
        <PageTracker />
      </body>
    </html>
  );
}
