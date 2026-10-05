import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AuthShell } from "@/components/site/auth-shell";

export const dynamic = "force-dynamic";

async function unsubscribe(formData: FormData) {
  "use server";
  const token = String(formData.get("token") ?? "");
  if (token) await prisma.subscriber.deleteMany({ where: { unsubscribeToken: token } });
}

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const subscriber = token ? await prisma.subscriber.findUnique({ where: { unsubscribeToken: token } }) : null;

  return (
    <AuthShell title="Dejar de recibir correos" subtitle="Nostalgia del paraíso">
      {subscriber ? (
        <form action={unsubscribe} className="flex flex-col gap-4">
          <input type="hidden" name="token" value={token} />
          <p className="text-sm">
            Ya no enviaremos correos a <strong>{subscriber.email}</strong>.
          </p>
          <button type="submit" className="h-11 bg-ink text-white rounded-full text-sm font-medium">
            Confirmar baja
          </button>
        </form>
      ) : (
        <p className="text-sm">
          Este correo ya no está suscrito. <Link href="/" className="underline underline-offset-4">Volver al inicio</Link>
        </p>
      )}
    </AuthShell>
  );
}
