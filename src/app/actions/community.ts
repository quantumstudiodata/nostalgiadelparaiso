"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { auth, signIn } from "@/auth";
import { isManager } from "@/lib/permissions";

export type FormState = { ok?: boolean; error?: string; message?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribe(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: "Escribe un correo válido." };

  await prisma.subscriber.upsert({ where: { email }, update: {}, create: { email } });
  revalidatePath("/admin/suscriptores");
  return { ok: true, message: "¡Listo! Te avisaremos cuando haya una nueva entrada." };
}

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name) return { error: "Escribe tu nombre." };
  if (!EMAIL_RE.test(email)) return { error: "Escribe un correo válido." };
  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };
  if (await prisma.user.findUnique({ where: { email } })) {
    return { error: "Ya existe una cuenta con ese correo. Inicia sesión." };
  }

  await prisma.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 10), role: "READER" },
  });
  await prisma.subscriber.upsert({ where: { email }, update: { name }, create: { email, name } });
  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/suscriptores");

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) return { ok: true, message: "Cuenta creada. Ya puedes iniciar sesión." };
    throw error;
  }
  return { ok: true };
}

export async function addComment(postId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const session = await auth();
  if (!session?.user) return { error: "Inicia sesión para comentar." };

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Escribe tu comentario." };
  if (body.length > 3000) return { error: "El comentario es demasiado largo (máximo 3000 caracteres)." };

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { slug: true, status: true } });
  if (!post || post.status !== "PUBLISHED") return { error: "Esta entrada ya no está disponible." };

  await prisma.comment.create({ data: { body, postId, userId: session.user.id } });
  revalidatePath(`/blog/${post.slug}`);
  return { ok: true };
}

export async function deleteComment(commentId: string) {
  const session = await auth();
  const comment = await prisma.comment.findUnique({ where: { id: commentId }, include: { post: true } });
  if (!session?.user || !comment) return;
  if (comment.userId !== session.user.id && !isManager(session.user.role)) return;

  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath(`/blog/${comment.post.slug}`);
}
