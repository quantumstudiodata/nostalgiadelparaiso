import { prisma } from "@/lib/prisma";

/** Adds an entry to the admin bell. Never throws: a failed notification must not break the action. */
export async function notify(type: string, message: string, link?: string) {
  try {
    await prisma.notification.create({ data: { type, message, link } });
  } catch (error) {
    console.error("[notify] failed:", error);
  }
}
