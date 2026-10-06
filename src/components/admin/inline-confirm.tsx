"use client";

import { useState, type ReactNode } from "react";

/** A button that asks "¿Seguro?" right where it is, instead of a browser pop-up. */
export function InlineConfirm({
  label,
  question,
  confirmLabel = "Sí, borrar",
  onConfirm,
  disabled,
  title,
  className = "text-[13px] text-accent-dark hover:underline disabled:opacity-40 disabled:no-underline",
  confirmButton,
}: {
  label: ReactNode;
  question: string;
  confirmLabel?: string;
  onConfirm?: () => void;
  disabled?: boolean;
  title?: string;
  className?: string;
  /** Custom confirm element (e.g. a submit button with formAction). */
  confirmButton?: ReactNode;
}) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <button type="button" onClick={() => setAsking(true)} disabled={disabled} title={title} className={className}>
        {label}
      </button>
    );
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-2 text-[13px]">
      <span className="text-neutral-700">{question}</span>
      {confirmButton ?? (
        <button
          type="button"
          onClick={() => {
            setAsking(false);
            onConfirm?.();
          }}
          className="rounded-full bg-accent-dark text-white px-3 py-1"
        >
          {confirmLabel}
        </button>
      )}
      <button type="button" onClick={() => setAsking(false)} className="rounded-full border border-neutral-400 px-3 py-1">
        Cancelar
      </button>
    </span>
  );
}
