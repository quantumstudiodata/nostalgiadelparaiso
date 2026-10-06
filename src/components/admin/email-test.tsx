"use client";

import { useActionState } from "react";
import { sendTestEmail, type EmailTestState } from "@/app/actions/email-test";

export function EmailTest({ defaultTo, vars }: { defaultTo: string; vars: { name: string; set: boolean }[] }) {
  const [state, action, pending] = useActionState<EmailTestState, FormData>(sendTestEmail, {});
  return (
    <section className="bg-white rounded-[10px] p-5">
      <h2 className="font-bold text-[17px]">Correos del sitio</h2>
      <ul className="mt-2 flex flex-wrap gap-2 text-[13px]">
        {vars.map((v) => (
          <li key={v.name} className={`rounded-full px-2.5 py-1 ${v.set ? "bg-[#e3efe3] text-[#1f5c2a]" : "bg-[#fde8e4] text-[#8a2a12]"}`}>
            {v.set ? "✓" : "✕"} {v.name}
          </li>
        ))}
      </ul>
      <form action={action} className="mt-3 flex flex-wrap items-end gap-2.5">
        <label className="flex flex-col gap-1 text-[14px] font-medium">
          Enviar un correo de prueba a
          <input name="to" type="email" defaultValue={defaultTo} className="h-10 w-72 max-w-full border border-mist rounded-md px-2.5 text-[15px]" />
        </label>
        <button type="submit" disabled={pending} className="h-10 bg-ink text-white rounded-full px-4 text-[14px] font-medium disabled:opacity-60">
          {pending ? "Enviando..." : "Enviar correo de prueba"}
        </button>
      </form>
      {state.message && (
        <p role="status" className={`mt-3 text-[14px] ${state.ok ? "text-[#1f5c2a]" : "text-red-700"}`}>
          {state.message}
        </p>
      )}
    </section>
  );
}
