import { prisma } from "@/lib/prisma";

/** Writer profiles that can be shown as a post's author. */
export function getWriters() {
  return prisma.writer.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
}

/** Preselected writer for a new post: the one with the account's name, else the first. */
export function defaultWriterId(writers: { id: string; name: string }[], userName?: string | null) {
  const name = userName?.trim().toLowerCase();
  return writers.find((w) => w.name.trim().toLowerCase() === name)?.id ?? writers[0]?.id ?? "";
}
