import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { canEditSite } from "@/lib/edit-mode";
import { getSiteBlock } from "@/lib/site-blocks";
import { updateSiteBlockField } from "@/app/actions/site-content";
import { ContactForm } from "@/components/site/contact-form";
import { EditableText } from "@/components/site/editable";

const CONTACT_SUBTITLE = "· La palabra es tuya, mía y de todos.";
const ABOUT = "Ecosistema cultural de Ángeles Nava: poesía, talleres y Cultura de Paz.";

export async function SiteFooter() {
  const [session, footer] = await Promise.all([auth(), getSiteBlock<{ contactSubtitle?: string; about?: string }>("site.footer")]);
  const canEdit = await canEditSite(session);

  const saveField = (key: string) => updateSiteBlockField.bind(null, "site.footer", key);

  // Black footer with the logo, links and a compact "Escríbenos" form.
  return (
    <footer id="contacto" className="bg-ink text-white">
      <div className="wrap pt-12 lg:pt-14 pb-6 grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-10 lg:gap-16">
        <div className="flex flex-col gap-4">
          <Image src="/images/logo-blanco.png" alt="Nostalgia del paraíso" width={540} height={244} className="h-12 lg:h-14 w-auto self-start" />
          <EditableText
            as="p"
            canEdit={canEdit}
            multiline
            value={footer.about || ABOUT}
            onSave={saveField("about")}
            className="max-w-[360px] text-sm leading-relaxed text-[#c9c4d3]"
          />
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
            <Link href="/terminos-y-condiciones" className="hover:text-lilac">Términos y Condiciones</Link>
            <Link href="/politica-de-privacidad" className="hover:text-lilac">Política de Privacidad</Link>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="font-serif text-[17px] lg:text-[19px] leading-snug">
            <strong className="font-semibold">Escríbenos</strong>{" "}
            <EditableText
              as="span"
              canEdit={canEdit}
              value={footer.contactSubtitle || CONTACT_SUBTITLE}
              onSave={saveField("contactSubtitle")}
              className="italic text-lilac"
            />
          </h2>
          <ContactForm />
        </div>
      </div>
      <div className="wrap pb-6">
        <p className="pt-5 border-t border-white/10 text-xs text-neutral-400">© 2025 Nostalgia del paraíso</p>
      </div>
    </footer>
  );
}
