import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="max-w-[760px] mx-auto w-full px-5 md:px-10 pt-14 lg:pt-20 pb-20 lg:pb-28">
        <h1 className="font-serif font-semibold text-[30px] lg:text-[40px] leading-tight">{title}</h1>
        <div className="mt-8 text-[17px] leading-[1.75] text-neutral-800 [&_h2]:font-serif [&_h2]:font-semibold [&_h2]:text-[22px] [&_h2]:text-ink [&_h2]:mt-9 [&_h2]:mb-3 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-1.5">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
