"use client";

import { useActionState } from "react";
import { subscribe, type FormState } from "@/app/actions/community";

export function SubscribeForm({ id, className = "" }: { id?: string; className?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(subscribe, {});
  const inputId = `${id ?? "subscribe"}-email`;

  return (
    <form id={id} action={action} className={`bg-lilac rounded-lg p-5 flex flex-col gap-2 ${className}`}>
      <h2 className="font-serif font-semibold text-lg">Recibe todas las entradas</h2>
      {state.ok ? (
        <p className="text-sm" role="status">{state.message}</p>
      ) : (
        <>
          <label htmlFor={inputId} className="text-[13px] font-medium">Email</label>
          <input id={inputId} name="email" type="email" required className="h-10 rounded-md bg-white px-3 text-sm" />
          {state.error && <p className="text-[13px] text-red-800" role="alert">{state.error}</p>}
          <button type="submit" disabled={pending} className="h-10 rounded-full bg-ink text-white text-sm font-medium disabled:opacity-60">
            {pending ? "Enviando..." : "Suscribirse"}
          </button>
        </>
      )}
    </form>
  );
}
