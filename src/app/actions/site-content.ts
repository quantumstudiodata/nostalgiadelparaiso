"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type EditableButton = { id: string; text: string; url: string };

async function requireEditor() {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado");
  return session.user;
}

function revalidateSiteContentPaths() {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/acerca-de-nosotros");
}

export async function updateSiteBlockField(blockId: string, key: string, value: string) {
  await requireEditor();

  // Blocks added after the initial seed (e.g. "about.nostalgia") are created on first edit.
  const block = await prisma.siteBlock.findUnique({ where: { id: blockId } });
  const fields = {
    ...((block?.fields as Record<string, unknown>) ?? {}),
    [key]: value,
  } as Prisma.InputJsonValue;

  await prisma.siteBlock.upsert({
    where: { id: blockId },
    update: { fields },
    create: { id: blockId, page: blockId.split(".")[0], label: blockId, fields },
  });
  revalidateSiteContentPaths();
}

export async function updateSiteBlockButton(
  blockId: string,
  key: string,
  value: { text: string; url: string },
) {
  await requireEditor();

  const block = await prisma.siteBlock.findUniqueOrThrow({ where: { id: blockId } });
  const fields = {
    ...(block.fields as Record<string, unknown>),
    [`${key}Text`]: value.text,
    [`${key}Url`]: value.url,
  } as Prisma.InputJsonValue;

  await prisma.siteBlock.update({ where: { id: blockId }, data: { fields } });
  revalidateSiteContentPaths();
}

export async function updateSiteBlockButtons(blockId: string, buttons: EditableButton[]) {
  await requireEditor();

  const block = await prisma.siteBlock.findUniqueOrThrow({ where: { id: blockId } });
  const fields = {
    ...(block.fields as Record<string, unknown>),
    buttons,
  } as Prisma.InputJsonValue;

  await prisma.siteBlock.update({ where: { id: blockId }, data: { fields } });
  revalidateSiteContentPaths();
}

export async function updateCategoryField(
  categoryId: string,
  key: "cardTitle" | "description" | "imageUrl",
  value: string,
) {
  await requireEditor();

  await prisma.category.update({ where: { id: categoryId }, data: { [key]: value } });
  revalidateSiteContentPaths();
}
