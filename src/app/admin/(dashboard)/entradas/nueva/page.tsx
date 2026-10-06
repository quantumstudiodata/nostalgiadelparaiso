import { prisma } from "@/lib/prisma";
import { requireWriterPage as requireWriter } from "@/lib/permissions";
import { getWriters, defaultWriterId } from "@/lib/writers";
import { PostForm } from "@/components/admin/post-form";
import { createPost } from "../actions";

export default async function NewPostPage() {
  const user = await requireWriter();
  const [categories, writers] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    getWriters(),
  ]);

  return (
    <PostForm
      categories={categories}
      writers={writers}
      defaultWriterId={defaultWriterId(writers, user.name)}
      action={createPost}
      heading="Nueva entrada"
      submitLabel="Guardar entrada"
    />
  );
}
