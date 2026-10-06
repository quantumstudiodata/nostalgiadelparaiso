import { createHash, randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailLayout } from "@/lib/email";

export type CodePurpose = "register" | "reset" | "email-change";

const TTL_MINUTES = 15;
const MAX_ATTEMPTS = 5;

const hash = (code: string) => createHash("sha256").update(code).digest("hex");

const SUBJECTS: Record<CodePurpose, { subject: string; title: string; intro: string }> = {
  register: { subject: "Tu código para crear tu cuenta", title: "Confirma tu correo", intro: "Usa este código para terminar de crear tu cuenta:" },
  reset: { subject: "Tu código para cambiar la contraseña", title: "Restablece tu contraseña", intro: "Usa este código para elegir una contraseña nueva:" },
  "email-change": { subject: "Confirma tu nuevo correo", title: "Confirma tu nuevo correo", intro: "Usa este código para confirmar tu nuevo correo:" },
};

/** Creates a 6-digit code (valid 15 minutes, replacing earlier ones) and emails it. */
export async function sendCode(email: string, purpose: CodePurpose, data?: Record<string, unknown>) {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await prisma.verificationCode.deleteMany({ where: { email, purpose } });
  await prisma.verificationCode.create({
    data: { email, purpose, codeHash: hash(code), data: data as never, expiresAt: new Date(Date.now() + TTL_MINUTES * 60_000) },
  });
  const t = SUBJECTS[purpose];
  return sendEmail({
    to: email,
    subject: t.subject,
    html: emailLayout(
      t.title,
      `<p>${t.intro}</p><p style="font-size:32px;letter-spacing:.3em;font-weight:bold;font-family:monospace;margin:16px 0">${code}</p><p style="color:#777;font-size:13px">Vence en ${TTL_MINUTES} minutos. Si no fuiste tú, ignora este correo.</p>`,
    ),
  });
}

/** Checks a code; on success deletes it and returns its stored data. */
export async function checkCode(email: string, purpose: CodePurpose, code: string) {
  const row = await prisma.verificationCode.findFirst({ where: { email, purpose }, orderBy: { createdAt: "desc" } });
  if (!row || row.expiresAt < new Date()) return { ok: false as const, error: "El código venció. Pide uno nuevo." };
  if (row.attempts >= MAX_ATTEMPTS) return { ok: false as const, error: "Demasiados intentos. Pide un código nuevo." };
  if (row.codeHash !== hash(code.replace(/\D/g, ""))) {
    await prisma.verificationCode.update({ where: { id: row.id }, data: { attempts: { increment: 1 } } });
    return { ok: false as const, error: "El código no es correcto." };
  }
  await prisma.verificationCode.delete({ where: { id: row.id } });
  return { ok: true as const, data: (row.data ?? {}) as Record<string, unknown> };
}
