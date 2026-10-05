"use client";

import { useActionState } from "react";
import { subscribe, type FormState } from "@/app/actions/community";

/** The original Wix "Recibe todas las entradas" box: black frame, white card, black form. */
export function WixSubscribe({ id = "suscribirse" }: { id?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(subscribe, {});

  return (
    <div className="bg-white text-ink p-3">
      <h2 className="font-playfair font-bold text-[19px] leading-tight text-center px-6 pt-2 pb-3">
        Recibe todas las entradas.
      </h2>
      <form id={id} action={action} className="bg-ink px-3.5 pt-3 pb-7 flex flex-col">
        {state.ok ? (
          <p className="text-white text-sm py-4" role="status">{state.message}</p>
        ) : (
          <>
            <label htmlFor={`${id}-email`} className="font-playfair italic text-[15px] text-white">
              Email <span className="text-neutral-500">*</span>
            </label>
            <input id={`${id}-email`} name="email" type="email" required className="mt-1.5 h-8 bg-white border-2 border-[#5c5d75] px-2 text-sm" />
            {state.error && <p className="mt-2 text-xs text-red-300" role="alert">{state.error}</p>}
            <button
              type="submit"
              disabled={pending}
              className="mt-6 mx-auto w-[140px] h-[46px] bg-slate text-white font-playfair text-[15px] disabled:opacity-60"
            >
              {pending ? "Enviando..." : "Suscribirse"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
