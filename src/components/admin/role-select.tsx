"use client";

import { useState, useTransition } from "react";
import { updateUserRole } from "@/app/admin/(dashboard)/suscriptores/actions";

export type Role = "ADMIN" | "EDITOR" | "AUTHOR" | "READER";

export const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "READER", label: "Lectora (recibe correos, comenta)" },
  { value: "AUTHOR", label: "Autora (sube entradas)" },
  { value: "EDITOR", label: "Editora (edita todo el sitio)" },
  { value: "ADMIN", label: "Administradora" },
];

export const inputClass = "h-10 border border-mist rounded-md px-2.5 text-[15px] bg-white";

export function RoleSelect({
  userId,
  name,
  role: initial,
  disabled,
  currentUserIsAdmin,
}: {
  userId: string;
  name: string;
  role: Role;
  disabled: boolean;
  currentUserIsAdmin: boolean;
}) {
  const [role, setRole] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <select
        aria-label={`Rol de ${name}`}
        value={role}
        disabled={disabled || pending}
        onChange={(e) => {
          const next = e.target.value as Role;
          const prev = role;
          setRole(next);
          setError(null);
          startTransition(async () => {
            try {
              await updateUserRole(userId, next);
            } catch (err) {
              setRole(prev);
              setError(err instanceof Error ? err.message : "No se pudo cambiar el rol.");
            }
          });
        }}
        className={`${inputClass} w-full disabled:bg-panel`}
      >
        {ROLE_OPTIONS.filter((o) => o.value !== "ADMIN" || currentUserIsAdmin || initial === "ADMIN").map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className="text-[13px] text-red-700">{error}</span>}
    </div>
  );
}
