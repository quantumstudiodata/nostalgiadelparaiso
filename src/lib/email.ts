import { prisma } from "@/lib/prisma";
import { newPostEmail, postSummary, welcomeEmail } from "@/lib/email-templates";

const RESEND_URL = "https://api.resend.com/emails/batch";

export function siteUrl() {
  const url =
    env("SITE_URL") ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
  return url.replace(/\/$/, "");
}

export function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Reads an env var, ignoring surrounding spaces or quotes pasted by mistake. */
function env(name: string) {
  return process.env[name]?.trim().replace(/^["']|["']$/g, "").trim() || undefined;
}

/** Whether new-post emails can be sent (needs RESEND_API_KEY and EMAIL_FROM in the environment). */
export function emailConfigured() {
  return Boolean(env("RESEND_API_KEY") && env("EMAIL_FROM"));
}

/** Which email variables are set in this deploy (values are never shown). */
export function emailEnvStatus() {
  return ["RESEND_API_KEY", "EMAIL_FROM", "EMAIL_REPLY_TO", "CONTACT_EMAIL", "SITE_URL"].map((name) => ({ name, set: Boolean(env(name)) }));
}

export function contactInbox() {
  return env("CONTACT_EMAIL") ?? env("EMAIL_REPLY_TO");
}

/** Emails every subscriber about a newly published post. Silently skipped when email isn't configured. */
export async function notifySubscribersOfPost(postId: string) {
  if (!emailConfigured()) {
    console.warn("[email] RESEND_API_KEY / EMAIL_FROM not set; skipping new-post emails.");
    return;
  }

  const post = await prisma.post.findUnique({ where: { id: postId }, include: { writer: true } });
  if (!post || post.status !== "PUBLISHED") return;
  const subscribers = await prisma.subscriber.findMany({ where: { verified: true } });
  if (subscribers.length === 0) return;

  const base = siteUrl();
  const postUrl = `${base}/blog/${post.slug}`;
  const body = postSummary(post.content) || post.excerpt || "";

  const messages = subscribers.map((s) => ({
    from: env("EMAIL_FROM")!,
    // The sending domain has no inbox, so replies go to a real address (e.g. the Gmail account).
    ...(env("EMAIL_REPLY_TO") ? { reply_to: env("EMAIL_REPLY_TO") } : {}),
    to: s.email,
    subject: `Nueva entrada: ${post.title}`,
    html: newPostEmail({
      base,
      title: post.title,
      writerName: post.writer.name,
      writerAvatarUrl: post.writer.avatarUrl,
      body,
      postUrl,
      unsubscribeUrl: `${base}/baja?token=${s.unsubscribeToken}`,
    }),
  }));

  for (let i = 0; i < messages.length; i += 100) {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${env("RESEND_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify(messages.slice(i, i + 100)),
    });
    if (!res.ok) console.error("[email] Resend batch failed:", res.status, await res.text());
  }
}

/** Sends one email through Resend. Returns false (and logs) when email isn't configured or the send fails. */
export async function sendEmail(message: { to: string; subject: string; html: string; replyTo?: string }) {
  return (await sendEmailDetailed(message)).ok;
}

/** Sends one email and reports Resend's answer, for the panel's test button. */
export async function sendEmailDetailed({ to, subject, html, replyTo }: { to: string; subject: string; html: string; replyTo?: string }) {
  if (!emailConfigured()) {
    console.warn(`[email] not configured; skipped "${subject}" to ${to}`);
    return { ok: false, error: "Faltan RESEND_API_KEY o EMAIL_FROM en este deploy." };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env("RESEND_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env("EMAIL_FROM"), to, subject, html, reply_to: replyTo ?? env("EMAIL_REPLY_TO") }),
    });
    if (res.ok) return { ok: true, error: null };
    const text = await res.text();
    console.error("[email] Resend send failed:", res.status, text);
    let detail = text;
    try {
      detail = (JSON.parse(text) as { message?: string }).message ?? text;
    } catch {}
    return { ok: false, error: `Resend respondió ${res.status}: ${detail}` };
  } catch (error) {
    console.error("[email] Resend request failed:", error);
    return { ok: false, error: `No se pudo conectar con Resend: ${error instanceof Error ? error.message : String(error)}` };
  }
}

/** Welcome email sent right after someone subscribes. */
export async function sendWelcomeEmail(email: string, unsubscribeToken: string) {
  const base = siteUrl();
  return sendEmail({
    to: email,
    subject: "Te suscribiste a Nostalgia del paraíso",
    html: welcomeEmail({ base, unsubscribeUrl: `${base}/baja?token=${unsubscribeToken}` }),
  });
}

/** Simple branded wrapper shared by every transactional email. */
export function emailLayout(title: string, body: string) {
  return `<div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:24px;color:#111">
<p style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#a24c2f">Nostalgia del paraíso</p>
<h1 style="font-size:24px;margin:8px 0 16px">${escapeHtml(title)}</h1>
<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#333">${body}</div>
</div>`;
}
