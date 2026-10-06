"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { emailConfigured } from "@/lib/email";
import { sendCode, checkCode } from "@/lib/codes";

export type AccountState = { ok?: boolean; error?: string; message?: string; pendingEmail?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeUrl(value: FormDataEntryValue | null) {
  const url = String(value ?? "").trim();
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

/** Public profile: photo, name, short bio and personal social links. */
export async function updateProfile(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const session = await auth();
  if (!session?.user) return { error: "Tu sesión expiró. Vuelve a iniciar sesión." };

  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  if (!name) return { error: "Escribe tu nombre." };

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      bio: String(formData.get("bio") ?? "").trim().slice(0, 1500) || null,
      avatarUrl: String(formData.get("avatarUrl") ?? "").trim() || null,
      websiteUrl: normalizeUrl(formData.get("websiteUrl")) || null,
      socialLinks: {
        instagram: normalizeUrl(formData.get("instagram")),
        facebook: normalizeUrl(formData.get("facebook")),
        tiktok: normalizeUrl(formData.get("tiktok")),
      },
    },
  });
  revalidatePath("/", "layout");
  return { ok: true, message: "Perfil guardado." };
}

/** Email and password. The current password is always required. A new email is confirmed with a code. */
export async function updateSecurity(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const session = await auth();
  if (!session?.user) return { error: "Tu sesión expiró. Vuelve a iniciar sesión." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "No encontramos tu cuenta." };
  if (!(await bcrypt.compare(current, user.passwordHash))) return { error: "Tu contraseña actual no es correcta." };
  if (!EMAIL_RE.test(email)) return { error: "Escribe un correo válido." };

  if (next || confirm) {
    if (next.length < 8) return { error: "La nueva contraseña debe tener al menos 8 caracteres." };
    if (!/[A-Za-zÀ-ÿ]/.test(next) || !/\d/.test(next)) return { error: "Usa letras y al menos un número en la nueva contraseña." };
    if (next !== confirm) return { error: "La nueva contraseña y su confirmación no coinciden." };
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(next, 10) } });
  }

  const emailChanged = email !== user.email;
  if (emailChanged) {
    if (await prisma.user.findUnique({ where: { email } })) return { error: "Ya hay otra cuenta con ese correo." };
    if (emailConfigured()) {
      await sendCode(email, "email-change", { userId: user.id });
      return {
        ok: true,
        pendingEmail: email,
        message: `${next ? "Contraseña cambiada. " : ""}Te enviamos un código a ${email} para confirmar tu nuevo correo.`,
      };
    }
    await prisma.user.update({ where: { id: user.id }, data: { email } });
  }

  if (!next && !emailChanged) return { ok: true, message: "No hubo cambios." };
  return { ok: true, message: "Listo. Usa tus datos nuevos la próxima vez que inicies sesión." };
}

export async function confirmEmailChange(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const session = await auth();
  if (!session?.user) return { error: "Tu sesión expiró. Vuelve a iniciar sesión." };
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const result = await checkCode(email, "email-change", String(formData.get("code") ?? ""));
  if (!result.ok) return { error: result.error, pendingEmail: email };
  if (result.data.userId !== session.user.id) return { error: "Este código no es para tu cuenta." };
  if (await prisma.user.findUnique({ where: { email } })) return { error: "Ya hay otra cuenta con ese correo." };

  await prisma.user.update({ where: { id: session.user.id }, data: { email } });
  revalidatePath("/admin/cuenta");
  return { ok: true, message: "Tu correo quedó cambiado. Úsalo la próxima vez que inicies sesión." };
}
