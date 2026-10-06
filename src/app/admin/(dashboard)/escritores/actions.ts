"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireManager, type AppRole } from "@/lib/permissions";

export type WriterFormState = { ok?: boolean; error?: string; message?: string };

const ROLES: AppRole[] = ["READER", "AUTHOR", "EDITOR", "ADMIN"];

function allowedRole(manager: { role: AppRole }, role: string): role is AppRole {
  if (!ROLES.includes(role as AppRole)) return false;
  // Only an administrator can promote another administrator.
  return role !== "ADMIN" || manager.role === "ADMIN";
}

function revalidateAll() {
  revalidatePath("/admin/escritores");
  revalidatePath("/admin/suscriptores");
  revalidatePath("/", "layout");
}

/** Managers only grant roles. Accounts and passwords belong to each person. */
export async function updateUserRole(userId: string, role: string) {
  const manager = await requireManager();
  if (userId === manager.id) throw new Error("No puedes cambiar tu propio rol.");
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return;
  if (target.role === "ADMIN" && manager.role !== "ADMIN") throw new Error("No puedes cambiar a una administradora.");
  if (!allowedRole(manager, role)) throw new Error("No puedes asignar ese rol.");

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidateAll();
}

/** Grants the writer role to a registered person, found by email. */
export async function addWriter(_prev: WriterFormState, formData: FormData): Promise<WriterFormState> {
  const manager = await requireManager();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "AUTHOR");
  if (!allowedRole(manager, role) || role === "READER") return { error: "No puedes asignar ese rol." };
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "No hay ninguna cuenta con ese correo. Pídele que primero se registre en el sitio." };
  if (user.role === "ADMIN" && manager.role !== "ADMIN") return { error: "No puedes cambiar a una administradora." };
  await prisma.user.update({ where: { id: user.id }, data: { role } });
  revalidateAll();
  return { ok: true, message: `${user.name} ya puede publicar entradas.` };
}

/** Public writer profile: name, photo, cover, bio and author link. */
export async function updateWriterProfile(userId: string, _prev: WriterFormState, formData: FormData): Promise<WriterFormState> {
  const manager = await requireManager();
  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  if (!name) return { error: "Escribe el nombre." };
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { error: "Esta persona ya no existe." };
  if (target.role === "ADMIN" && manager.role !== "ADMIN" && target.id !== manager.id) {
    return { error: "No puedes editar el perfil de una administradora." };
  }
  let websiteUrl = String(formData.get("websiteUrl") ?? "").trim();
  if (websiteUrl && !/^https?:\/\//i.test(websiteUrl)) websiteUrl = `https://${websiteUrl}`;

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      bio: String(formData.get("bio") ?? "").trim().slice(0, 1500) || null,
      avatarUrl: String(formData.get("avatarUrl") ?? "").trim() || null,
      coverUrl: String(formData.get("coverUrl") ?? "").trim() || null,
      websiteUrl: websiteUrl || null,
    },
  });
  revalidateAll();
  revalidatePath(`/autor/${userId}`);
  return { ok: true, message: "Perfil guardado." };
}
