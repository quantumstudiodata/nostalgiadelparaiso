import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Nostalgia del paraíso",
  description:
    "Nostalgia del Paraíso: un ecosistema cultural de poesía, lectura y cultura de paz.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${sansBody.variable} ${serifDisplay.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
