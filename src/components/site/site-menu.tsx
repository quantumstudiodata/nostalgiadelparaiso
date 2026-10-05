"use client";

import Link from "next/link";
import { useState } from "react";

const MENU_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/admin/login", label: "Iniciar sesión" },
  { href: "/acerca-de-nosotros", label: "Acerca de nosotros" },
  { href: "/blog", label: "Todas las entradas" },
  { href: "/blog?categoria=blog-angeles-nava", label: "Blog Ángeles Nava" },
];

/** Black pill menu button that opens the same black dropdown panel as the original site. */
export function SiteMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Menú"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-[60px] rounded-full bg-ink text-white flex items-center justify-center"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {open && (
        <nav className="absolute right-0 top-full mt-2 z-50 w-64 bg-ink text-white p-3 flex flex-col text-center text-sm font-semibold">
          {MENU_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-1.5 border-b border-white/30 hover:bg-neutral-500"
            >
              {link.label}
            </Link>
          ))}
          <button type="button" onClick={() => setOpen(false)} className="mt-1 py-1.5 bg-neutral-500 font-semibold">
            Cerrar
          </button>
        </nav>
      )}
    </div>
  );
}
