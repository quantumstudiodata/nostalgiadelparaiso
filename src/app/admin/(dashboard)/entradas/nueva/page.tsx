import { prisma } from "@/lib/prisma";
import { isManager, requireWriter } from "@/lib/permissions";
import { getWriters } from "@/lib/writers";
import { PostForm } from "@/components/admin/post-form";
import { createPost } from "../actions";

export default async function NewPostPage() {
  const user = await requireWriter();
  const [categories, authors] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    isManager(user.role) ? getWriters() : Promise.resolve(undefined),
  ]);

  return (
    <PostForm
      categories={categories}
      authors={authors}
      currentUserId={user.id}
      action={createPost}
      heading="Nueva entrada"
      submitLabel="Guardar entrada"
    />
  );
}
