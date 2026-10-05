"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string; icon: React.ReactNode; match: (p: string) => boolean; managerOnly?: boolean };

const LINKS: NavLink[] = [
  {
    href: "/admin",
    label: "Entradas",
    icon: <path d="M4 5h16M4 12h16M4 19h10" />,
    match: (p) => p === "/admin" || (p.startsWith("/admin/entradas/") && p !== "/admin/entradas/nueva"),
  },
  {
    href: "/admin/entradas/nueva",
    label: "Nueva entrada",
    icon: <path d="M12 5v14M5 12h14" />,
    match: (p) => p === "/admin/entradas/nueva",
  },
  {
    href: "/admin/usuarios",
    label: "Usuarios",
    managerOnly: true,
    icon: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c2 .7 3.5 2.4 3.5 5.2" />
      </>
    ),
    match: (p) => p.startsWith("/admin/usuarios"),
  },
  {
    href: "/admin/suscriptores",
    label: "Suscriptores",
    managerOnly: true,
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </>
    ),
    match: (p) => p.startsWith("/admin/suscriptores"),
  },
  {
    href: "/admin/redes-sociales",
    label: "Redes sociales",
    managerOnly: true,
    icon: (
      <>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
      </>
    ),
    match: (p) => p === "/admin/redes-sociales",
  },
];

export function AdminNavLinks({ manager }: { manager: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row flex-wrap lg:flex-col gap-1 text-[15px]">
      {LINKS.filter((l) => manager || !l.managerOnly).map((link) => {
        const active = link.match(pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2.5 rounded-full px-4 py-3 ${
              active ? "bg-lilac text-ink font-medium" : "text-white hover:bg-white/10"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              {link.icon}
            </svg>
            {link.label}
          </Link>
        );
      })}
      <Link
        href="/cuenta"
        className="flex items-center gap-2.5 rounded-full px-4 py-3 text-white hover:bg-white/10"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
        Mi cuenta
      </Link>
      <div className="hidden lg:block h-px bg-neutral-800 mx-2 my-2.5" />
      <Link href="/" className="flex items-center gap-2.5 rounded-full px-4 py-3 text-white hover:bg-white/10">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" />
        </svg>
        {manager ? "Ver y editar el sitio" : "Ver el sitio"}
      </Link>
    </nav>
  );
}
