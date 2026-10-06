"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { FormState } from "@/app/actions/community";
import { PIXEL_EMOJIS, PixelEmoji } from "@/components/site/pixel-emoji";

const inputClass = "h-10 border border-mist px-3 text-[13.5px] bg-white w-full";

/** Comment form for everyone: guests leave first name, last name and a private email. */
export function CommentForm({
  action,
  signedInAs,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  /** Name of the signed-in person; guests see the name and email fields. */
  signedInAs?: string | null;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const formRef = useRef<HTMLFormElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    if (!state.ok) return;
    formRef.current?.reset();
    // Reset after a successful post; the form itself is uncontrolled.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRating(0);
  }, [state]);

  function insertEmoji(name: string) {
    const el = bodyRef.current;
    if (!el) return;
    const token = `:${name}:`;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? start;
    el.value = el.value.slice(0, start) + token + el.value.slice(end);
    el.focus();
    el.setSelectionRange(start + token.length, start + token.length);
  }

  const shown = hover || rating;

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3 border border-mist p-4">
      <div className="text-[13px] font-medium">{signedInAs ? `Comentar como ${signedInAs}` : "Deja un comentario"}</div>

      {!signedInAs && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <label className="flex flex-col gap-1 text-[12px] text-neutral-700">
            Nombre
            <input name="firstName" required maxLength={40} autoComplete="given-name" className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-[12px] text-neutral-700">
            Apellido
            <input name="lastName" maxLength={40} autoComplete="family-name" className={inputClass} />
          </label>
          <label className="sm:col-span-2 flex flex-col gap-1 text-[12px] text-neutral-700">
            Correo electrónico (no se mostrará)
            <input name="email" type="email" required autoComplete="email" className={inputClass} />
          </label>
        </div>
      )}
      {/* Honeypot: hidden from people, bots fill it. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <div className="flex items-center gap-2 text-[12px] text-neutral-700">
        <span>Tu valoración</span>
        <div className="flex" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Valoración">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
              onMouseEnter={() => setHover(n)}
              onClick={() => setRating(rating === n ? 0 : n)}
              className={`text-[22px] leading-none px-0.5 ${n <= shown ? "text-[#e8a23a]" : "text-neutral-300"}`}
            >
              ★
            </button>
          ))}
        </div>
        <input type="hidden" name="rating" value={rating || ""} />
      </div>

      <div>
        <label htmlFor="comment-body" className="sr-only">Comentario</label>
        <textarea id="comment-body" ref={bodyRef} name="body" rows={4} maxLength={3000} placeholder="Escribe tu comentario…" className="w-full border border-mist px-3 py-2.5 text-[13.5px]" />
        <div className="mt-1 flex flex-wrap items-center gap-1" aria-label="Emojis">
          {Object.entries(PIXEL_EMOJIS).map(([name, e]) => (
            <button key={name} type="button" title={e.label} aria-label={`Agregar ${e.label}`} onClick={() => insertEmoji(name)} className="w-8 h-8 flex items-center justify-center hover:bg-panel">
              <PixelEmoji name={name} size={20} />
            </button>
          ))}
        </div>
      </div>

      {state.error && <p className="text-sm text-red-700" role="alert">{state.error}</p>}
      {state.ok && <p className="text-sm text-[#1f5c2a]" role="status">¡Gracias! Tu comentario ya está publicado.</p>}
      <button type="submit" disabled={pending} className="self-start bg-ink text-white px-5 py-2 text-[13px] disabled:opacity-60">
        {pending ? "Publicando..." : "Publicar comentario"}
      </button>
    </form>
  );
}
