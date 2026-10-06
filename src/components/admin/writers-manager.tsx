"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { createWriter, updateWriter, deleteWriter, type WriterFormState } from "@/app/admin/(dashboard)/escritores/actions";
import { ImageUploadField } from "./image-upload-field";

export type WriterRow = {
  id: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  postCount: number;
};

const inputClass = "h-10 border border-mist rounded-md px-2.5 text-[15px] bg-white";

function Avatar({ name, url }: { name: string; url: string | null }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
  ) : (
    <span className="w-10 h-10 rounded-full bg-lilac shrink-0 flex items-center justify-center text-[14px] font-medium">{name.slice(0, 1).toUpperCase()}</span>
  );
}

/** Name, photo, cover and "Acerca de": what the writer's public profile shows. */
function WriterForm({
  writer,
  action,
  submitLabel,
  onDone,
}: {
  writer?: WriterRow;
  action: (prev: WriterFormState, formData: FormData) => Promise<WriterFormState>;
  submitLabel: string;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState<WriterFormState, FormData>(action, {});
  return (
    <form action={formAction} className="bg-panel rounded-lg p-4 flex flex-col gap-4">
      <p className="text-[13px] text-neutral-600">Esta información se muestra en el perfil público del escritor.</p>
      <ImageUploadField name="coverUrl" label="Imagen de portada" defaultValue={writer?.coverUrl ?? ""} aspectClassName="aspect-[4/1]" />
      <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4">
        <ImageUploadField name="avatarUrl" label="Foto de perfil" defaultValue={writer?.avatarUrl ?? ""} aspectClassName="aspect-square" />
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-[15px] font-medium">
            Nombre
            <input name="name" defaultValue={writer?.name} required maxLength={80} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-[15px] font-medium">
            Acerca de
            <textarea name="bio" rows={5} defaultValue={writer?.bio ?? ""} className="border border-mist rounded-md px-2.5 py-2 text-[15px] bg-white" />
          </label>
          {state.error && <p className="text-[13px] text-red-700" role="alert">{state.error}</p>}
          {state.ok && <p className="text-[13px] text-[#1f5c2a]" role="status">{state.message}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={pending} className="bg-ink text-white rounded-full px-4 py-2 text-[15px] disabled:opacity-60">
              {pending ? "Guardando..." : submitLabel}
            </button>
            <button type="button" onClick={onDone} className="border border-ink rounded-full px-4 py-2 text-[15px]">
              {state.ok ? "Cerrar" : "Cancelar"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export function WritersManager({ writers }: { writers: WriterRow[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function remove(w: WriterRow) {
    if (!confirm(`¿Borrar el perfil de ${w.name}?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteWriter(w.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo borrar.");
      }
    });
  }

  return (
    <div className="mt-5 flex flex-col gap-5">
      <div>
        {adding ? (
          <WriterForm key={adding} action={createWriter} submitLabel="Agregar escritor" onDone={() => setAdding(0)} />
        ) : (
          <button type="button" onClick={() => setAdding(Date.now())} className="bg-ink text-white rounded-full px-5 py-2.5 text-[15px] font-medium">
            + Agregar escritor
          </button>
        )}
      </div>
      {error && <p className="text-[14px] text-red-700" role="alert">{error}</p>}

      <div className="bg-white rounded-[10px]">
        {writers.length === 0 && <p className="px-5 py-8 text-center text-neutral-600">Aún no hay escritores.</p>}
        {writers.map((w) => (
          <div key={w.id} className="px-5 py-3.5 border-b border-neutral-100 last:border-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1 basis-[220px]">
                <Avatar name={w.name} url={w.avatarUrl} />
                <div className="min-w-0">
                  <div className="font-semibold truncate">{w.name}</div>
                  <div className="text-[13px] text-neutral-600">
                    {w.postCount} {w.postCount === 1 ? "entrada" : "entradas"} ·{" "}
                    <Link href={`/autor/${w.id}`} target="_blank" className="underline">
                      Ver perfil público
                    </Link>
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => setEditing(editing === w.id ? null : w.id)} className="border border-ink rounded-full px-3 py-1.5 text-[13px]">
                {editing === w.id ? "Cerrar" : "Editar perfil"}
              </button>
              <button
                type="button"
                onClick={() => remove(w)}
                disabled={w.postCount > 0}
                title={w.postCount > 0 ? "Tiene entradas: cámbialas a otro escritor antes de borrarlo" : undefined}
                className="text-[13px] text-accent-dark hover:underline disabled:opacity-40 disabled:no-underline"
              >
                Borrar
              </button>
            </div>
            {editing === w.id && (
              <div className="mt-3">
                <WriterForm writer={w} action={updateWriter.bind(null, w.id)} submitLabel="Guardar perfil" onDone={() => setEditing(null)} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
