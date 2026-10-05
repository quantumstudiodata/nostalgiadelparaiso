"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export type AccountState = { ok?: boolean; error?: string; message?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Lets the signed-in person change their name, sign-in email and password. Requires the current password. */
export async function updateAccount(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const session = await auth();
  if (!session?.user) return { error: "Tu sesión expiró. Vuelve a iniciar sesión." };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "No encontramos tu cuenta." };
  if (!(await bcrypt.compare(current, user.passwordHash))) return { error: "Tu contraseña actual no es correcta." };

  if (!name) return { error: "Escribe tu nombre." };
  if (!EMAIL_RE.test(email)) return { error: "Escribe un correo válido." };
  if (email !== user.email && (await prisma.user.findUnique({ where: { email } }))) {
    return { error: "Ya hay otra cuenta con ese correo." };
  }
  if (next || confirm) {
    if (next.length < 8) return { error: "La nueva contraseña debe tener al menos 8 caracteres." };
    if (next !== confirm) return { error: "La nueva contraseña y su confirmación no coinciden." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { name, email, ...(next ? { passwordHash: await bcrypt.hash(next, 10) } : {}) },
  });
  revalidatePath("/", "layout");

  const changes = [next && "contraseña", email !== user.email && "correo"].filter(Boolean);
  return {
    ok: true,
    message: changes.length
      ? `Listo. Cambiaste tu ${changes.join(" y tu ")}. Usa los datos nuevos la próxima vez que inicies sesión.`
      : "Datos guardados.",
  };
}
