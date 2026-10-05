"use client";

import { useState, useTransition } from "react";
import { updateSocialLinks } from "@/app/actions/site-content";
import type { SocialLinks } from "@/lib/social-links";

const FIELDS: { key: keyof SocialLinks; label: string; placeholder: string }[] = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@..." },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/..." },
];

export function SocialLinksForm({ links }: { links: SocialLinks }) {
  const [draft, setDraft] = useState(links);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mt-5 bg-white rounded-[10px] p-5 flex flex-col gap-3.5 text-[15px]"
      onSubmit={(e) => {
        e.preventDefault();
        setMessage(null);
        startTransition(async () => {
          try {
            setDraft(await updateSocialLinks(draft));
            setMessage("Enlaces guardados.");
          } catch {
            setMessage("No se pudieron guardar los enlaces. Intenta de nuevo.");
          }
        });
      }}
    >
      {FIELDS.map((f) => (
        <div key={f.key} className="flex flex-col gap-1.5">
          <label htmlFor={`admin-social-${f.key}`} className="font-bold">
            {f.label}
          </label>
          <input
            id={`admin-social-${f.key}`}
            value={draft[f.key]}
            placeholder={f.placeholder}
            onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
            className="h-10 border border-neutral-300 rounded-md px-2.5"
          />
        </div>
      ))}
      <div className="flex items-center gap-4 mt-2">
        <button type="submit" disabled={pending} className="bg-ink text-white rounded-full px-5 py-2.5 font-medium disabled:opacity-60">
          {pending ? "Guardando..." : "Guardar enlaces"}
        </button>
        {message && <span className="text-neutral-700" role="status">{message}</span>}
      </div>
    </form>
  );
}
