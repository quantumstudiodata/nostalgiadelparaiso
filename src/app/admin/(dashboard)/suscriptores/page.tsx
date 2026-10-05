import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireManager, requireManagerPage } from "@/lib/permissions";
import { emailConfigured } from "@/lib/email";

export const dynamic = "force-dynamic";

async function removeSubscriber(id: string) {
  "use server";
  await requireManager();
  await prisma.subscriber.deleteMany({ where: { id } });
  revalidatePath("/admin/suscriptores");
}

async function addSubscriber(formData: FormData) {
  "use server";
  await requireManager();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
  await prisma.subscriber.upsert({ where: { email }, update: name ? { name } : {}, create: { email, name: name || null } });
  revalidatePath("/admin/suscriptores");
}

export default async function SubscribersPage() {
  await requireManagerPage();
  const subscribers = await prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="px-5 md:px-10 py-9">
      <h1 className="font-bold text-[28px]">Suscriptores</h1>
      <p className="mt-1 text-[15px] text-neutral-600">
        {subscribers.length} {subscribers.length === 1 ? "persona recibe" : "personas reciben"} un correo cada vez que se publica una entrada nueva.
      </p>

      {!emailConfigured() && (
        <div className="mt-4 bg-[#fff4e5] text-[#6b3d00] rounded-lg px-4 py-3 text-[15px]">
          <strong>Los correos automáticos aún no están activados.</strong> Las suscripciones se guardan, pero para enviar los avisos falta configurar
          las variables <code>RESEND_API_KEY</code> y <code>EMAIL_FROM</code> en Vercel.
        </div>
      )}

      <form action={addSubscriber} className="mt-5 bg-white rounded-[10px] p-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-[15px] font-medium">
          Correo
          <input name="email" type="email" required className="h-10 w-64 border border-mist rounded-md px-2.5 text-[15px]" />
        </label>
        <label className="flex flex-col gap-1 text-[15px] font-medium">
          Nombre (opcional)
          <input name="name" className="h-10 w-48 border border-mist rounded-md px-2.5 text-[15px]" />
        </label>
        <button type="submit" className="h-10 bg-ink text-white rounded-full px-4 text-[15px] font-medium">
          Agregar suscriptor
        </button>
      </form>

      <div className="mt-5 bg-white rounded-[10px] overflow-x-auto">
        <div className="min-w-[560px]">
          <div className="grid grid-cols-[1fr_180px_120px_80px] gap-4 px-5 py-2.5 text-xs font-bold tracking-[0.08em] uppercase text-neutral-600 border-b border-neutral-100">
            <span>Correo</span>
            <span>Nombre</span>
            <span>Desde</span>
            <span />
          </div>
          {subscribers.length === 0 && <p className="px-5 py-8 text-center text-neutral-600">Aún no hay suscriptores.</p>}
          {subscribers.map((s) => (
            <div key={s.id} className="grid grid-cols-[1fr_180px_120px_80px] gap-4 items-center px-5 py-2.5 border-b border-neutral-100 last:border-0 text-[15px]">
              <span className="truncate">{s.email}</span>
              <span className="truncate text-neutral-700">{s.name ?? "—"}</span>
              <span className="text-neutral-600">{s.createdAt.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}</span>
              <form action={removeSubscriber.bind(null, s.id)}>
                <button className="text-[13px] text-accent-dark hover:underline">Quitar</button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
