"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createCategory, updateCategory, deleteCategory, reorderCategories } from "@/app/actions/categories";
import { ImageUploadField } from "./image-upload-field";
import { InlineConfirm } from "./inline-confirm";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  inEcosystem: boolean;
  posts: number;
};

const inputClass = "h-10 border border-mist rounded-md px-2.5 text-[15px] bg-white w-full";

function CategoryForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: Omit<CategoryRow, "id" | "slug" | "posts">;
  submitLabel: string;
  onSubmit: (data: Omit<CategoryRow, "id" | "slug" | "posts">) => Promise<void>;
  onCancel: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [inEcosystem, setInEcosystem] = useState(initial.inEcosystem);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setError(null);
        startTransition(async () => {
          try {
            await onSubmit({
              name: String(fd.get("name") ?? ""),
              description: String(fd.get("description") ?? ""),
              imageUrl: String(fd.get("imageUrl") ?? ""),
              inEcosystem,
            });
          } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo guardar.");
          }
        });
      }}
      className="bg-panel rounded-lg p-4 grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4"
    >
      <ImageUploadField name="imageUrl" label="Imagen" defaultValue={initial.imageUrl} aspectClassName="aspect-square" />
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-[15px] font-medium">
          Nombre
          <input name="name" defaultValue={initial.name} required maxLength={80} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-[15px] font-medium">
          Descripción (se despliega en “En este ecosistema conviven”)
          <textarea name="description" rows={3} defaultValue={initial.description} className="border border-mist rounded-md px-2.5 py-2 text-[15px] bg-white" />
        </label>
        <label className="flex items-center gap-2 text-[15px]">
          <input type="checkbox" checked={inEcosystem} onChange={(e) => setInEcosystem(e.target.checked)} className="w-4 h-4 accent-ink" />
          Mostrar en el ecosistema y en “Talleres y voces de la comunidad”
        </label>
        {error && <p className="text-[13px] text-red-700" role="alert">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={pending} className="bg-ink text-white rounded-full px-4 py-2 text-[15px] disabled:opacity-60">
            {pending ? "Guardando..." : submitLabel}
          </button>
          <button type="button" onClick={onCancel} className="border border-ink rounded-full px-4 py-2 text-[15px]">
            Cancelar
          </button>
        </div>
      </div>
    </form>
  );
}

export function CategoriesManager({ categories: initial }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    startTransition(() => reorderCategories(next.map((c) => c.id)));
  }

  function remove(c: CategoryRow) {
    setError(null);
    startTransition(async () => {
      try {
        await deleteCategory(c.id);
        setItems((list) => list.filter((i) => i.id !== c.id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo borrar.");
      }
    });
  }

  return (
    <div className="mt-5 flex flex-col gap-5">
      <div>
        {adding ? (
          <CategoryForm
            initial={{ name: "", description: "", imageUrl: "", inEcosystem: true }}
            submitLabel="Agregar"
            onCancel={() => setAdding(false)}
            onSubmit={async (data) => {
              const c = await createCategory(data);
              setItems((list) => [...list, { ...data, ...c, posts: 0 }]);
              setAdding(false);
              router.refresh();
            }}
          />
        ) : (
          <button type="button" onClick={() => setAdding(true)} className="bg-ink text-white rounded-full px-5 py-2.5 text-[15px] font-medium">
            + Nueva categoría
          </button>
        )}
      </div>
      {error && <p className="text-[14px] text-red-700" role="alert">{error}</p>}

      <div className="bg-white rounded-[10px]">
        {items.map((c, i) => (
          <div key={c.id} className="px-4 md:px-5 py-3 border-b border-neutral-100 last:border-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col">
                <button type="button" aria-label="Subir" disabled={i === 0} onClick={() => move(i, -1)} className="w-7 h-5 text-[12px] disabled:opacity-25">▲</button>
                <button type="button" aria-label="Bajar" disabled={i === items.length - 1} onClick={() => move(i, 1)} className="w-7 h-5 text-[12px] disabled:opacity-25">▼</button>
              </div>
              {c.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.imageUrl} alt="" className="w-11 h-11 rounded-md object-cover" />
              ) : (
                <span className="w-11 h-11 rounded-md bg-lilac" />
              )}
              <div className="min-w-0 flex-1 basis-[180px]">
                <div className="font-semibold truncate">{c.name}</div>
                <div className="text-[13px] text-neutral-600">
                  {c.posts} {c.posts === 1 ? "entrada" : "entradas"}
                  {c.inEcosystem ? " · En el ecosistema" : ""}
                </div>
              </div>
              <button type="button" onClick={() => setEditing(editing === c.id ? null : c.id)} className="border border-ink rounded-full px-3 py-1.5 text-[13px]">
                {editing === c.id ? "Cerrar" : "Editar"}
              </button>
              <InlineConfirm
                label="Borrar"
                question={`¿Borrar “${c.name}”?`}
                onConfirm={() => remove(c)}
                disabled={c.posts > 0}
                title={c.posts > 0 ? "Tiene entradas: muévelas antes de borrarla" : undefined}
              />
            </div>
            {editing === c.id && (
              <div className="mt-3">
                <CategoryForm
                  initial={c}
                  submitLabel="Guardar"
                  onCancel={() => setEditing(null)}
                  onSubmit={async (data) => {
                    await updateCategory(c.id, data);
                    setItems((list) => list.map((x) => (x.id === c.id ? { ...x, ...data, name: data.name.trim() } : x)));
                    setEditing(null);
                    router.refresh();
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
