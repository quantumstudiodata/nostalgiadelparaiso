"use client";

import { useActionState } from "react";
import { sendContactMessage, type FormState } from "@/app/actions/community";

const field = "h-[52px] lg:h-[54px] rounded-lg bg-white px-4 text-[17px]";

export function ContactForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(sendContactMessage, {});

  if (state.ok) {
    return (
      <p role="status" className="md:col-start-7 md:col-span-6 bg-white rounded-lg p-6 text-[17px]">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="md:col-start-7 md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-[18px] lg:gap-[22px]">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="contacto-nombre" className="text-base font-medium">Nombre</label>
        <input id="contacto-nombre" name="name" required autoComplete="name" className={field} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="contacto-email" className="text-base font-medium">Email</label>
        <input id="contacto-email" name="email" type="email" required autoComplete="email" className={field} />
      </div>
      <div className="sm:col-span-2 flex flex-col gap-1.5">
        <label htmlFor="contacto-mensaje" className="text-base font-medium">Mensaje</label>
        <textarea id="contacto-mensaje" name="message" required rows={5} className="rounded-lg bg-white px-4 py-3.5 text-[17px]" />
      </div>
      {/* Hidden from people; bots that fill it are ignored. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      {state.error && <p role="alert" className="sm:col-span-2 text-red-800">{state.error}</p>}
      <button type="submit" disabled={pending} className="sm:col-span-2 sm:justify-self-start bg-ink text-white rounded-full px-[34px] py-4 text-[17px] font-medium disabled:opacity-60">
        {pending ? "Enviando..." : "Enviar mensaje"}
      </button>
    </form>
  );
}
