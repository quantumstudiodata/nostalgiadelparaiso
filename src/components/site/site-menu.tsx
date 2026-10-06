"use client";

import Link from "next/link";
import { useState } from "react";
import type { NavItem } from "@/components/site/nav-links";

/** Phone-width menu: a round button that opens the nav as a dropdown. */
export function SiteMenu({ links }: { links: NavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        aria-label="Menú"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="w-12 h-12 rounded-full bg-ink text-white flex items-center justify-center"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open && (
        <nav className="absolute right-0 top-full mt-2 z-50 w-60 bg-ink text-white rounded-[10px] p-2 flex flex-col text-[17px]">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="px-4 py-3 rounded-full hover:bg-white/10">
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
