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
}: {
  name: string;
  role: AppRole;
  avatarUrl?: string | null;
  manager: boolean;
}) {
  return (
    <aside className="lg:w-[232px] shrink-0 bg-ink text-white flex flex-col px-4 py-4 lg:py-6 lg:min-h-screen lg:sticky lg:top-0 lg:h-screen">
      <Link href="/admin" className="block mx-2 mb-4 lg:mb-6">
        <Image src="/images/logo-blanco.png" alt="Nostalgia del paraíso" width={540} height={244} className="w-[120px] h-auto" />
      </Link>

      <AdminNavLinks manager={manager} />

      <div className="mt-5 lg:mt-auto flex items-center gap-2 px-1.5 pt-3 border-t border-neutral-800">
        <div className="w-9 h-9 rounded-full bg-neutral-700 shrink-0 overflow-hidden">
          {avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="flex-1 min-w-0 text-[15px]">
          <div className="font-medium truncate">{name}</div>
          <div className="text-xs text-neutral-400 truncate">{ROLE_LABELS[role]}</div>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button className="text-[13px] text-lilac hover:text-white">Salir</button>
        </form>
      </div>
    </aside>
  );
}
