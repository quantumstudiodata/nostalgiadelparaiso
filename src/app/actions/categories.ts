"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/permissions";
import { slugify } from "@/lib/slug";

export type CategoryInput = {
  name?: string;
  description?: string;
  imageUrl?: string;
  inEcosystem?: boolean;
};

function revalidateAll() {
  revalidatePath("/", "layout");
}

async function uniqueSlug(name: string, exceptId?: string) {
  const base = slugify(name) || "categoria";
  let slug = base;
  for (let n = 2; ; n++) {
    const taken = await prisma.category.findUnique({ where: { slug } });
    if (!taken || taken.id === exceptId) return slug;
    slug = `${base}-${n}`;
  }
}

async function checkName(name: string, exceptId?: string) {
  const clean = name.trim().slice(0, 80);
  if (!clean) throw new Error("Escribe el nombre.");
  const taken = await prisma.category.findFirst({ where: { name: { equals: clean, mode: "insensitive" }, NOT: exceptId ? { id: exceptId } : undefined } });
  if (taken) throw new Error("Ya existe una categoría con ese nombre.");
  return clean;
}

/** New category; with inEcosystem it also shows in the accordion and the workshop cards. */
export async function createCategory(input: CategoryInput) {
  await requireManager();
  const name = await checkName(input.name ?? "");
  const last = await prisma.category.aggregate({ _max: { order: true } });
  const category = await prisma.category.create({
    data: {
      name,
      slug: await uniqueSlug(name),
      description: input.description?.trim() || null,
      imageUrl: input.imageUrl?.trim() || null,
      inEcosystem: input.inEcosystem ?? true,
      order: (last._max.order ?? 0) + 1,
    },
  });
  revalidateAll();
  return { id: category.id, name: category.name, slug: category.slug };
}

/** A rename shows everywhere the name is used; the slug (the link) stays the same so old links keep working. */
export async function updateCategory(id: string, input: CategoryInput) {
  await requireManager();
  const data: Record<string, unknown> = {};
  if (input.name !== undefined) {
    data.name = await checkName(input.name, id);
    data.cardTitle = null;
  }
  if (input.description !== undefined) data.description = input.description.trim().slice(0, 2000) || null;
  if (input.imageUrl !== undefined) data.imageUrl = input.imageUrl.trim() || null;
  if (input.inEcosystem !== undefined) data.inEcosystem = input.inEcosystem;
  await prisma.category.update({ where: { id }, data });
  revalidateAll();
}

export async function renameCategory(id: string, name: string) {
  await updateCategory(id, { name });
}

/** Reorders the given categories among the slots they already use; the rest keep their place. */
export async function reorderCategories(ids: string[]) {
  await requireManager();
  const all = (await prisma.category.findMany({ orderBy: { order: "asc" }, select: { id: true } })).map((c) => c.id);
  const moving = ids.filter((id, i) => all.includes(id) && ids.indexOf(id) === i);
  const set = new Set(moving);
  let next = 0;
  const final = all.map((id) => (set.has(id) ? moving[next++] : id));
  await prisma.$transaction(final.map((id, order) => prisma.category.update({ where: { id }, data: { order } })));
  revalidateAll();
}

export async function deleteCategory(id: string) {
  await requireManager();
  const posts = await prisma.post.count({ where: { categoryId: id } });
  if (posts > 0) throw new Error("Esta categoría tiene entradas. Muévelas a otra categoría antes de borrarla.");
  await prisma.category.delete({ where: { id } });
  revalidateAll();
}
