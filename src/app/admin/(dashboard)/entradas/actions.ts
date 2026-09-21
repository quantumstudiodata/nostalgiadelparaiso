"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado");
  return session.user;
}

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

export async function createPost(formData: FormData) {
  const user = await requireUser();

  const title = String(formData.get("title") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");
  const excerpt = String(formData.get("excerpt") ?? "");
  const content = String(formData.get("content") ?? "");
  const coverImage = String(formData.get("coverImage") ?? "");
  const status = formData.get("status") === "PUBLISHED" ? "PUBLISHED" : "DRAFT";

  if (!title || !categoryId) {
    throw new Error("Título y categoría son obligatorios.");
  }

  const slug = await uniqueSlug(title);

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      authorId: user.id,
      categoryId,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/blog");
  redirect(`/admin/entradas/${post.id}`);
}

export async function updatePost(postId: string, formData: FormData) {
  await requireUser();

  const title = String(formData.get("title") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");
  const excerpt = String(formData.get("excerpt") ?? "");
  const content = String(formData.get("content") ?? "");
  const coverImage = String(formData.get("coverImage") ?? "");
  const status = formData.get("status") === "PUBLISHED" ? "PUBLISHED" : "DRAFT";

  if (!title || !categoryId) {
    throw new Error("Título y categoría son obligatorios.");
  }

  const existing = await prisma.post.findUniqueOrThrow({ where: { id: postId } });
  const slug =
    existing.title === title ? existing.slug : await uniqueSlug(title, postId);

  await prisma.post.update({
    where: { id: postId },
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      status,
      publishedAt:
        status === "PUBLISHED" ? existing.publishedAt ?? new Date() : existing.publishedAt,
      categoryId,
    },
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/entradas/${postId}`);
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
}

export async function deletePost(postId: string) {
  await requireUser();
  await prisma.post.delete({ where: { id: postId } });
  revalidatePath("/admin");
  revalidatePath("/blog");
  redirect("/admin");
}
