"use server";

import { requireManager } from "@/lib/permissions";
import { emailLayout, sendEmailDetailed } from "@/lib/email";

export type EmailTestState = { ok?: boolean; message?: string };

/** Sends a test email to the signed-in manager and reports exactly what Resend answered. */
export async function sendTestEmail(_prev: EmailTestState, formData: FormData): Promise<EmailTestState> {
  const user = await requireManager();
  const to = String(formData.get("to") ?? "").trim() || user.email || "";
  if (!to) return { ok: false, message: "Escribe un correo." };
  const result = await sendEmailDetailed({
    to,
    subject: "Correo de prueba · Nostalgia del Paraíso",
    html: emailLayout("Correo de prueba", "<p>Si lees esto, los correos del sitio ya funcionan.</p>"),
  });
  return result.ok
    ? { ok: true, message: `Enviado a ${to}. Revisa tu bandeja (y la carpeta de spam).` }
    : { ok: false, message: result.error ?? "No se pudo enviar." };
}
