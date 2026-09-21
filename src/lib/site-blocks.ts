import { prisma } from "@/lib/prisma";

export async function getSiteBlock<T = Record<string, string>>(id: string): Promise<T> {
  const block = await prisma.siteBlock.findUnique({ where: { id } });
  return (block?.fields as T) ?? ({} as T);
}
