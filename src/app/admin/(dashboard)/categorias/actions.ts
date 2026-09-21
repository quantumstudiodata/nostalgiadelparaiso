"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function updateCategoryContent(categoryId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado");

  await prisma.category.update({
    where: { id: categoryId },
    data: {
      cardTitle: String(formData.get("cardTitle") ?? ""),
      description: String(formData.get("description") ?? ""),
      imageUrl: String(formData.get("imageUrl") ?? ""),
    },
  });

  revalidatePath("/admin/categorias");
  revalidatePath("/");
  revalidatePath("/blog");
}
