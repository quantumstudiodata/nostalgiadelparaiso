import { prisma } from "@/lib/prisma";
import { PostForm } from "@/components/admin/post-form";
import { createPost } from "../actions";

export default async function NewPostPage() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });

  return <PostForm categories={categories} action={createPost} heading="Nueva entrada" submitLabel="Guardar entrada" />;
}
