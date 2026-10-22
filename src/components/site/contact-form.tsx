"use client";

import { useActionState } from "react";
import { sendContactMessage, type FormState } from "@/app/actions/community";

const field = "h-11 rounded-full bg-white text-ink px-4 text-sm outline-none focus:ring-2 focus:ring-lilac";

/** Compact "Escríbenos" form for the black footer. */
export function ContactForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(sendContactMessage, {});

  if (state.ok) {
    return (
      <p role="status" className="rounded-2xl bg-white/10 px-5 py-4 text-sm">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      <label htmlFor="contacto-nombre" className="sr-only">Nombre</label>
      <input id="contacto-nombre" name="name" required autoComplete="name" placeholder="Nombre" className={field} />
      <label htmlFor="contacto-email" className="sr-only">Email</label>
      <input id="contacto-email" name="email" type="email" required autoComplete="email" placeholder="Correo" className={field} />
      <div className="sm:col-span-2 flex gap-2.5 items-start">
        <label htmlFor="contacto-mensaje" className="sr-only">Mensaje</label>
        {/* One line that grows as you write. */}
        <textarea
          id="contacto-mensaje"
          name="message"
          required
          rows={1}
          placeholder="Tu mensaje"
          className="flex-1 min-w-0 min-h-11 max-h-48 field-sizing-content resize-none rounded-[22px] bg-white text-ink px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-lilac"
        />
        <button
          type="submit"
          disabled={pending}
          className="h-11 shrink-0 rounded-full bg-lilac text-ink px-5 text-sm font-bold transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {pending ? "Enviando…" : "Enviar"}
        </button>
      </div>
      {/* Hidden from people; bots that fill it are ignored. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      {state.error && <p role="alert" className="sm:col-span-2 text-sm text-red-300">{state.error}</p>}
    </form>
  );
}
