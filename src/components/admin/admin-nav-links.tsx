"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string; icon: React.ReactNode; match: (p: string) => boolean; indent?: boolean };

const ICONS = {
  cuenta: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </>
  ),
  entradas: <path d="M4 5h16M4 12h16M4 19h10" />,
  categorias: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  escritores: <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />,
  suscriptores: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
  estadisticas: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
};

function Item({ link, active }: { link: NavLink; active: boolean }) {
  return (
    <Link
      href={link.href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-2.5 rounded-full py-2.5 ${link.indent ? "pl-9 pr-4 text-[14px]" : "px-4"} ${
        active ? "bg-lilac text-ink font-medium" : "text-white hover:bg-white/10"
      }`}
    >
      {!link.indent && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          {link.icon}
        </svg>
      )}
      {link.label}
    </Link>
  );
}

export function AdminNavLinks({ manager, writer }: { manager: boolean; writer: boolean }) {
  const pathname = usePathname();
  const isPostPage = (p: string) => p === "/admin" || p.startsWith("/admin/entradas");

  const cuenta: NavLink = { href: "/admin/cuenta", label: "Cuenta", icon: ICONS.cuenta, match: (p) => p.startsWith("/admin/cuenta") };
  const pages: NavLink[] = [
    { href: "/admin", label: "Entradas", icon: ICONS.entradas, match: isPostPage, indent: true },
    ...(manager ? [{ href: "/admin/categorias", label: "Categorías", icon: ICONS.categorias, match: (p: string) => p.startsWith("/admin/categorias"), indent: true }] : []),
  ];
  const management: NavLink[] = manager
    ? [
        { href: "/admin/escritores", label: "Escritores", icon: ICONS.escritores, match: (p) => p.startsWith("/admin/escritores") },
        { href: "/admin/suscriptores", label: "Suscriptores", icon: ICONS.suscriptores, match: (p) => p.startsWith("/admin/suscriptores") },
        { href: "/admin/estadisticas", label: "Estadísticas", icon: ICONS.estadisticas, match: (p) => p.startsWith("/admin/estadisticas") },
      ]
    : [];

  return (
    <nav className="flex flex-col gap-1 text-[15px]">
      <Item link={cuenta} active={cuenta.match(pathname)} />

      {writer && (
        <div className="mt-1">
          <div className="flex items-center gap-2.5 px-4 py-2.5 text-white/90">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="4" y="3" width="16" height="18" rx="2" />
              <path d="M8 8h8M8 12h8M8 16h5" />
            </svg>
            Páginas del sitio
          </div>
          {pages.map((l) => (
            <Item key={l.href} link={l} active={l.match(pathname)} />
          ))}
        </div>
      )}

      {management.map((l) => (
        <Item key={l.href} link={l} active={l.match(pathname)} />
      ))}

      <div className="h-px bg-neutral-800 mx-2 my-3" />
      {manager && (
        <a href="/admin/vista-previa?salir=1&a=/" className="flex items-center gap-2.5 rounded-full px-4 py-2.5 text-white hover:bg-white/10">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          Ver y editar sitio
        </a>
      )}
      <a href={manager ? "/admin/vista-previa" : "/"} className="flex items-center gap-2.5 rounded-full px-4 py-2.5 text-white hover:bg-white/10">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        Ver mi página
      </a>
    </nav>
  );
}
