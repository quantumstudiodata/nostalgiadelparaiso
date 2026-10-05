import { prisma } from "@/lib/prisma";

/** Users who can appear as the publisher of a post. */
export function getWriters() {
  return prisma.user.findMany({
    where: { role: { in: ["ADMIN", "EDITOR", "AUTHOR"] } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
