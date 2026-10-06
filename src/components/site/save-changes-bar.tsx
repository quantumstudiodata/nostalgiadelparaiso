"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { pendingCount, saveAllEdits, usePendingEdits } from "@/components/site/edit-session";

/** "Guardar cambios" in the edit bar: nothing is published until it is pressed. */
export function SaveChangesBar() {
  const router = useRouter();
  const count = usePendingEdits();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"saved" | "error" | null>(null);

  // Warn before leaving the page with unsaved changes (reloads, links, back button).
  useEffect(() => {
    function beforeUnload(e: BeforeUnloadEvent) {
      if (pendingCount() > 0) e.preventDefault();
    }
    function onClick(e: MouseEvent) {
      if (pendingCount() === 0) return;
      const link = (e.target as HTMLElement).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.getAttribute("href")?.startsWith("#")) return;
      if (!confirm("Tienes cambios sin guardar. ¿Salir sin guardarlos?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", onClick, true);
    };
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
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {status === "saved" && count === 0 && <span className="text-lilac whitespace-nowrap">✓ Guardado</span>}
      {status === "error" && <span className="text-[#ffd2c2] whitespace-nowrap">No se pudo guardar todo. Intenta de nuevo.</span>}
      {count > 0 && (
        <button
          type="button"
          onClick={() => {
            if (confirm("¿Descartar los cambios sin guardar?")) location.reload();
          }}
          disabled={saving}
          className="whitespace-nowrap underline underline-offset-4 text-lilac"
        >
          Descartar
        </button>
      )}
      <button
        type="button"
        onClick={save}
        disabled={count === 0 || saving}
        className="whitespace-nowrap rounded-full px-4 py-1.5 font-bold bg-white text-ink disabled:bg-white/20 disabled:text-white/60"
      >
        {saving ? "Guardando..." : count > 0 ? `Guardar cambios (${count})` : "Guardar cambios"}
      </button>
    </div>
  );
}
