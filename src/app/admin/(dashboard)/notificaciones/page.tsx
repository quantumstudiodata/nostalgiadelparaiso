import Link from "next/link";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireManager, requireManagerPage } from "@/lib/permissions";
import { ContactReply } from "@/components/admin/contact-reply";

export const dynamic = "force-dynamic";

const TYPE_ICONS: Record<string, string> = {
  signup: "👤",
  subscriber: "✉️",
  comment: "💬",
  like: "♥",
  message: "📨",
};

async function markAllRead() {
  "use server";
  await requireManager();
  await prisma.notification.updateMany({ where: { read: false }, data: { read: true } });
  revalidatePath("/admin", "layout");
}

async function deleteNotification(id: string) {
  "use server";
  await requireManager();
  await prisma.notification.deleteMany({ where: { id } });
  revalidatePath("/admin", "layout");
}

async function deleteAllNotifications() {
  "use server";
  await requireManager();
  await prisma.notification.deleteMany({});
  revalidatePath("/admin", "layout");
}

async function deleteMessage(id: string) {
  "use server";
  await requireManager();
  await prisma.contactMessage.deleteMany({ where: { id } });
  revalidatePath("/admin/notificaciones");
}

/** Small round "X" that deletes one row. */
function DeleteX({ action, label }: { action: () => Promise<void>; label: string }) {
  return (
    <form action={action} className="shrink-0">
      <button aria-label={label} title={label} className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:bg-panel hover:text-accent-dark">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </form>
  );
}

function when(date: Date) {
  return date.toLocaleString("es-MX", { timeZone: "America/Mexico_City", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export default async function NotificationsPage() {
  await requireManagerPage();
  const startOfDay = new Date(new Date().toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" }) + "T06:00:00Z");
  const [notifications, messages, visitsToday] = await Promise.all([
    prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.pageView.groupBy({ by: ["sessionId"], where: { createdAt: { gte: startOfDay } } }).then((r) => r.length),
  ]);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="px-5 md:px-10 py-9 flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-bold text-[28px]">Notificaciones</h1>
          <p className="mt-1 text-[15px] text-neutral-600">
            Registros, suscripciones, comentarios, reacciones y mensajes. Hoy hubo{" "}
            <Link href="/admin/estadisticas?dias=7" className="underline">
              {visitsToday} {visitsToday === 1 ? "visita" : "visitas"}
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {unread > 0 && (
            <form action={markAllRead}>
              <button className="border border-ink rounded-full px-4 py-2 text-[14px]">Marcar todo como leído</button>
            </form>
          )}
          {notifications.length > 0 && (
            <form action={deleteAllNotifications}>
              <button className="border border-ink rounded-full px-4 py-2 text-[14px]">Borrar todas</button>
            </form>
          )}
        </div>
      </div>

      <section className="bg-white rounded-[10px]">
        {notifications.length === 0 && <p className="px-5 py-8 text-center text-neutral-600">Aún no hay notificaciones.</p>}
        {notifications.map((n) => {
          const body = (
            <>
              <span className="w-8 h-8 shrink-0 rounded-full bg-panel flex items-center justify-center text-[15px]" aria-hidden="true">
                {TYPE_ICONS[n.type] ?? "•"}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block ${n.read ? "" : "font-semibold"}`}>{n.message}</span>
                <span className="block text-[12px] text-neutral-500">{when(n.createdAt)}</span>
              </span>
              {!n.read && <span className="w-2 h-2 rounded-full bg-accent shrink-0" aria-label="Sin leer" />}
            </>
          );
          const className = "flex-1 min-w-0 flex items-center gap-3 py-3 text-[14px]";
          return (
            <div key={n.id} className="flex items-center gap-2 pl-5 pr-3 border-b border-neutral-100 last:border-0 hover:bg-panel/40">
              {n.link ? (
                <Link href={n.link} className={className}>
                  {body}
                </Link>
              ) : (
                <div className={className}>{body}</div>
              )}
              <DeleteX action={deleteNotification.bind(null, n.id)} label="Borrar notificación" />
            </div>
          );
        })}
      </section>

      <section>
        <h2 className="font-bold text-[19px] mb-3">Mensajes</h2>
        <div className="bg-white rounded-[10px]">
          {messages.length === 0 && <p className="px-5 py-8 text-center text-neutral-600">Aún no hay mensajes.</p>}
          {messages.map((m) => (
            <div key={m.id} className="px-5 py-3.5 border-b border-neutral-100 last:border-0 text-[14px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex-1 min-w-0">
                  <strong>{m.name}</strong> ·{" "}
                  <a href={`mailto:${m.email}`} className="underline">
                    {m.email}
                  </a>
                </span>
                <span className="text-[12px] text-neutral-500">{when(m.createdAt)}</span>
                <DeleteX action={deleteMessage.bind(null, m.id)} label="Borrar mensaje" />
              </div>
              <p className="mt-1.5 whitespace-pre-line text-neutral-800">{m.message}</p>
              <ContactReply messageId={m.id} name={m.name} repliedAt={m.repliedAt ? when(m.repliedAt) : null} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
