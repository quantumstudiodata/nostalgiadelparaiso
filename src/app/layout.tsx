import type { Metadata } from "next";
import { DM_Sans, Fraunces, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

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
  title: "Nostalgia del paraíso",
  description:
    "Nostalgia del Paraíso: un ecosistema cultural de poesía, lectura y cultura de paz.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${sansBody.variable} ${serifDisplay.variable} ${playfair.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
