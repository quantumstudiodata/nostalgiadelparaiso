"use client";

export function DeletePostButton({ action }: { action: () => Promise<void> }) {
  return (
    <button
      type="submit"
      formAction={action}
      formNoValidate
      onClick={(e) => {
        if (!confirm("¿Eliminar esta entrada? No se puede deshacer.")) e.preventDefault();
      }}
      className="text-left text-[13px] text-accent-dark py-2 hover:underline"
    >
      Eliminar entrada
    </button>
  );
}
