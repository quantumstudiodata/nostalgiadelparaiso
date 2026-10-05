"use client";

import { useState, useTransition } from "react";
import { updateSocialLinks } from "@/app/actions/site-content";
import type { SocialLinks } from "@/lib/social-links";
import { PencilIcon } from "@/components/site/icons";

const FIELDS: { key: keyof SocialLinks; label: string; placeholder: string }[] = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@..." },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/..." },
];

/** Pencil next to the header's social icons; opens a panel to edit their links. */
export function SocialLinksEditor({ links }: { links: SocialLinks }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(links);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await updateSocialLinks(draft);
        setOpen(false);
      } catch {
        setError("No se pudieron guardar los enlaces. Intenta de nuevo.");
      }
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Editar redes sociales"
        title="Editar redes sociales"
        onClick={() => {
          setDraft(links);
          setOpen((v) => !v);
        }}
        className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center"
      >
        <PencilIcon />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-3 z-50 w-[min(400px,calc(100vw-32px))] bg-white text-ink rounded-[10px] shadow-[0_18px_50px_rgba(0,0,0,0.28)] p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-semibold text-2xl">Redes sociales</h2>
            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => setOpen(false)}
              className="w-8 h-8 flex items-center justify-center"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-neutral-600 mt-1.5 mb-4">
            Pega el enlace de cada perfil. Si dejas uno vacío, su ícono no se muestra.
          </p>
          <div className="flex flex-col gap-3.5">
            {FIELDS.map((f) => (
              <div key={f.key} className="flex flex-col gap-1.5">
                <label htmlFor={`social-${f.key}`} className="text-[13px] font-bold">
                  {f.label}
                </label>
                <input
                  id={`social-${f.key}`}
                  value={draft[f.key]}
                  placeholder={f.placeholder}
                  onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                  className="h-11 border border-neutral-300 rounded-md px-3 text-sm"
                />
              </div>
            ))}
          </div>
          {error && <p className="text-sm text-red-700 mt-3">{error}</p>}
          <div className="mt-5 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-11 px-5 border border-ink rounded-full text-sm"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className="h-11 px-6 bg-ink text-white rounded-full text-sm font-medium disabled:opacity-60"
            >
              {pending ? "Guardando..." : "Guardar enlaces"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
