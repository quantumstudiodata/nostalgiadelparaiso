"use client";

import { useActionState } from "react";
import { register, type FormState } from "@/app/actions/community";

export function RegisterForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(register, {});

  if (state.ok && state.message) return <p className="text-sm" role="status">{state.message}</p>;

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-name" className="text-[13px] font-medium">Nombre</label>
        <input id="reg-name" name="name" required autoComplete="name" className="h-11 border border-neutral-300 rounded-md px-3 text-sm" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-email" className="text-[13px] font-medium">Correo electrónico</label>
        <input id="reg-email" name="email" type="email" required autoComplete="email" className="h-11 border border-neutral-300 rounded-md px-3 text-sm" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-password" className="text-[13px] font-medium">Contraseña (mínimo 8 caracteres)</label>
        <input id="reg-password" name="password" type="password" required minLength={8} autoComplete="new-password" className="h-11 border border-neutral-300 rounded-md px-3 text-sm" />
      </div>
      {state.error && <p className="text-sm text-red-700" role="alert">{state.error}</p>}
      <button type="submit" disabled={pending} className="h-11 bg-ink text-white rounded-full text-sm font-medium mt-1 disabled:opacity-60">
        {pending ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  );
}
