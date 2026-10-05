"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Wix-style "Search" pill that turns into a search box. */
export function SearchPill({ variant = "filled", defaultValue = "" }: { variant?: "filled" | "outline"; defaultValue?: string }) {
  const [open, setOpen] = useState(Boolean(defaultValue));
  const [q, setQ] = useState(defaultValue);
  const router = useRouter();
  const base = variant === "filled" ? "bg-[#ece9f8] border border-[#ece9f8]" : "bg-white border border-ink";

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={`w-full h-8 rounded-full flex items-center justify-center gap-2.5 text-[15px] ${base}`}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="10.5" cy="10.5" r="7" />
          <path d="M21 21l-5.5-5.5" />
        </svg>
        Search
      </button>
    );
  }

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const term = q.trim();
        router.push(term ? `/blog?q=${encodeURIComponent(term)}` : "/blog");
      }}
      className={`w-full h-8 rounded-full flex items-center gap-2 pl-3.5 pr-1 ${base}`}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
        <circle cx="10.5" cy="10.5" r="7" />
        <path d="M21 21l-5.5-5.5" />
      </svg>
      <label htmlFor="blog-search" className="sr-only">Buscar entradas</label>
      <input
        id="blog-search"
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar"
        className="flex-1 min-w-0 bg-transparent text-sm outline-none"
      />
      <button type="submit" aria-label="Buscar" className="w-6 h-6 rounded-full bg-ink text-white flex items-center justify-center shrink-0">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
    </form>
  );
}
