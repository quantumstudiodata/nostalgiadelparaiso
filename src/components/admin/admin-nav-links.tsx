"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  {
    href: "/admin",
    label: "Entradas",
    icon: <path d="M4 5h16M4 12h16M4 19h10" />,
    match: (p: string) => p === "/admin" || (p.startsWith("/admin/entradas/") && p !== "/admin/entradas/nueva"),
  },
  {
    href: "/admin/entradas/nueva",
    label: "Nueva entrada",
    icon: <path d="M12 5v14M5 12h14" />,
    match: (p: string) => p === "/admin/entradas/nueva",
  },
  {
    href: "/admin/redes-sociales",
    label: "Redes sociales",
    icon: (
      <>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
      </>
    ),
    match: (p: string) => p === "/admin/redes-sociales",
  },
];

export function AdminNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row flex-wrap lg:flex-col gap-1.5">
      {LINKS.map((link) => {
        const active = link.match(pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-full px-4 py-3 text-[15px] ${
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
      <div className="hidden lg:block h-px bg-neutral-800 mx-2 my-3" />
      <Link href="/" className="flex items-center gap-3 rounded-full px-4 py-3 text-[15px] text-white hover:bg-white/10">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" />
        </svg>
        Ver y editar el sitio
      </Link>
    </nav>
  );
}
