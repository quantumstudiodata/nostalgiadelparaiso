"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/permissions";

const FIELDS = ["title", "description", "keywords", "homeTitle", "homeDescription", "blogTitle", "blogDescription", "aboutTitle", "aboutDescription"];

export type SeoFormState = { ok?: boolean; error?: string };

/** Saves the "SEO del sitio" form; an empty field goes back to the default text. */
export async function saveSiteSeo(_prev: SeoFormState, formData: FormData): Promise<SeoFormState> {
  await requireManager();
  const fields = Object.fromEntries(FIELDS.map((k) => [k, String(formData.get(k) ?? "").trim().slice(0, 600)])) as Prisma.InputJsonValue;
  await prisma.siteBlock.upsert({
    where: { id: "site.seo" },
    update: { fields },
    create: { id: "site.seo", page: "site", label: "SEO del sitio", fields },
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
