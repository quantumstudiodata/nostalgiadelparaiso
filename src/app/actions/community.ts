"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { auth, signIn } from "@/auth";
import { isManager } from "@/lib/permissions";
import { emailConfigured, sendEmail, emailLayout, escapeHtml, siteUrl, contactInbox } from "@/lib/email";
import { sendCode, checkCode } from "@/lib/codes";
import { notify } from "@/lib/notify";

export type FormState = { ok?: boolean; error?: string; message?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cleanEmail = (v: FormDataEntryValue | null) => String(v ?? "").trim().toLowerCase();

function checkNewPassword(password: string, confirm: string) {
  if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (!/[A-Za-zÀ-ÿ]/.test(password) || !/\d/.test(password)) return "Usa letras y al menos un número en tu contraseña.";
  if (password !== confirm) return "Las contraseñas no coinciden.";
  return null;
}

async function signInAndGo(email: string, password: string, to: string): Promise<FormState> {
  try {
    await signIn("credentials", { email, password, redirectTo: to });
  } catch (error) {
    if (error instanceof AuthError) return { ok: true, message: "Listo. Ya puedes iniciar sesión." };
    throw error;
  }
  return { ok: true };
}

/* ---------- Newsletter ---------- */

/** Subscribes right away (no confirmation step) and sends a welcome email. */
export async function subscribe(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = cleanEmail(formData.get("email"));
  if (!EMAIL_RE.test(email)) return { error: "Escribe un correo válido." };

  const existing = await prisma.subscriber.findUnique({ where: { email } });
  if (existing?.verified) return { ok: true, message: "Ya estás suscrita/o. ¡Gracias!" };

  await prisma.subscriber.upsert({
    where: { email },
    update: { verified: true, confirmToken: null },
    create: { email, verified: true },
  });
  await notify("subscriber", `Nueva suscripción: ${email}`, "/admin/suscriptores");
  revalidatePath("/admin/suscriptores");

  if (emailConfigured()) {
    await sendEmail({
      to: email,
      subject: "Te suscribiste a Nostalgia del paraíso",
      html: emailLayout(
        "¡Gracias por suscribirte!",
        `<p>Te suscribiste a <strong>Nostalgia del paraíso</strong>. Cada vez que se publique una entrada nueva te llegará un aviso a este correo.</p>
<p><a href="${siteUrl()}/blog" style="display:inline-block;background:#000;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none">Leer las entradas</a></p>`,
      ),
    });
  }
  return { ok: true, message: "¡Listo! Te suscribiste. Te avisaremos por correo cada vez que haya una entrada nueva." };
}

/* ---------- Sign-up with email code ---------- */

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = cleanEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!name) return { error: "Escribe tu nombre." };
  if (!EMAIL_RE.test(email)) return { error: "Escribe un correo válido." };
  const passwordError = checkNewPassword(password, confirm);
  if (passwordError) return { error: passwordError };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.emailVerified) return { error: "Ya existe una cuenta con ese correo. Inicia sesión o recupera tu contraseña." };

  const passwordHash = await bcrypt.hash(password, 10);
  const verifiedNow = emailConfigured() ? null : new Date();
  if (existing) {
    await prisma.user.update({ where: { email }, data: { name, passwordHash, emailVerified: verifiedNow } });
  } else {
    await prisma.user.create({ data: { name, email, passwordHash, role: "READER", emailVerified: verifiedNow } });
  }

  if (verifiedNow) {
    await afterVerified(email, name);
    return signInAndGo(email, password, "/");
  }

  await sendCode(email, "register");
  redirect(`/registro/verificar?email=${encodeURIComponent(email)}`);
}

async function afterVerified(email: string, name: string) {
  await prisma.subscriber.upsert({ where: { email }, update: { name, verified: true }, create: { email, name, verified: true } });
  await notify("signup", `${name} creó una cuenta (${email})`, "/admin/suscriptores");
  revalidatePath("/admin/suscriptores");
}

export async function verifyRegistration(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = cleanEmail(formData.get("email"));
  const code = String(formData.get("code") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "No encontramos esa cuenta. Regístrate de nuevo." };
  if (user.emailVerified) return { ok: true, message: "Tu correo ya estaba confirmado. Inicia sesión." };

  const result = await checkCode(email, "register", code);
  if (!result.ok) return { error: result.error };

  await prisma.user.update({ where: { email }, data: { emailVerified: new Date() } });
  await afterVerified(email, user.name);
  redirect("/admin/login?verificada=1");
}

export async function resendCode(purpose: "register" | "reset", email: string): Promise<FormState> {
  const clean = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: clean } });
  if (user && (purpose === "reset" || !user.emailVerified)) await sendCode(clean, purpose);
  return { ok: true, message: "Te enviamos un código nuevo." };
}

/* ---------- Forgot password ---------- */

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = cleanEmail(formData.get("email"));
  if (!EMAIL_RE.test(email)) return { error: "Escribe un correo válido." };
  if (!emailConfigured()) return { error: "La recuperación por correo todavía no está activada en el sitio." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) await sendCode(email, "reset");
  // Same answer whether or not the account exists, so emails can't be probed.
  redirect(`/recuperar/codigo?email=${encodeURIComponent(email)}`);
}

export async function resetPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = cleanEmail(formData.get("email"));
  const code = String(formData.get("code") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const passwordError = checkNewPassword(password, confirm);
  if (passwordError) return { error: passwordError };
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "El código no es correcto." };

  const result = await checkCode(email, "reset", code);
  if (!result.ok) return { error: result.error };

  await prisma.user.update({
    where: { email },
    data: { passwordHash: await bcrypt.hash(password, 10), emailVerified: user.emailVerified ?? new Date() },
  });
  return signInAndGo(email, password, "/admin");
}

/* ---------- Comments (guests or signed in) ---------- */

export async function addComment(postId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  if (String(formData.get("website") ?? "")) return { ok: true }; // honeypot: bots fill hidden fields

  const session = await auth();
  const body = String(formData.get("body") ?? "").trim();
  const ratingRaw = Number(formData.get("rating") ?? 0);
  const rating = ratingRaw >= 1 && ratingRaw <= 5 ? Math.round(ratingRaw) : null;
  if (!body && !rating) return { error: "Escribe tu comentario o deja una valoración." };
  if (body.length > 3000) return { error: "El comentario es demasiado largo (máximo 3000 caracteres)." };

  let guest: { authorName: string; authorEmail: string } | null = null;
  if (!session?.user) {
    const first = String(formData.get("firstName") ?? "").trim();
    const last = String(formData.get("lastName") ?? "").trim();
    const email = cleanEmail(formData.get("email"));
    if (!first) return { error: "Escribe tu nombre." };
    if (!EMAIL_RE.test(email)) return { error: "Escribe un correo válido (no se mostrará)." };
    guest = { authorName: `${first} ${last}`.trim().slice(0, 80), authorEmail: email };
  }

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { slug: true, title: true, status: true } });
  if (!post || post.status !== "PUBLISHED") return { error: "Esta entrada ya no está disponible." };

  await prisma.comment.create({
    data: { body, rating, postId, ...(session?.user ? { userId: session.user.id } : guest) },
  });
  const who = session?.user?.name ?? guest?.authorName ?? "Alguien";
  await notify("comment", `${who} comentó en “${post.title}”${rating ? ` (${"★".repeat(rating)})` : ""}`, `/blog/${post.slug}#comentarios`);
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

/* ---------- Likes ---------- */

/** "Me gusta" counter on a post; the browser remembers whether this visitor already liked it. */
export async function likePost(postId: string, liked: boolean) {
  const post = await prisma.post.update({
    where: { id: postId },
    data: { likes: liked ? { increment: 1 } : { decrement: 1 } },
    select: { likes: true, title: true, slug: true },
  });
  if (post.likes < 0) await prisma.post.update({ where: { id: postId }, data: { likes: 0 } });
  if (liked) await notify("like", `A alguien le gustó “${post.title}”`, `/blog/${post.slug}`);
  return Math.max(0, post.likes);
}

/* ---------- "Escríbenos" ---------- */

export async function sendContactMessage(_prev: FormState, formData: FormData): Promise<FormState> {
  if (String(formData.get("website") ?? "")) return { ok: true, message: "¡Gracias! Recibimos tu mensaje." };
  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const email = cleanEmail(formData.get("email"));
  const message = String(formData.get("message") ?? "").trim().slice(0, 5000);
  if (!name) return { error: "Escribe tu nombre." };
  if (!EMAIL_RE.test(email)) return { error: "Escribe un correo válido." };
  if (!message) return { error: "Escribe tu mensaje." };

  await prisma.contactMessage.create({ data: { name, email, message } });
  await notify("message", `Mensaje de ${name}: “${message.slice(0, 60)}${message.length > 60 ? "…" : ""}”`, "/admin/notificaciones");

  const inbox = contactInbox();
  if (inbox) {
    await sendEmail({
      to: inbox,
      replyTo: email,
      subject: `Nuevo mensaje de ${name} desde el sitio`,
      html: emailLayout(
        "Nuevo mensaje desde “Escríbenos”",
        `<p><strong>${escapeHtml(name)}</strong> (${escapeHtml(email)}) escribió:</p><p style="white-space:pre-line;border-left:3px solid #ddd7e3;padding-left:12px">${escapeHtml(message)}</p><p style="color:#777;font-size:13px">Responde a este correo para contestarle directamente.</p>`,
      ),
    });
  }
  return { ok: true, message: "¡Gracias! Recibimos tu mensaje y te responderemos pronto." };
}
