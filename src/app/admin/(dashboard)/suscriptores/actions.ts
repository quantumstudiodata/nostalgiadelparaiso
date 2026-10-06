"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireManager, type AppRole } from "@/lib/permissions";

const ROLES: AppRole[] = ["READER", "AUTHOR", "EDITOR", "ADMIN"];

function allowedRole(manager: { role: AppRole }, role: string): role is AppRole {
  if (!ROLES.includes(role as AppRole)) return false;
  // Only an administrator can promote another administrator.
  return role !== "ADMIN" || manager.role === "ADMIN";
}

function revalidateAll() {
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

/** Removes a subscriber: the newsletter signup and, for people with an account, the account itself. */
export async function deleteSubscriber(email: string, userId?: string) {
  const manager = await requireManager();
  if (userId) {
    if (userId === manager.id) throw new Error("No puedes borrar tu propia cuenta.");
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { _count: { select: { posts: true } } } });
    if (user) {
      if (user.role === "ADMIN" && manager.role !== "ADMIN") throw new Error("No puedes borrar a una administradora.");
      if (user._count.posts > 0) throw new Error("Esta cuenta subió entradas; no se puede borrar.");
      await prisma.user.delete({ where: { id: userId } });
    }
  }
  await prisma.subscriber.deleteMany({ where: { email } });
  revalidateAll();
}
