"use client";

import { useActionState, useState, useTransition } from "react";
import { createUser, updateUserProfile, updateUserRole, type UserFormState } from "@/app/admin/(dashboard)/usuarios/actions";
import { ImageUploadField } from "./image-upload-field";

type Role = "ADMIN" | "EDITOR" | "AUTHOR" | "READER";
type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  bio: string | null;
  avatarUrl: string | null;
  postCount: number;
  createdAt: string;
};

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "READER", label: "Lectora (recibe correos, comenta)" },
  { value: "AUTHOR", label: "Autora (sube entradas)" },
  { value: "EDITOR", label: "Editora (edita todo el sitio)" },
  { value: "ADMIN", label: "Administradora" },
];

const inputClass = "h-10 border border-mist rounded-md px-2.5 text-[15px] bg-white";

function RoleSelect({ user, disabled, currentUserIsAdmin }: { user: UserRow; disabled: boolean; currentUserIsAdmin: boolean }) {
  const [role, setRole] = useState(user.role);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <select
        aria-label={`Rol de ${user.name}`}
        value={role}
        disabled={disabled || pending}
        onChange={(e) => {
          const next = e.target.value as Role;
          const prev = role;
          setRole(next);
          setError(null);
          startTransition(async () => {
            try {
              await updateUserRole(user.id, next);
            } catch (err) {
              setRole(prev);
              setError(err instanceof Error ? err.message : "No se pudo cambiar el rol.");
            }
          });
        }}
        className={`${inputClass} disabled:bg-panel`}
      >
        {ROLE_OPTIONS.filter((o) => o.value !== "ADMIN" || currentUserIsAdmin || user.role === "ADMIN").map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className="text-[13px] text-red-700">{error}</span>}
    </div>
  );
}

function ProfileForm({ user, onDone }: { user: UserRow; onDone: () => void }) {
  const [state, action, pending] = useActionState<UserFormState, FormData>(updateUserProfile.bind(null, user.id), {});
  return (
    <form action={action} className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 bg-panel rounded-lg p-4 mt-2">
      <ImageUploadField name="avatarUrl" label="Foto" defaultValue={user.avatarUrl ?? ""} aspectClassName="aspect-square" />
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-[15px] font-medium">
          Nombre (así aparece como publicadora)
          <input name="name" defaultValue={user.name} required className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-[15px] font-medium">
          Biografía (se muestra junto a sus entradas)
          <textarea name="bio" rows={4} defaultValue={user.bio ?? ""} className="border border-mist rounded-md px-2.5 py-2 text-[15px] bg-white" />
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
    </form>
  );
}

function NewUserForm({ currentUserIsAdmin }: { currentUserIsAdmin: boolean }) {
  const [state, action, pending] = useActionState<UserFormState, FormData>(createUser, {});
  const [key, setKey] = useState(0);

  return (
    <form
      key={key}
      action={action}
      className="bg-white rounded-[10px] p-5 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-5"
    >
      <ImageUploadField name="avatarUrl" label="Foto (opcional)" aspectClassName="aspect-square" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
        <label className="flex flex-col gap-1 text-[15px] font-medium">
          Nombre
          <input name="name" required className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-[15px] font-medium">
          Correo
          <input name="email" type="email" required className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-[15px] font-medium">
          Contraseña inicial (mín. 8)
          <input name="password" type="text" minLength={8} required autoComplete="off" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-[15px] font-medium">
          Rol
          <select name="role" defaultValue="AUTHOR" className={inputClass}>
            {ROLE_OPTIONS.filter((o) => o.value !== "ADMIN" || currentUserIsAdmin).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="sm:col-span-2 flex flex-col gap-1 text-[15px] font-medium">
          Biografía (opcional)
          <textarea name="bio" rows={3} className="border border-mist rounded-md px-2.5 py-2 text-[15px] bg-white" />
        </label>
        {state.error && <p className="sm:col-span-2 text-[13px] text-red-700" role="alert">{state.error}</p>}
        {state.ok && (
          <p className="sm:col-span-2 text-[13px] text-[#1f5c2a]" role="status">
            {state.message}{" "}
            <button type="button" className="underline" onClick={() => setKey((k) => k + 1)}>
              Registrar a otra persona
            </button>
          </p>
        )}
        <button type="submit" disabled={pending} className="sm:col-span-2 justify-self-start bg-ink text-white rounded-full px-5 py-2.5 text-[15px] font-medium disabled:opacity-60">
          {pending ? "Registrando..." : "Registrar usuaria"}
        </button>
      </div>
    </form>
  );
}

export function UsersManager({
  users,
  currentUserId,
  currentUserIsAdmin,
}: {
  users: UserRow[];
  currentUserId: string;
  currentUserIsAdmin: boolean;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="mt-5 flex flex-col gap-5">
      <div>
        <button type="button" onClick={() => setShowNew((v) => !v)} className="bg-ink text-white rounded-full px-5 py-2.5 text-[15px] font-medium">
          {showNew ? "Cerrar" : "+ Registrar usuaria"}
        </button>
        {showNew && <div className="mt-3"><NewUserForm currentUserIsAdmin={currentUserIsAdmin} /></div>}
      </div>

      <div className="bg-white rounded-[10px] overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[1fr_200px_250px_90px] gap-4 px-5 py-2.5 text-xs font-bold tracking-[0.08em] uppercase text-neutral-600 border-b border-neutral-100">
            <span>Persona</span>
            <span>Correo</span>
            <span>Rol</span>
            <span />
          </div>
          {users.map((u) => (
            <div key={u.id} className="px-5 py-3 border-b border-neutral-100 last:border-0">
              <div className="grid grid-cols-[1fr_200px_250px_90px] gap-4 items-center">
                <div className="flex items-center gap-2.5 min-w-0">
                  {u.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                  ) : (
                    <span className="w-9 h-9 rounded-full bg-lilac shrink-0 flex items-center justify-center text-[13px] font-medium">{u.name.slice(0, 1).toUpperCase()}</span>
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      {u.name}
                      {u.id === currentUserId && <span className="font-normal text-neutral-500"> (tú)</span>}
                    </div>
                    <div className="text-[13px] text-neutral-600">{u.postCount} entradas</div>
                  </div>
                </div>
                <span className="text-[15px] truncate">{u.email}</span>
                <RoleSelect
                  user={u}
                  disabled={u.id === currentUserId || (u.role === "ADMIN" && !currentUserIsAdmin)}
                  currentUserIsAdmin={currentUserIsAdmin}
                />
                <button type="button" onClick={() => setEditing(editing === u.id ? null : u.id)} className="border border-ink rounded-full px-3 py-1.5 text-[13px]">
                  {editing === u.id ? "Cerrar" : "Perfil"}
                </button>
              </div>
              {editing === u.id && <ProfileForm user={u} onDone={() => setEditing(null)} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
