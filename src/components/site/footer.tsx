import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { canEditSite } from "@/lib/edit-mode";
import { getSiteBlock } from "@/lib/site-blocks";
import { updateSiteBlockField } from "@/app/actions/site-content";
import { ContactForm } from "@/components/site/contact-form";
import { EditableText } from "@/components/site/editable";

const CONTACT_TITLE = "Escríbenos. La palabra es tuya, mía y de todos.";

export async function SiteFooter() {
  const [session, footer] = await Promise.all([auth(), getSiteBlock<{ contactTitle?: string; contactTitleSize?: string }>("site.footer")]);
  const canEdit = await canEditSite(session);

  return (
    <>
      <section id="contacto" className="bg-lilac">
        <div className="wrap py-[72px] lg:py-28 grid grid-cols-1 md:grid-cols-12 gap-7 md:gap-12">
          <div className="md:col-span-5">
            <EditableText
              as="h2"
              canEdit={canEdit}
              value={footer.contactTitle || CONTACT_TITLE}
              onSave={updateSiteBlockField.bind(null, "site.footer", "contactTitle")}
              fontSize={footer.contactTitleSize}
              onSaveSize={updateSiteBlockField.bind(null, "site.footer", "contactTitleSize")}
              className="font-serif font-semibold text-[27px] lg:text-[36px] leading-[1.2]"
            />
          </div>
          <ContactForm />
        </div>
      </section>

      <footer className="bg-ink text-white">
        <div className="wrap py-10 lg:py-12 flex flex-col md:flex-row items-center justify-between gap-5 text-[15px] lg:text-base">
          <Image src="/images/logo-blanco.png" alt="Nostalgia del paraíso" width={540} height={244} className="h-[52px] lg:h-14 w-auto" />
          <div className="flex gap-6 lg:gap-8">
            <Link href="/terminos-y-condiciones">Términos y Condiciones</Link>
            <Link href="/politica-de-privacidad">Política de Privacidad</Link>
          </div>
          <span className="text-neutral-300">© {new Date().getFullYear()} Nostalgia del paraíso</span>
        </div>
      </footer>
    </>
  );
}
