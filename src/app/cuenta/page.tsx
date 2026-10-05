import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { canWritePosts } from "@/lib/permissions";
import { AuthShell } from "@/components/site/auth-shell";
import { AccountForm } from "@/components/site/account-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mi cuenta · Nostalgia del paraíso" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true } });
  if (!user) redirect("/admin/login");

  return (
    <AuthShell title="Mi cuenta" subtitle="Cambia tu nombre, tu correo o tu contraseña.">
      <AccountForm name={user.name} email={user.email} />
      <p className="mt-5 text-sm text-center text-neutral-600">
        <Link href={canWritePosts(session.user.role) ? "/admin" : "/"} className="underline underline-offset-4">
          {canWritePosts(session.user.role) ? "Volver al panel" : "Volver al sitio"}
        </Link>
      </p>
    </AuthShell>
  );
}
