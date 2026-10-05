import { getSocialLinks } from "@/lib/social-links";
import { requireManagerPage } from "@/lib/permissions";
import { SocialLinksForm } from "@/components/admin/social-links-form";

export const dynamic = "force-dynamic";

export default async function SocialLinksPage() {
  await requireManagerPage();
  const links = await getSocialLinks();

  return (
    <div className="px-5 md:px-10 py-9 max-w-[640px]">
      <h1 className="font-bold text-[28px]">Redes sociales</h1>
      <p className="mt-1 text-[15px] text-neutral-600">
        Estos enlaces se muestran como íconos en la barra negra de arriba del sitio. Si dejas uno vacío, su ícono no aparece.
      </p>
      <SocialLinksForm links={links} />
    </div>
  );
}
