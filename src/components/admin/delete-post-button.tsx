"use client";

import { InlineConfirm } from "./inline-confirm";

export function DeletePostButton({ action }: { action: () => Promise<void> }) {
  return (
    <InlineConfirm
      label="Eliminar entrada"
      question="¿Eliminar esta entrada? No se puede deshacer."
      className="text-left text-[15px] text-accent-dark py-2 hover:underline"
      confirmButton={
        <button type="submit" formAction={action} formNoValidate className="rounded-full bg-accent-dark text-white px-3 py-1">
          Sí, eliminar
        </button>
      }
    />
  );
}
