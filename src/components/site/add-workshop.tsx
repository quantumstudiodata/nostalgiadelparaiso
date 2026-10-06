"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createCategory } from "@/app/actions/categories";

/** Edit mode: adds a workshop card (a new category in the ecosystem). */
export function AddWorkshopButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-[112px] lg:min-h-[140px] rounded-lg border-2 border-dashed border-white/40 text-white/80 hover:bg-white/[0.06] text-[15px]"
      >
        + Agregar tarjeta
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          try {
            await createCategory({ name, inEcosystem: true });
            setName("");
            setOpen(false);
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo agregar.");
          }
        });
      }}
      className="rounded-lg bg-white text-ink p-4 flex flex-col gap-2 text-sm"
    >
      <label className="flex flex-col gap-1">
        <span className="text-xs font-bold">Nombre del taller o comunidad</span>
        <input autoFocus required value={name} onChange={(e) => setName(e.target.value)} className="h-9 border border-neutral-300 rounded px-2" />
      </label>
      <span className="text-xs text-neutral-600">Se crea también como categoría para sus entradas. Luego puedes ponerle imagen.</span>
      {error && <span className="text-xs text-red-700">{error}</span>}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={() => setOpen(false)} className="px-3 py-1.5 border border-neutral-300 rounded-full">Cancelar</button>
        <button type="submit" disabled={pending} className="px-4 py-1.5 bg-ink text-white rounded-full disabled:opacity-60">
          {pending ? "Agregando..." : "Agregar"}
        </button>
      </div>
    </form>
  );
}
