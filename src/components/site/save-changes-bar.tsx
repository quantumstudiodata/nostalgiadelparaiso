"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { pendingCount, saveAllEdits, usePendingEdits } from "@/components/site/edit-session";

/**
 * "Guardar cambios" in the edit bar: nothing is published until it is pressed.
 * No browser pop-ups: leaving with unsaved changes asks right here in the bar.
 */
export function SaveChangesBar() {
  const router = useRouter();
  const count = usePendingEdits();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"saved" | "error" | null>(null);
  const [leavingTo, setLeavingTo] = useState<string | null>(null);

  // A link clicked with unsaved changes waits for an answer in the bar.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (pendingCount() === 0) return;
      const link = (e.target as HTMLElement).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.getAttribute("href")?.startsWith("#")) return;
      e.preventDefault();
      e.stopPropagation();
      setLeavingTo(link.href);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (status !== "saved") return;
    const t = setTimeout(() => setStatus(null), 3000);
    return () => clearTimeout(t);
  }, [status]);

  async function save() {
    setSaving(true);
    const failed = await saveAllEdits();
    setSaving(false);
    setStatus(failed ? "error" : "saved");
    return failed === 0;
  }

  const button = "whitespace-nowrap rounded-full px-4 py-1.5 font-bold";

  if (leavingTo && count > 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="whitespace-nowrap text-lilac">Tienes cambios sin guardar.</span>
        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            if (await save()) location.href = leavingTo;
          }}
          className={`${button} bg-white text-ink`}
        >
          {saving ? "Guardando..." : "Guardar y salir"}
        </button>
        <button type="button" onClick={() => (location.href = leavingTo)} className={`${button} border border-white/50`}>
          Salir sin guardar
        </button>
        <button type="button" onClick={() => setLeavingTo(null)} className="whitespace-nowrap underline underline-offset-4 text-lilac">
          Seguir editando
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {status === "saved" && count === 0 && <span className="text-lilac whitespace-nowrap">✓ Guardado</span>}
      {status === "error" && <span className="text-[#ffd2c2] whitespace-nowrap">No se pudo guardar todo. Intenta de nuevo.</span>}
      {count > 0 && (
        <button type="button" onClick={() => location.reload()} disabled={saving} className="whitespace-nowrap underline underline-offset-4 text-lilac">
          Descartar
        </button>
      )}
      <button
        type="button"
        onClick={async () => {
          await save();
          router.refresh();
        }}
        disabled={count === 0 || saving}
        className={`${button} bg-white text-ink disabled:bg-white/20 disabled:text-white/60`}
      >
        {saving ? "Guardando..." : count > 0 ? `Guardar cambios (${count})` : "Guardar cambios"}
      </button>
    </div>
  );
}
