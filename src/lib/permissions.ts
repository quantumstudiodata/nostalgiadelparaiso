import { redirect } from "next/navigation";
import { auth } from "@/auth";

export type AppRole = "ADMIN" | "EDITOR" | "AUTHOR" | "READER";

export const ROLE_LABELS: Record<AppRole, string> = {
  ADMIN: "Administradora",
  EDITOR: "Editora del sitio",
  AUTHOR: "Autora (solo entradas)",
  READER: "Lectora",
};

/** Can edit the public pages, manage users, subscribers and social links. */
export function isManager(role?: string | null): boolean {
  return role === "ADMIN" || role === "EDITOR";
}

/** Can create posts (managers, plus authors for their own posts). */
export function canWritePosts(role?: string | null): boolean {
  return isManager(role) || role === "AUTHOR";
}

export async function getViewer() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireManager() {
  const user = await getViewer();
  if (!user || !isManager(user.role)) throw new Error("No autorizado");
  return user;
}

export async function requireWriter() {
  const user = await getViewer();
  if (!user || !canWritePosts(user.role)) throw new Error("No autorizado");
  return user;
}

/** For manager-only admin pages: send everyone else back to their posts. */
export async function requireManagerPage() {
  const user = await getViewer();
  if (!user || !isManager(user.role)) redirect("/admin");
  return user;
}
