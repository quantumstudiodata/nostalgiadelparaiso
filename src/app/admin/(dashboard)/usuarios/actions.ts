"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireManager, type AppRole } from "@/lib/permissions";

export type UserFormState = { ok?: boolean; error?: string; message?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES: AppRole[] = ["READER", "AUTHOR", "EDITOR", "ADMIN"];

function allowedRole(manager: { role: AppRole }, role: string): role is AppRole {
  if (!ROLES.includes(role as AppRole)) return false;
  // Only an administrator can create or promote another administrator.
  return role !== "ADMIN" || manager.role === "ADMIN";
}

function revalidateUsers() {
  revalidatePath("/admin/usuarios");
  revalidatePath("/", "layout");
}

export async function createUser(_prev: UserFormState, formData: FormData): Promise<UserFormState> {
  const manager = await requireManager();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "AUTHOR");
  const bio = String(formData.get("bio") ?? "").trim();
  const avatarUrl = String(formData.get("avatarUrl") ?? "").trim();

  if (!name) return { error: "Escribe el nombre." };
  if (!EMAIL_RE.test(email)) return { error: "Escribe un correo válido." };
  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };
  if (!allowedRole(manager, role)) return { error: "No puedes asignar ese rol." };
  if (await prisma.user.findUnique({ where: { email } })) return { error: "Ya existe una cuenta con ese correo." };

  await prisma.user.create({
    data: { name, email, role, bio: bio || null, avatarUrl: avatarUrl || null, passwordHash: await bcrypt.hash(password, 10) },
  });
  revalidateUsers();
  return { ok: true, message: `${name} fue registrada. Comparte con ella su correo y contraseña para que inicie sesión.` };
}

export async function updateUserRole(userId: string, role: string) {
  const manager = await requireManager();
  if (userId === manager.id) throw new Error("No puedes cambiar tu propio rol.");
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return;
  if (target.role === "ADMIN" && manager.role !== "ADMIN") throw new Error("No puedes cambiar a una administradora.");
  if (!allowedRole(manager, role)) throw new Error("No puedes asignar ese rol.");

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidateUsers();
}

export async function updateUserProfile(userId: string, _prev: UserFormState, formData: FormData): Promise<UserFormState> {
  const manager = await requireManager();
  const name = String(formData.get("name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const avatarUrl = String(formData.get("avatarUrl") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "");
  if (!name) return { error: "Escribe el nombre." };
  if (newPassword && newPassword.length < 8) return { error: "La nueva contraseña debe tener al menos 8 caracteres." };

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { error: "Esta persona ya no existe." };
  if (newPassword && target.role === "ADMIN" && manager.role !== "ADMIN") {
    return { error: "No puedes cambiar la contraseña de una administradora." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      bio: bio || null,
      avatarUrl: avatarUrl || null,
      ...(newPassword ? { passwordHash: await bcrypt.hash(newPassword, 10) } : {}),
    },
  });
  revalidateUsers();
  revalidatePath("/blog", "layout");
  return { ok: true, message: newPassword ? "Perfil y contraseña guardados. Compártele su nueva contraseña." : "Perfil guardado." };
}
