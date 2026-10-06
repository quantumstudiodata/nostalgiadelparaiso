"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/permissions";

export type WriterFormState = { ok?: boolean; error?: string; message?: string; id?: string };

function readWriter(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim().slice(0, 80),
    avatarUrl: String(formData.get("avatarUrl") ?? "").trim() || null,
    coverUrl: String(formData.get("coverUrl") ?? "").trim() || null,
    bio: String(formData.get("bio") ?? "").trim().slice(0, 3000) || null,
  };
}

function revalidateAll(id?: string) {
  revalidatePath("/admin/escritores");
  revalidatePath("/", "layout");
  if (id) revalidatePath(`/autor/${id}`);
}

/** Writers are public profiles created by the site's managers; they are not accounts. */
export async function createWriter(_prev: WriterFormState, formData: FormData): Promise<WriterFormState> {
  await requireManager();
  const data = readWriter(formData);
  if (!data.name) return { error: "Escribe el nombre." };
  const writer = await prisma.writer.create({ data });
  revalidateAll();
  return { ok: true, id: writer.id, message: `${writer.name} ya se puede elegir como escritor en las entradas.` };
}

export async function updateWriter(id: string, _prev: WriterFormState, formData: FormData): Promise<WriterFormState> {
  await requireManager();
  const data = readWriter(formData);
  if (!data.name) return { error: "Escribe el nombre." };
  await prisma.writer.update({ where: { id }, data });
  revalidateAll(id);
  return { ok: true, message: "Perfil guardado." };
}

export async function deleteWriter(id: string) {
  await requireManager();
  const posts = await prisma.post.count({ where: { writerId: id } });
  if (posts > 0) throw new Error("Este escritor tiene entradas. Cámbialas a otro escritor antes de borrarlo.");
  await prisma.writer.delete({ where: { id } });
  revalidateAll();
}
