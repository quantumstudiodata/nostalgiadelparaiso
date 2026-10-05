"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { EcosystemItem } from "@/app/actions/site-content";
import { PencilIcon } from "@/components/site/icons";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/** "En este ecosistema conviven": each community expands to its description, which links to its posts. */
export function EcosystemAccordion({
  items: initialItems,
  canEdit,
  onSave,
  linkOptions,
}: {
  items: EcosystemItem[];
  canEdit: boolean;
  onSave: (items: EcosystemItem[]) => Promise<void>;
  linkOptions: { label: string; url: string }[];
}) {
  const [items, setItems] = useState(initialItems);
  const [openId, setOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EcosystemItem | null>(null);
  const [pending, startTransition] = useTransition();

  function persist(next: EcosystemItem[]) {
    setItems(next);
    startTransition(() => onSave(next));
  }

  function startEdit(item: EcosystemItem) {
    setDraft(item);
    setEditingId(item.id);
    setOpenId(item.id);
  }

  function saveDraft() {
    if (!draft || !draft.title.trim()) return;
    const exists = items.some((i) => i.id === draft.id);
    persist(exists ? items.map((i) => (i.id === draft.id ? draft : i)) : [...items, draft]);
    setEditingId(null);
    setDraft(null);
  }

  function remove(id: string) {
    if (!confirm("¿Quitar esta comunidad de la lista?")) return;
    persist(items.filter((i) => i.id !== id));
  }

  function addNew() {
    const item = { id: crypto.randomUUID(), title: "", description: "", url: linkOptions[0]?.url ?? "/blog" };
    setDraft(item);
    setEditingId(item.id);
    setOpenId(item.id);
  }

  const editor = (d: EcosystemItem) => (
    <div className="bg-white text-ink rounded-md p-4 my-3 flex flex-col gap-2.5 text-sm">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-bold">Nombre</span>
        <input value={d.title} onChange={(e) => setDraft({ ...d, title: e.target.value })} className="h-9 border border-neutral-300 rounded px-2" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-bold">Descripción (se despliega al hacer clic)</span>
        <textarea rows={4} value={d.description} onChange={(e) => setDraft({ ...d, description: e.target.value })} className="border border-neutral-300 rounded px-2 py-1.5" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-bold">Al hacer clic lleva a</span>
        <select
          value={linkOptions.some((o) => o.url === d.url) ? d.url : "__custom"}
          onChange={(e) => setDraft({ ...d, url: e.target.value === "__custom" ? "" : e.target.value })}
          className="h-9 border border-neutral-300 rounded px-2 bg-white"
        >
          {linkOptions.map((o) => (
            <option key={o.url} value={o.url}>{o.label}</option>
          ))}
          <option value="__custom">Otro enlace…</option>
        </select>
        {!linkOptions.some((o) => o.url === d.url) && (
          <input value={d.url} placeholder="https://… o /blog?categoria=…" onChange={(e) => setDraft({ ...d, url: e.target.value })} className="h-9 border border-neutral-300 rounded px-2" />
        )}
      </label>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={() => { setEditingId(null); setDraft(null); }} className="px-3 py-1.5 border border-neutral-300 rounded-full">Cancelar</button>
        <button type="button" onClick={saveDraft} className="px-4 py-1.5 bg-ink text-white rounded-full">Guardar</button>
      </div>
    </div>
  );

  const isNewDraft = draft && editingId === draft.id && !items.some((i) => i.id === draft.id);

  return (
    <div className="flex flex-col border-t border-white/45">
      {items.map((item, i) => {
        const open = openId === item.id;
        return (
          <div key={item.id} className="border-b border-white/45">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : item.id)}
                className="flex-1 flex items-center justify-between gap-4 py-3.5 text-left text-base hover:text-lilac"
              >
                <span>{item.title}</span>
                <span className="flex items-center gap-3 text-sm">
                  {String(i + 1).padStart(2, "0")}
                  <Chevron open={open} />
                </span>
              </button>
              {canEdit && (
                <>
                  <button type="button" aria-label={`Editar ${item.title}`} onClick={() => startEdit(item)} className="w-7 h-7 shrink-0 rounded-full bg-accent text-white flex items-center justify-center">
                    <PencilIcon />
                  </button>
                  <button type="button" aria-label={`Quitar ${item.title}`} onClick={() => remove(item.id)} className="w-7 h-7 shrink-0 rounded-full bg-white/20 text-white flex items-center justify-center text-sm">
                    ✕
                  </button>
                </>
              )}
            </div>
            {editingId === item.id && draft ? (
              editor(draft)
            ) : (
              <div className={`grid transition-[grid-template-rows] duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                  <Link href={item.url || "/blog"} className="block pb-4 text-sm leading-relaxed text-white/85 hover:text-white">
                    {item.description}
                    <span className="block mt-2 font-medium text-lilac">Ver sus entradas →</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {isNewDraft && draft && editor(draft)}
      {canEdit && !isNewDraft && (
        <button type="button" onClick={addNew} disabled={pending} className="mt-3 self-start text-sm border border-dashed border-white/60 rounded-full px-4 py-2 hover:bg-white/10">
          + Agregar comunidad
        </button>
      )}
    </div>
  );
}
