"use client";

import { useState, useTransition } from "react";
import { deleteSubscriber } from "@/app/admin/(dashboard)/suscriptores/actions";

/** "X" that removes a subscriber from the list. */
export function DeleteSubscriberButton({ email, userId, name }: { email: string; userId?: string; name: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="flex items-center gap-1">
      {error && <span className="text-[12px] text-red-700">{error}</span>}
      <button
        type="button"
        aria-label={`Eliminar a ${name}`}
        title="Eliminar suscriptor"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await deleteSubscriber(email, userId);
            } catch (err) {
              setError(err instanceof Error ? err.message : "No se pudo eliminar.");
            }
          });
        }}
        className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:bg-panel hover:text-accent-dark disabled:opacity-40"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </span>
  );
}
