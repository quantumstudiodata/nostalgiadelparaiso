"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { FormState } from "@/app/actions/community";
import { PIXEL_EMOJIS, PixelEmoji, pixelEmojiDataUrl } from "@/components/site/pixel-emoji";

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
  const boxRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    if (!state.ok) return;
    formRef.current?.reset();
    if (boxRef.current) boxRef.current.innerHTML = "";
    // Reset after a successful post; the form itself is uncontrolled.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRating(0);
  }, [state]);

  // The comment box shows emojis as pictures; the text sent keeps them as :name: tokens.
  function syncBody() {
    const box = boxRef.current;
    if (!box || !bodyRef.current) return;
    const parts: string[] = [];
    const walk = (node: Node) => {
      node.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) parts.push(child.textContent ?? "");
        else if (child instanceof HTMLImageElement && child.dataset.emoji) parts.push(`:${child.dataset.emoji}:`);
        else if (child instanceof HTMLBRElement) parts.push("\n");
        else if (child instanceof HTMLElement) {
          if (child.tagName === "DIV" && parts.length) parts.push("\n");
          walk(child);
        }
      });
    };
    walk(box);
    bodyRef.current.value = parts.join("").replace(/\u00a0/g, " ");
  }

  function rememberCaret() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && boxRef.current?.contains(sel.anchorNode)) savedRange.current = sel.getRangeAt(0).cloneRange();
  }

  function insertEmoji(name: string) {
    const box = boxRef.current;
    if (!box) return;
    box.focus();
    const sel = window.getSelection();
    let range = savedRange.current;
    if (!range || !box.contains(range.startContainer)) {
      range = document.createRange();
      range.selectNodeContents(box);
      range.collapse(false);
    }
    const img = document.createElement("img");
    img.src = pixelEmojiDataUrl(name);
    img.alt = PIXEL_EMOJIS[name].label;
    img.dataset.emoji = name;
    img.style.cssText = "display:inline-block;width:18px;height:18px;vertical-align:-3px;margin:0 1px;image-rendering:pixelated";
    range.deleteContents();
    range.insertNode(img);
    range.setStartAfter(img);
    range.collapse(true);
    sel?.removeAllRanges();
    sel?.addRange(range);
    savedRange.current = range.cloneRange();
    syncBody();
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
        <span className="sr-only" id="comment-body-label">Comentario</span>
        <div
          id="comment-body"
          ref={boxRef}
          role="textbox"
          aria-labelledby="comment-body-label"
          aria-multiline="true"
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Escribe tu comentario…"
          onInput={syncBody}
          onKeyUp={rememberCaret}
          onMouseUp={rememberCaret}
          onBlur={rememberCaret}
          onPaste={(e) => {
            // Paste as plain text only.
            e.preventDefault();
            document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
          }}
          className="w-full min-h-[104px] border border-mist px-3 py-2.5 text-[13.5px] whitespace-pre-wrap break-words outline-none focus:border-ink empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-400"
        />
        <input type="hidden" ref={bodyRef} name="body" />
        <div className="mt-1 flex flex-wrap items-center gap-1" aria-label="Emojis">
          {Object.entries(PIXEL_EMOJIS).map(([name, e]) => (
            <button key={name} type="button" title={e.label} aria-label={`Agregar ${e.label}`} onMouseDown={(e) => e.preventDefault()} onClick={() => insertEmoji(name)} className="w-8 h-8 flex items-center justify-center hover:bg-panel">
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
