import { prisma } from "@/lib/prisma";
import { requireManagerPage } from "@/lib/permissions";
import { emailConfigured } from "@/lib/email";
import { RoleSelect, type Role } from "@/components/admin/role-select";

export const dynamic = "force-dynamic";

type Row = { key: string; userId?: string; name: string; email: string; role?: Role; avatarUrl?: string | null; receivesEmail: boolean; since: Date };

export default async function SubscribersPage() {
  const viewer = await requireManagerPage();
  const [users, subscribers] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.subscriber.findMany({ where: { verified: true }, orderBy: { createdAt: "desc" } }),
  ]);
  const subscribed = new Set(subscribers.map((s) => s.email));
  const accountEmails = new Set(users.map((u) => u.email));

  const rows: Row[] = [
    ...users.map((u) => ({
      key: u.id,
      userId: u.id,
      name: u.name,
      email: u.email,
      role: u.role as Role,
      avatarUrl: u.avatarUrl,
      receivesEmail: subscribed.has(u.email),
      since: u.createdAt,
    })),
    ...subscribers
      .filter((s) => !accountEmails.has(s.email))
      .map((s) => ({ key: s.id, name: s.name ?? "Sin nombre", email: s.email, receivesEmail: true, since: s.createdAt })),
  ].sort((a, b) => b.since.getTime() - a.since.getTime());

  return (
    <div className="px-5 md:px-10 py-9">
      <h1 className="font-bold text-[28px]">Suscriptores</h1>
      <p className="mt-1 text-[15px] text-neutral-600">
        Personas que se registraron o se suscribieron. {subscribers.length}{" "}
        {subscribers.length === 1 ? "recibe" : "reciben"} un correo con cada entrada nueva. Cada cuenta es de su dueña: aquí solo se asigna el rol.
      </p>

      {!emailConfigured() && (
        <div className="mt-4 bg-[#fff4e5] text-[#6b3d00] rounded-lg px-4 py-3 text-[15px]">
          <strong>Los correos automáticos aún no están activados.</strong> Falta configurar <code>RESEND_API_KEY</code> y <code>EMAIL_FROM</code> en Vercel.
        </div>
      )}

      <div className="mt-5 bg-white rounded-[10px] overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-[1fr_1fr_250px] gap-4 px-5 py-2.5 text-xs font-bold tracking-[0.08em] uppercase text-neutral-600 border-b border-neutral-100">
            <span>Persona</span>
            <span>Correo</span>
            <span>Rol</span>
          </div>
          {rows.length === 0 && <p className="px-5 py-8 text-center text-neutral-600">Aún no hay suscriptores.</p>}
          {rows.map((r) => (
            <div key={r.key} className="grid grid-cols-[1fr_1fr_250px] gap-4 items-center px-5 py-2.5 border-b border-neutral-100 last:border-0 text-[15px]">
              <div className="flex items-center gap-2.5 min-w-0">
                {r.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-lilac shrink-0 flex items-center justify-center text-[13px] font-medium">{r.name.slice(0, 1).toUpperCase()}</span>
                )}
                <div className="min-w-0">
                  <div className="font-medium truncate">{r.name}</div>
                  <div className="text-[12px] text-neutral-500">
                    {r.since.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                    {r.receivesEmail && " · Recibe entradas por correo"}
                  </div>
                </div>
              </div>
              <span className="truncate">{r.email}</span>
              {r.userId && r.role ? (
                <RoleSelect
                  userId={r.userId}
                  name={r.name}
                  role={r.role}
                  disabled={r.userId === viewer.id || (r.role === "ADMIN" && viewer.role !== "ADMIN")}
                  currentUserIsAdmin={viewer.role === "ADMIN"}
                />
              ) : (
                <span className="text-[14px] text-neutral-600">Solo correo (sin cuenta)</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
