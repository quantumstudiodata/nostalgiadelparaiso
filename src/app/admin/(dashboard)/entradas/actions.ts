"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { isManager, requireWriter } from "@/lib/permissions";
import { notifySubscribersOfPost } from "@/lib/email";

export type PostFormState = { ok?: boolean; error?: string; savedAt?: number };

async function uniqueSlug(base: string, ignoreId?: string) {
  let slug = slugify(base) || "entrada";
  let n = 1;
  while (
    await prisma.post.findFirst({
      where: { slug, ...(ignoreId ? { id: { not: ignoreId } } : {}) },
    })
  ) {
    n += 1;
    slug = `${slugify(base)}-${n}`;
  }
  return slug;
}

function readForm(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    categoryId: String(formData.get("categoryId") ?? ""),
    excerpt: String(formData.get("excerpt") ?? ""),
    content: String(formData.get("content") ?? ""),
    coverImage: String(formData.get("coverImage") ?? ""),
    writerId: String(formData.get("writerId") ?? ""),
    status: formData.get("status") === "PUBLISHED" ? ("PUBLISHED" as const) : ("DRAFT" as const),
    publishedDay: String(formData.get("publishedAt") ?? "").trim(),
  };
}

const TZ = "America/Mexico_City";

/** The publish date chosen in the form (YYYY-MM-DD). Keeps the original time when the day did not change. */
function chosenDate(day: string, current: Date | null): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  if (current && current.toLocaleDateString("en-CA", { timeZone: TZ }) === day) return current;
  const date = new Date(`${day}T12:00:00-06:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function validWriter(id: string) {
  return id ? Boolean(await prisma.writer.findUnique({ where: { id }, select: { id: true } })) : false;
}

function revalidatePosts(slug?: string) {
  revalidatePath("/admin");
  revalidatePath("/blog");
  revalidatePath("/");
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function createPost(_prev: PostFormState, formData: FormData): Promise<PostFormState> {
  const user = await requireWriter();
  const data = readForm(formData);
  if (!data.title || !data.categoryId) return { error: "El título y la categoría son obligatorios." };
  if (!(await validWriter(data.writerId))) return { error: "Elige el escritor de la entrada." };

  const post = await prisma.post.create({
    data: {
      title: data.title,
      slug: await uniqueSlug(data.title),
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.coverImage,
      status: data.status,
      publishedAt: chosenDate(data.publishedDay, null) ?? (data.status === "PUBLISHED" ? new Date() : null),
      announcedAt: data.status === "PUBLISHED" ? new Date() : null,
      authorId: user.id,
      writerId: data.writerId,
      categoryId: data.categoryId,
    },
  });

  if (post.status === "PUBLISHED") after(() => notifySubscribersOfPost(post.id));
  revalidatePosts(post.slug);
  redirect(`/admin/entradas/${post.id}?guardada=1`);
}

export async function updatePost(postId: string, _prev: PostFormState, formData: FormData): Promise<PostFormState> {
  const user = await requireWriter();
  const data = readForm(formData);
  if (!data.title || !data.categoryId) return { error: "El título y la categoría son obligatorios." };
  if (!(await validWriter(data.writerId))) return { error: "Elige el escritor de la entrada." };

  const existing = await prisma.post.findUnique({ where: { id: postId } });
  if (!existing) return { error: "Esta entrada ya no existe." };
  if (!isManager(user.role) && existing.authorId !== user.id) return { error: "Solo puedes editar tus propias entradas." };

  const slug = existing.title === data.title ? existing.slug : await uniqueSlug(data.title, postId);
  const firstPublish = data.status === "PUBLISHED" && !existing.announcedAt;
  const publishedAt =
    chosenDate(data.publishedDay, existing.publishedAt) ?? (data.status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : null);

  await prisma.post.update({
    where: { id: postId },
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.coverImage,
      status: data.status,
      publishedAt,
      ...(firstPublish ? { announcedAt: new Date() } : {}),
      categoryId: data.categoryId,
      writerId: data.writerId,
    },
  });

  if (firstPublish) after(() => notifySubscribersOfPost(postId));
  revalidatePosts(slug);
  if (slug !== existing.slug) revalidatePath(`/blog/${existing.slug}`);
  return { ok: true, savedAt: Date.now() };
}

export async function deletePost(postId: string) {
  const user = await requireWriter();
  const existing = await prisma.post.findUnique({ where: { id: postId } });
  if (existing && (isManager(user.role) || existing.authorId === user.id)) {
    await prisma.post.delete({ where: { id: postId } });
    revalidatePosts(existing.slug);
  }
  redirect("/admin");
}
