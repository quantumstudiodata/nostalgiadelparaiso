"use client";

import { useActionState } from "react";
import { updateAccount, type AccountState } from "@/app/actions/account";

const input = "h-11 border border-neutral-300 rounded-md px-3 text-sm";

export function AccountForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState<AccountState, FormData>(updateAccount, {});

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="acc-name" className="text-[13px] font-medium">Nombre</label>
        <input id="acc-name" name="name" defaultValue={name} required autoComplete="name" className={input} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="acc-email" className="text-[13px] font-medium">Correo para iniciar sesión</label>
        <input id="acc-email" name="email" type="email" defaultValue={email} required autoComplete="email" className={input} />
      </div>

      <fieldset className="border-t border-mist pt-4 flex flex-col gap-4">
        <legend className="text-[13px] font-bold pr-2">Cambiar contraseña (opcional)</legend>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="acc-new" className="text-[13px] font-medium">Nueva contraseña (mínimo 8 caracteres)</label>
          <input id="acc-new" name="newPassword" type="password" minLength={8} autoComplete="new-password" className={input} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="acc-confirm" className="text-[13px] font-medium">Repite la nueva contraseña</label>
          <input id="acc-confirm" name="confirmPassword" type="password" minLength={8} autoComplete="new-password" className={input} />
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5 border-t border-mist pt-4">
        <label htmlFor="acc-current" className="text-[13px] font-medium">Tu contraseña actual (para confirmar los cambios)</label>
        <input id="acc-current" name="currentPassword" type="password" required autoComplete="current-password" className={input} />
      </div>

      {state.error && <p className="text-sm text-red-700" role="alert">{state.error}</p>}
      {state.ok && <p className="text-sm text-[#1f5c2a]" role="status">{state.message}</p>}

      <button type="submit" disabled={pending} className="h-11 bg-ink text-white rounded-full text-sm font-medium mt-1 disabled:opacity-60">
        {pending ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
