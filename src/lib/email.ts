import { prisma } from "@/lib/prisma";

const RESEND_URL = "https://api.resend.com/emails/batch";

function siteUrl() {
  const url =
    process.env.SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
  return url.replace(/\/$/, "");
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Whether new-post emails can be sent (needs RESEND_API_KEY and EMAIL_FROM in the environment). */
export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

/** Emails every subscriber about a newly published post. Silently skipped when email isn't configured. */
export async function notifySubscribersOfPost(postId: string) {
  if (!emailConfigured()) {
    console.warn("[email] RESEND_API_KEY / EMAIL_FROM not set; skipping new-post emails.");
    return;
  }

  const post = await prisma.post.findUnique({ where: { id: postId }, include: { author: true } });
  if (!post || post.status !== "PUBLISHED") return;
  const subscribers = await prisma.subscriber.findMany();
  if (subscribers.length === 0) return;

  const base = siteUrl();
  const postUrl = `${base}/blog/${post.slug}`;
  const title = escapeHtml(post.title);
  const excerpt = post.excerpt ? `<p style="font-size:15px;line-height:1.6;color:#333">${escapeHtml(post.excerpt)}</p>` : "";

  const messages = subscribers.map((s) => ({
    from: process.env.EMAIL_FROM!,
    to: s.email,
    subject: `Nueva entrada: ${post.title}`,
    html: `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
<p style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#a24c2f">Nostalgia del paraíso</p>
<h1 style="font-size:28px;margin:8px 0 4px">${title}</h1>
<p style="font-size:14px;color:#555;margin:0 0 16px">por ${escapeHtml(post.author.name)}</p>
${excerpt}
<p><a href="${postUrl}" style="display:inline-block;background:#000;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px">Leer la entrada</a></p>
<p style="font-size:12px;color:#777;margin-top:32px">Recibes este correo porque te suscribiste a Nostalgia del paraíso. <a href="${base}/baja?token=${s.unsubscribeToken}" style="color:#777">Darme de baja</a></p>
</div>`,
  }));

  for (let i = 0; i < messages.length; i += 100) {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(messages.slice(i, i + 100)),
    });
    if (!res.ok) console.error("[email] Resend batch failed:", res.status, await res.text());
  }
}
