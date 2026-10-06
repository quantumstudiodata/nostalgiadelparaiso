import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";
import { AuthShell } from "@/components/site/auth-shell";

export const dynamic = "force-dynamic";

export default async function ConfirmSubscriptionPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const subscriber = token ? await prisma.subscriber.findUnique({ where: { confirmToken: token } }) : null;
  if (subscriber && !subscriber.verified) {
    await prisma.subscriber.update({ where: { id: subscriber.id }, data: { verified: true, confirmToken: null } });
    await notify("subscriber", `Nueva suscripción confirmada: ${subscriber.email}`, "/admin/suscriptores");
  }

  return (
    <AuthShell
      title={subscriber ? "¡Suscripción confirmada!" : "Enlace no válido"}
      subtitle={subscriber ? "Desde ahora recibirás un aviso en tu correo cada vez que se publique una entrada nueva." : "Este enlace ya se usó o venció. Vuelve a suscribirte desde el sitio."}
    >
      <Link href="/blog" className="block text-center h-11 leading-[44px] bg-ink text-white rounded-full text-sm font-medium">
        Leer las entradas
      </Link>
    </AuthShell>
  );
}
