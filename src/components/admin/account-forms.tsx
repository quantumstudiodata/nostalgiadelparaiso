"use client";

import { useActionState, useState } from "react";
import { updateProfile, updateSecurity, confirmEmailChange, type AccountState } from "@/app/actions/account";
import { ImageUploadField } from "./image-upload-field";

const inputClass = "h-10 border border-mist rounded-md px-2.5 text-[15px] bg-white w-full";
const labelClass = "flex flex-col gap-1 text-[15px] font-medium";

function Feedback({ state }: { state: AccountState }) {
  if (state.error) return <p className="text-[14px] text-red-700" role="alert">{state.error}</p>;
  if (state.message) return <p className="text-[14px] text-[#1f5c2a]" role="status">{state.message}</p>;
  return null;
}

export type Socials = { instagram?: string; facebook?: string; tiktok?: string };

export function ProfileForm({
  name,
  bio,
  avatarUrl,
  websiteUrl,
  socials,
  joined,
}: {
  name: string;
  bio: string;
  avatarUrl: string;
  websiteUrl: string;
  socials: Socials;
  joined: string;
}) {
  const [state, action, pending] = useActionState<AccountState, FormData>(updateProfile, {});
  return (
    <form action={action} className="bg-white rounded-[10px] p-5 md:p-6 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6">
      <ImageUploadField name="avatarUrl" label="Foto de perfil" defaultValue={avatarUrl} aspectClassName="aspect-square" />
      <div className="flex flex-col gap-4">
        <label className={labelClass}>
          Nombre
          <input name="name" defaultValue={name} required maxLength={80} className={inputClass} />
        </label>
        <label className={labelClass}>
          Biografía breve o descripción personal
          <textarea name="bio" rows={4} defaultValue={bio} maxLength={1500} className="border border-mist rounded-md px-2.5 py-2 text-[15px] bg-white" />
        </label>
        <fieldset className="flex flex-col gap-2">
          <legend className="text-[15px] font-medium mb-1">Redes sociales</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-[13px] text-neutral-600">
              Instagram
              <input name="instagram" defaultValue={socials.instagram ?? ""} placeholder="instagram.com/tu-usuario" className={inputClass} />
            </label>
            <label className="flex flex-col gap-1 text-[13px] text-neutral-600">
              Facebook
              <input name="facebook" defaultValue={socials.facebook ?? ""} placeholder="facebook.com/tu-pagina" className={inputClass} />
            </label>
            <label className="flex flex-col gap-1 text-[13px] text-neutral-600">
              TikTok
              <input name="tiktok" defaultValue={socials.tiktok ?? ""} placeholder="tiktok.com/@tu-usuario" className={inputClass} />
            </label>
            <label className="flex flex-col gap-1 text-[13px] text-neutral-600">
              Sitio web o enlace personal
              <input name="websiteUrl" defaultValue={websiteUrl} placeholder="tusitio.com" className={inputClass} />
            </label>
          </div>
        </fieldset>
        <p className="text-[14px] text-neutral-600">
          Fecha de registro: <span className="text-ink">{joined}</span>
        </p>
        <Feedback state={state} />
        <button type="submit" disabled={pending} className="self-start bg-ink text-white rounded-full px-5 py-2.5 text-[15px] font-medium disabled:opacity-60">
          {pending ? "Guardando..." : "Guardar perfil"}
        </button>
      </div>
    </form>
  );
}

function ConfirmEmailForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState<AccountState, FormData>(confirmEmailChange, {});
  if (state.ok) return <Feedback state={state} />;
  return (
    <form action={action} className="mt-4 bg-lilac/40 rounded-lg p-4 flex flex-wrap items-end gap-3">
      <input type="hidden" name="email" value={email} />
      <label className={labelClass}>
        Código enviado a {email}
        <input name="code" inputMode="numeric" pattern="\d{6}" maxLength={6} required autoComplete="one-time-code" className={`${inputClass} w-40 tracking-[0.3em]`} />
      </label>
      <button type="submit" disabled={pending} className="h-10 bg-ink text-white rounded-full px-4 text-[15px] font-medium disabled:opacity-60">
        {pending ? "Confirmando..." : "Confirmar correo"}
      </button>
      <div className="w-full"><Feedback state={state} /></div>
    </form>
  );
}

export function SecurityForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState<AccountState, FormData>(updateSecurity, {});
  const [key, setKey] = useState(0);
  return (
    <div className="bg-white rounded-[10px] p-5 md:p-6">
      <form key={key} action={action} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[640px]">
        <label className={`${labelClass} sm:col-span-2`}>
          Correo electrónico
          <input name="email" type="email" defaultValue={email} required className={inputClass} />
          <span className="text-[13px] font-normal text-neutral-600">Si lo cambias, te enviaremos un código al correo nuevo para confirmarlo.</span>
        </label>
        <label className={labelClass}>
          Nueva contraseña
          <input name="newPassword" type="password" minLength={8} autoComplete="new-password" placeholder="Déjala vacía para no cambiarla" className={inputClass} />
        </label>
        <label className={labelClass}>
          Repite la nueva contraseña
          <input name="confirmPassword" type="password" minLength={8} autoComplete="new-password" className={inputClass} />
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          Tu contraseña actual
          <input name="currentPassword" type="password" required autoComplete="current-password" className={`${inputClass} sm:max-w-[308px]`} />
        </label>
        <div className="sm:col-span-2 flex flex-col gap-3">
          <Feedback state={state} />
          <div className="flex gap-2">
            <button type="submit" disabled={pending} className="bg-ink text-white rounded-full px-5 py-2.5 text-[15px] font-medium disabled:opacity-60">
              {pending ? "Guardando..." : "Guardar cambios"}
            </button>
            {state.ok && (
              <button type="button" onClick={() => setKey((k) => k + 1)} className="border border-ink rounded-full px-4 py-2 text-[15px]">
                Limpiar
              </button>
            )}
          </div>
        </div>
      </form>
      {state.pendingEmail && <ConfirmEmailForm key={state.pendingEmail} email={state.pendingEmail} />}
    </div>
  );
}
