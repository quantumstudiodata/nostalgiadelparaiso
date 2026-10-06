"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { addWriter, updateWriterProfile, type WriterFormState } from "@/app/admin/(dashboard)/escritores/actions";
import { ImageUploadField } from "./image-upload-field";
import { RoleSelect, ROLE_OPTIONS, inputClass, type Role } from "./role-select";

export type WriterRow = {
  id: string;
  name: string;
  role: Role;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  websiteUrl: string | null;
  postCount: number;
};

function Avatar({ name, url }: { name: string; url: string | null }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
  ) : (
    <span className="w-10 h-10 rounded-full bg-lilac shrink-0 flex items-center justify-center text-[14px] font-medium">{name.slice(0, 1).toUpperCase()}</span>
  );
}

function WriterProfileForm({ writer, onDone }: { writer: WriterRow; onDone: () => void }) {
  const [state, action, pending] = useActionState<WriterFormState, FormData>(updateWriterProfile.bind(null, writer.id), {});
  return (
    <form action={action} className="mt-3 bg-panel rounded-lg p-4 flex flex-col gap-4">
      <ImageUploadField name="coverUrl" label="Imagen de portada del perfil" defaultValue={writer.coverUrl ?? ""} aspectClassName="aspect-[4/1]" />
      <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4">
        <ImageUploadField name="avatarUrl" label="Foto de perfil" defaultValue={writer.avatarUrl ?? ""} aspectClassName="aspect-square" />
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-[15px] font-medium">
            Nombre
            <input name="name" defaultValue={writer.name} required className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-[15px] font-medium">
            Acerca de / Biografía
            <textarea name="bio" rows={4} defaultValue={writer.bio ?? ""} className="border border-mist rounded-md px-2.5 py-2 text-[15px] bg-white" />
          </label>
          <label className="flex flex-col gap-1 text-[15px] font-medium">
            Enlace del autor
            <input name="websiteUrl" defaultValue={writer.websiteUrl ?? ""} placeholder="instagram.com/… o su sitio web" className={inputClass} />
          </label>
          {state.error && <p className="text-[13px] text-red-700">{state.error}</p>}
          {state.ok && <p className="text-[13px] text-[#1f5c2a]" role="status">{state.message}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={pending} className="bg-ink text-white rounded-full px-4 py-2 text-[15px] disabled:opacity-60">
              {pending ? "Guardando..." : "Guardar perfil"}
            </button>
            <button type="button" onClick={onDone} className="border border-ink rounded-full px-4 py-2 text-[15px]">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function AddWriterForm({ currentUserIsAdmin }: { currentUserIsAdmin: boolean }) {
  const [state, action, pending] = useActionState<WriterFormState, FormData>(addWriter, {});
  return (
    <form action={action} className="bg-white rounded-[10px] p-5 flex flex-col gap-3">
      <p className="text-[14px] text-neutral-600">
        Pide a la persona que se registre en el sitio. Luego escribe aquí su correo y elige qué podrá hacer. Ella crea y cuida su propia contraseña.
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-[15px] font-medium">
          Correo con el que se registró
          <input name="email" type="email" required className={`${inputClass} w-72 max-w-full`} />
        </label>
        <label className="flex flex-col gap-1 text-[15px] font-medium">
          Rol
          <select name="role" defaultValue="AUTHOR" className={inputClass}>
            {ROLE_OPTIONS.filter((o) => o.value !== "READER" && (o.value !== "ADMIN" || currentUserIsAdmin)).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={pending} className="h-10 bg-ink text-white rounded-full px-4 text-[15px] font-medium disabled:opacity-60">
          {pending ? "Guardando..." : "Dar permisos"}
        </button>
      </div>
      {state.error && <p className="text-[13px] text-red-700" role="alert">{state.error}</p>}
      {state.ok && <p className="text-[13px] text-[#1f5c2a]" role="status">{state.message}</p>}
    </form>
  );
}

export function WritersManager({
  writers,
  currentUserId,
  currentUserIsAdmin,
}: {
  writers: WriterRow[];
  currentUserId: string;
  currentUserIsAdmin: boolean;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="mt-5 flex flex-col gap-5">
      <div>
        <button type="button" onClick={() => setShowAdd((v) => !v)} className="bg-ink text-white rounded-full px-5 py-2.5 text-[15px] font-medium">
          {showAdd ? "Cerrar" : "+ Agregar escritor"}
        </button>
        {showAdd && <div className="mt-3"><AddWriterForm currentUserIsAdmin={currentUserIsAdmin} /></div>}
      </div>

      <div className="bg-white rounded-[10px]">
        {writers.map((w) => (
          <div key={w.id} className="px-5 py-3.5 border-b border-neutral-100 last:border-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1 basis-[220px]">
                <Avatar name={w.name} url={w.avatarUrl} />
                <div className="min-w-0">
                  <div className="font-semibold truncate">
                    {w.name}
                    {w.id === currentUserId && <span className="font-normal text-neutral-500"> (tú)</span>}
                  </div>
                  <div className="text-[13px] text-neutral-600">
                    {w.postCount} {w.postCount === 1 ? "entrada" : "entradas"} ·{" "}
                    <Link href={`/autor/${w.id}`} target="_blank" className="underline">
                      Ver perfil público
                    </Link>
                  </div>
                </div>
              </div>
              <div className="w-[250px] max-w-full">
                <RoleSelect
                  userId={w.id}
                  name={w.name}
                  role={w.role}
                  disabled={w.id === currentUserId || (w.role === "ADMIN" && !currentUserIsAdmin)}
                  currentUserIsAdmin={currentUserIsAdmin}
                />
              </div>
              <button type="button" onClick={() => setEditing(editing === w.id ? null : w.id)} className="border border-ink rounded-full px-3 py-1.5 text-[13px]">
                {editing === w.id ? "Cerrar" : "Editar perfil"}
              </button>
            </div>
            {editing === w.id && <WriterProfileForm writer={w} onDone={() => setEditing(null)} />}
          </div>
        ))}
      </div>
    </div>
  );
}
