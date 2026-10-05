"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isManager } from "@/lib/permissions";

export type EditableButton = { id: string; text: string; url: string };

async function requireEditor() {
  const session = await auth();
  if (!session?.user || !isManager(session.user.role)) throw new Error("No autorizado");
  return session.user;
}

function revalidateSiteContentPaths() {
  revalidatePath("/", "layout");
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

function normalizeUrl(value: unknown) {
  const url = String(value ?? "").trim();
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

/** Links for the social icons in the site header. An empty link hides its icon. */
export async function updateSocialLinks(links: { instagram: string; tiktok: string; facebook: string }) {
  await requireEditor();

  const fields = {
    instagram: normalizeUrl(links.instagram),
    tiktok: normalizeUrl(links.tiktok),
    facebook: normalizeUrl(links.facebook),
  };
  await prisma.siteBlock.upsert({
    where: { id: "site.social" },
    update: { fields },
    create: { id: "site.social", page: "site", label: "Redes sociales", fields },
  });
  revalidateSiteContentPaths();
  return fields;
}

export type EcosystemItem = { id: string; title: string; description: string; url: string };

/** Items of the "En este ecosistema conviven" accordion on the home page. */
export async function updateEcosystemItems(items: EcosystemItem[]) {
  await requireEditor();

  const clean = items
    .map((item) => ({
      id: String(item.id || crypto.randomUUID()),
      title: String(item.title ?? "").trim().slice(0, 120),
      description: String(item.description ?? "").trim().slice(0, 2000),
      url: String(item.url ?? "").trim().slice(0, 500),
    }))
    .filter((item) => item.title)
    .slice(0, 12);

  const fields = { items: clean } as Prisma.InputJsonValue;
  await prisma.siteBlock.upsert({
    where: { id: "home.ecosystem" },
    update: { fields },
    create: { id: "home.ecosystem", page: "home", label: "En este ecosistema conviven", fields },
  });
  revalidateSiteContentPaths();
}
