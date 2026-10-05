import Link from "next/link";
import Image from "next/image";
import { signOut } from "@/auth";
import { AdminNavLinks } from "./admin-nav-links";

export function AdminSidebar({
  name,
  role,
  avatarUrl,
}: {
  name: string;
  role: "ADMIN" | "EDITOR";
  avatarUrl?: string | null;
}) {
  return (
    <aside className="lg:w-[248px] shrink-0 bg-ink text-white flex flex-col px-5 py-5 lg:py-7 lg:min-h-screen">
      <Link href="/admin" className="block mx-2 mb-5 lg:mb-7">
        <Image src="/images/logo-blanco.png" alt="Nostalgia del paraíso" width={540} height={244} className="w-[130px] h-auto" />
      </Link>

      <AdminNavLinks />

      <div className="mt-6 lg:mt-auto flex items-center gap-2.5 px-2 pt-3 border-t border-neutral-800">
        <div className="w-9 h-9 rounded-full bg-neutral-700 shrink-0 overflow-hidden">
          {avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="flex-1 min-w-0 text-sm">
          <div className="font-medium truncate">{name}</div>
          <div className="text-xs text-neutral-400">{role === "ADMIN" ? "Administradora" : "Editora"}</div>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
        >
          <button className="text-[13px] text-lilac hover:text-white">Salir</button>
        </form>
      </div>
    </aside>
  );
}
