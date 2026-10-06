"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { createCategory, updateCategory, reorderCategories } from "@/app/actions/categories";
import { PencilIcon } from "@/components/site/icons";
import { queueEdit } from "@/components/site/edit-session";

export type EcosystemEntry = { id: string; name: string; description: string; slug: string };

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function GripIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {[5, 12, 19].flatMap((y) => [9, 15].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.8" />))}
    </svg>
  );
}

/**
 * "En este ecosistema conviven": one row per category in the ecosystem. Each row expands
 * to its description, which links to its posts. In edit mode rows can be renamed, added,
 * hidden and dragged by the handle to change the order.
 */
export function EcosystemAccordion({ items: initialItems, canEdit }: { items: EcosystemEntry[]; canEdit: boolean }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [openId, setOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EcosystemEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const orderAtStart = useRef<string>("");

  function run(task: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await task();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo guardar.");
      }
    });
  }

  function startEdit(item: EcosystemEntry) {
    setDraft(item);
    setEditingId(item.id);
    setOpenId(item.id);
  }

  function saveDraft() {
    if (!draft || !draft.name.trim()) return;
    const d = draft;
    const exists = items.some((i) => i.id === d.id);
    setEditingId(null);
    setDraft(null);
    if (exists) {
      setItems((list) => list.map((i) => (i.id === d.id ? d : i)));
      queueEdit(`eco:${d.id}:text`, () => updateCategory(d.id, { name: d.name, description: d.description }));
    } else {
      run(async () => {
        const c = await createCategory({ name: d.name, description: d.description, inEcosystem: true });
        setItems((list) => [...list, { ...d, id: c.id, slug: c.slug, name: c.name }]);
      });
    }
  }

  function hide(item: EcosystemEntry) {
    setItems((list) => list.filter((i) => i.id !== item.id));
    queueEdit(`eco:${item.id}:hide`, () => updateCategory(item.id, { inEcosystem: false }));
  }

  function addNew() {
    const item = { id: `new-${Date.now()}`, name: "", description: "", slug: "" };
    setDraft(item);
    setEditingId(item.id);
    setOpenId(item.id);
  }

  // Drag to reorder: the row follows the pointer and the others make room.
  function onPointerDown(e: React.PointerEvent, id: string) {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    orderAtStart.current = items.map((i) => i.id).join();
    setDragId(id);
    setOpenId(null);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragId) return;
    const y = e.clientY;
    const others = items.filter((i) => i.id !== dragId);
    let index = 0;
    for (const item of others) {
      const rect = rowRefs.current.get(item.id)?.getBoundingClientRect();
      if (rect && y > rect.top + rect.height / 2) index++;
    }
    const dragged = items.find((i) => i.id === dragId)!;
    const next = [...others.slice(0, index), dragged, ...others.slice(index)];
    if (next.map((i) => i.id).join() !== items.map((i) => i.id).join()) setItems(next);
  }

  function onPointerUp() {
    if (!dragId) return;
    setDragId(null);
    const ids = items.map((i) => i.id);
    if (ids.join() !== orderAtStart.current) queueEdit("eco:order", () => reorderCategories(ids));
  }

  const editor = (d: EcosystemEntry) => (
    <div className="bg-white text-ink rounded-md p-4 my-3 flex flex-col gap-2.5 text-sm">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-bold">Nombre (cambia en todo el sitio)</span>
        <input value={d.name} onChange={(e) => setDraft({ ...d, name: e.target.value })} className="h-9 border border-neutral-300 rounded px-2" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-bold">Descripción (se despliega al hacer clic)</span>
        <textarea rows={4} value={d.description} onChange={(e) => setDraft({ ...d, description: e.target.value })} className="border border-neutral-300 rounded px-2 py-1.5" />
      </label>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={() => { setEditingId(null); setDraft(null); }} className="px-3 py-1.5 border border-neutral-300 rounded-full">Cancelar</button>
        <button type="button" onClick={saveDraft} className="px-4 py-1.5 bg-ink text-white rounded-full">Guardar</button>
      </div>
    </div>
  );

  const isNewDraft = draft && editingId === draft.id && !items.some((i) => i.id === draft.id);

  return (
    <div className="flex flex-col border-t border-white/45" onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
      {items.map((item, i) => {
        const open = openId === item.id;
        const dragging = dragId === item.id;
        return (
          <div
            key={item.id}
            ref={(el) => {
              if (el) rowRefs.current.set(item.id, el);
              else rowRefs.current.delete(item.id);
            }}
            className={`border-b border-white/45 transition-[transform,background-color,box-shadow] duration-150 ${dragging ? "relative z-10 scale-[1.03] bg-white/15 shadow-lg rounded-md" : ""}`}
          >
            <div className="flex items-center gap-2">
              {canEdit && (
                <button
                  type="button"
                  aria-label={`Arrastrar ${item.name} para cambiar el orden`}
                  onPointerDown={(e) => onPointerDown(e, item.id)}
                  className="w-7 h-7 shrink-0 flex items-center justify-center text-white/70 cursor-grab active:cursor-grabbing touch-none"
                >
                  <GripIcon />
                </button>
              )}
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : item.id)}
                className="flex-1 flex items-center justify-between gap-4 py-4 lg:py-[18px] text-left text-base lg:text-[17px] hover:text-lilac"
              >
                <span>{item.name}</span>
                <span className="flex items-center gap-3 text-sm">
                  {String(i + 1).padStart(2, "0")}
                  <Chevron open={open} />
                </span>
              </button>
              {canEdit && (
                <>
                  <button type="button" aria-label={`Editar ${item.name}`} onClick={() => startEdit(item)} className="w-7 h-7 shrink-0 rounded-full bg-accent text-white flex items-center justify-center">
                    <PencilIcon />
                  </button>
                  <button type="button" aria-label={`Quitar ${item.name}`} onClick={() => hide(item)} className="w-7 h-7 shrink-0 rounded-full bg-white/20 text-white flex items-center justify-center text-sm">
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
                  <Link href={`/blog?categoria=${item.slug}`} className="block pb-[18px] text-[15px] lg:text-base leading-relaxed text-white/85 hover:text-white">
                    {item.description}
                    <span className="block mt-2 text-[15px] font-medium text-lilac">Ver sus entradas →</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {isNewDraft && draft && editor(draft)}
      {error && <p className="mt-2 text-sm text-[#ffd2c2]" role="alert">{error}</p>}
      {canEdit && !isNewDraft && (
        <button type="button" onClick={addNew} disabled={pending} className="mt-3 self-start text-sm border border-dashed border-white/60 rounded-full px-4 py-2 hover:bg-white/10">
          + Agregar comunidad
        </button>
      )}
    </div>
  );
}
