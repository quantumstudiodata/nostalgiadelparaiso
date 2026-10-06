"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

type Option = { value: string; label: string };

/** Live search (no Enter needed) plus category, writer and status filters, kept in the URL. */
export function PostsFilters({ categories, authors }: { categories: Option[]; authors: Option[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function update(changes: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.delete("pagina");
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  const estado = params.get("estado") ?? "";
  const selectClass = "h-10 border border-mist rounded-full px-3 text-[14px] bg-white max-w-[200px]";

  return (
    <div className="flex flex-wrap gap-2.5 items-center px-5 py-3">
      <div className="flex-1 min-w-[220px] flex items-center gap-2.5 h-10 border border-mist rounded-full px-4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="7" />
          <path d="M21 21l-5.5-5.5" />
        </svg>
        <input
          type="search"
          aria-label="Buscar entradas"
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => update({ q: value.trim() }), 250);
          }}
          placeholder="Buscar por título o escritor"
          className="flex-1 min-w-0 text-[15px] outline-none bg-transparent"
        />
        {pending && <span className="w-3.5 h-3.5 rounded-full border-2 border-neutral-300 border-t-ink animate-spin" aria-label="Buscando" />}
      </div>
      <select aria-label="Categoría" value={params.get("categoria") ?? ""} onChange={(e) => update({ categoria: e.target.value })} className={selectClass}>
        <option value="">Todas las categorías</option>
        {categories.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      {authors.length > 1 && (
        <select aria-label="Escritor" value={params.get("autor") ?? ""} onChange={(e) => update({ autor: e.target.value })} className={selectClass}>
          <option value="">Todos los escritores</option>
          {authors.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      )}
      <div className="flex gap-1.5">
        {[
          { value: "", label: "Todas" },
          { value: "publicadas", label: "Publicadas" },
          { value: "borradores", label: "Borradores" },
        ].map((f) => (
          <button
            key={f.label}
            type="button"
            aria-pressed={estado === f.value}
            onClick={() => update({ estado: f.value })}
            className={`rounded-full px-3.5 h-10 text-[14px] ${estado === f.value ? "bg-ink text-white" : "border border-ink hover:bg-ink hover:text-white"}`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
