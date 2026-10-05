import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="max-w-[760px] mx-auto w-full px-6 pt-14 pb-20">
        <h1 className="font-serif font-semibold text-[32px] md:text-[40px] leading-tight">{title}</h1>
        <div className="mt-8 text-[15px] leading-relaxed text-neutral-800 [&_h2]:font-serif [&_h2]:font-semibold [&_h2]:text-xl [&_h2]:text-ink [&_h2]:mt-9 [&_h2]:mb-3 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-1.5">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
