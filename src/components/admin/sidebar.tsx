import Link from "next/link";
import Image from "next/image";
import { signOut } from "@/auth";
import { ROLE_LABELS, type AppRole } from "@/lib/permissions";
import { AdminNavLinks } from "./admin-nav-links";

export function AdminSidebar({
  name,
  role,
  avatarUrl,
  manager,
  writer,
  unread,
}: {
  name: string;
  role: AppRole;
  avatarUrl?: string | null;
  manager: boolean;
  writer: boolean;
  unread: number;
}) {
  return (
    <aside className="lg:w-[240px] shrink-0 bg-ink text-white flex flex-col px-4 py-4 lg:py-6 lg:min-h-screen lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
      <div className="flex items-center justify-between mx-2 mb-4 lg:mb-6">
        <Link href="/admin">
          <Image src="/images/logo-blanco.png" alt="Nostalgia del paraíso" width={540} height={244} className="w-[112px] h-auto" />
        </Link>
        {manager && (
          <Link
            href="/admin/notificaciones"
            aria-label={unread ? `Notificaciones: ${unread} sin leer` : "Notificaciones"}
            title="Notificaciones"
            className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9Z" />
              <path d="M10 19a2 2 0 0 0 4 0" />
            </svg>
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-accent text-white text-[11px] font-bold flex items-center justify-center">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </Link>
        )}
      </div>

      <AdminNavLinks manager={manager} writer={writer} />

      <div className="mt-5 lg:mt-auto flex items-center gap-2 px-1.5 pt-3 border-t border-neutral-800">
        <div className="w-9 h-9 rounded-full bg-neutral-700 shrink-0 overflow-hidden">
          {avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="flex-1 min-w-0 text-[15px]">
          <Link href="/admin/cuenta" className="block font-medium truncate hover:underline">{name}</Link>
          <div className="text-[13px] text-neutral-400 truncate">{ROLE_LABELS[role]}</div>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button aria-label="Cerrar sesión" title="Cerrar sesión" className="w-9 h-9 rounded-full flex items-center justify-center text-lilac hover:bg-white/10 hover:text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
              <path d="M10 17l-5-5 5-5M5 12h11" />
            </svg>
          </button>
        </form>
      </div>
    </aside>
  );
}
