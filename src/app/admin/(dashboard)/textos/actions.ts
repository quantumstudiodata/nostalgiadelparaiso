"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function updateSiteBlock(blockId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado");

  const block = await prisma.siteBlock.findUniqueOrThrow({ where: { id: blockId } });
  const currentFields = block.fields as Record<string, string>;

  const nextFields: Record<string, string> = { ...currentFields };
  for (const key of Object.keys(currentFields)) {
    nextFields[key] = String(formData.get(key) ?? currentFields[key] ?? "");
  }

  await prisma.siteBlock.update({
    where: { id: blockId },
    data: { fields: nextFields },
  });

  revalidatePath("/admin/textos");
  revalidatePath("/");
  revalidatePath("/acerca-de-nosotros");
}
