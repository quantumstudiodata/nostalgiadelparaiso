import { getSocialLinks } from "@/lib/social-links";
import { SocialLinksForm } from "@/components/admin/social-links-form";

export const dynamic = "force-dynamic";

export default async function SocialLinksPage() {
  const links = await getSocialLinks();

  return (
    <div className="px-6 md:px-12 py-10 max-w-[720px]">
      <h1 className="font-serif font-semibold text-[40px] leading-tight">Redes sociales</h1>
      <p className="mt-1.5 text-[15px] text-neutral-600">
        Estos enlaces se muestran como íconos en la barra negra de arriba del sitio. Si dejas uno vacío, su ícono no aparece.
      </p>
      <SocialLinksForm links={links} />
    </div>
  );
}
