import type { Metadata } from "next";
import { Nunito_Sans, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

// Closest Google Fonts to the original Wix site's Avenir Light / Playfair / Cormorant.
const sansBody = Nunito_Sans({
  variable: "--font-sans-body",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

const serifDisplay = Playfair_Display({
  variable: "--font-serif-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "Nostalgia del paraíso",
  description:
    "Nostalgia del Paraíso: un ecosistema cultural de poesía, lectura y cultura de paz.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${sansBody.variable} ${serifDisplay.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
