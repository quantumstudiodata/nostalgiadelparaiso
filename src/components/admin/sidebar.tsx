import Link from "next/link";
import { signOut } from "@/auth";

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
    <div className="w-[236px] shrink-0 bg-ink text-white flex flex-col py-7">
      <div className="px-6 pb-7 border-b border-white/10">
        <div className="font-serif text-lg leading-tight">
          Nostalgia
          <br />
          del paraíso
        </div>
        <div className="text-[11px] uppercase tracking-wide text-neutral-400 mt-1.5">
          Panel de edición
        </div>
      </div>

      <nav className="py-5 px-3 flex flex-col gap-0.5 text-sm">
        <Link href="/admin" className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg hover:bg-white/10">
          Entradas
        </Link>
        <Link href="/admin/categorias" className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg hover:bg-white/10">
          Categorías
        </Link>
        <Link href="/admin/textos" className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg hover:bg-white/10">
          Textos del sitio
        </Link>
      </nav>

      <div className="mt-auto px-6 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full bg-neutral-600 shrink-0 overflow-hidden">
            {avatarUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            )}
          </div>
          <div>
            <div className="text-[13px]">{name}</div>
            <div className="text-[11px] text-neutral-400">
              {role === "ADMIN" ? "Administrador" : "Editora de contenido"}
            </div>
          </div>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
        >
          <button className="text-[12px] text-neutral-400 hover:text-white">
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
