import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ROLE_LABELS, type AppRole } from "@/lib/permissions";
import { ProfileForm, SecurityForm, type Socials } from "@/components/admin/account-forms";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/admin/login");

  const socials = (user.socialLinks ?? {}) as Socials;
  const joined = user.createdAt.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="px-5 md:px-10 py-9 flex flex-col gap-8">
      <div>
        <h1 className="font-bold text-[28px]">Mi cuenta</h1>
        <p className="mt-1 text-[15px] text-neutral-600">
          {ROLE_LABELS[user.role as AppRole]} · Así te verán en el sitio cuando publiques o comentes.
        </p>
      </div>

      <section>
        <h2 className="font-bold text-[19px] mb-3">Perfil</h2>
        <ProfileForm
          name={user.name}
          bio={user.bio ?? ""}
          avatarUrl={user.avatarUrl ?? ""}
          websiteUrl={user.websiteUrl ?? ""}
          socials={socials}
          joined={joined}
        />
      </section>

      <section>
        <h2 className="font-bold text-[19px] mb-3">Seguridad y acceso</h2>
        <SecurityForm email={user.email} />
      </section>
    </div>
  );
}
