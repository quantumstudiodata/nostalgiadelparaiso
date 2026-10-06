"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/permissions";
import { contactReplyEmail } from "@/lib/email-templates";
import { sendEmailDetailed, siteUrl } from "@/lib/email";

export type ReplyState = { ok?: boolean; error?: string };

/** Answers a "Escríbenos" message by email. Their answer arrives in Gmail (reply-to). */
export async function replyToContact(messageId: string, _prev: ReplyState, formData: FormData): Promise<ReplyState> {
  await requireManager();
  const reply = String(formData.get("reply") ?? "").trim().slice(0, 10000);
  if (!reply) return { error: "Escribe tu respuesta." };
  const message = await prisma.contactMessage.findUnique({ where: { id: messageId } });
  if (!message) return { error: "Este mensaje ya no existe." };

  const result = await sendEmailDetailed({
    to: message.email,
    subject: "Re: Tu mensaje a Nostalgia del paraíso",
    html: contactReplyEmail({ base: siteUrl(), name: message.name, reply, original: message.message }),
  });
  if (!result.ok) return { error: result.error ?? "No se pudo enviar." };

  await prisma.contactMessage.update({ where: { id: messageId }, data: { reply, repliedAt: new Date() } });
  revalidatePath("/admin/notificaciones");
  return { ok: true };
}
