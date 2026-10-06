"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { canWritePosts, isManager, requireWriter } from "@/lib/permissions";
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
    authorId: String(formData.get("authorId") ?? ""),
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

/** Managers may publish on behalf of any writer; authors always publish as themselves. */
async function resolveAuthorId(user: { id: string; role: string }, requested: string) {
  if (!isManager(user.role) || !requested) return user.id;
  const author = await prisma.user.findUnique({ where: { id: requested } });
  return author && canWritePosts(author.role) ? author.id : user.id;
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

  const post = await prisma.post.create({
    data: {
      title: data.title,
      slug: await uniqueSlug(data.title),
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.coverImage,
      status: data.status,
      // A draft has no date yet: publishedAt also marks "already announced to subscribers".
      publishedAt: data.status === "PUBLISHED" ? (chosenDate(data.publishedDay, null) ?? new Date()) : null,
      authorId: await resolveAuthorId(user, data.authorId),
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

  const existing = await prisma.post.findUnique({ where: { id: postId } });
  if (!existing) return { error: "Esta entrada ya no existe." };
  if (!isManager(user.role) && existing.authorId !== user.id) return { error: "Solo puedes editar tus propias entradas." };

  const slug = existing.title === data.title ? existing.slug : await uniqueSlug(data.title, postId);
  const firstPublish = data.status === "PUBLISHED" && !existing.publishedAt;
  const publishedAt =
    data.status === "PUBLISHED" || existing.publishedAt
      ? (chosenDate(data.publishedDay, existing.publishedAt) ?? existing.publishedAt ?? new Date())
      : null;

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
      categoryId: data.categoryId,
      ...(isManager(user.role) ? { authorId: await resolveAuthorId(user, data.authorId) } : {}),
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
