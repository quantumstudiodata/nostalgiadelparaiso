import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isManager, requireWriterPage as requireWriter } from "@/lib/permissions";
import { getWriters, defaultWriterId } from "@/lib/writers";
import { PostForm } from "@/components/admin/post-form";
import { updatePost, deletePost } from "../actions";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireWriter();
  const manager = isManager(user.role);

  const [post, categories, writers] = await Promise.all([
    prisma.post.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    getWriters(),
  ]);

  // Authors only see their own posts.
  if (!post || (!manager && post.authorId !== user.id)) notFound();

  return (
    <PostForm
      post={post}
      categories={categories}
      writers={writers}
      defaultWriterId={defaultWriterId(writers, user.name)}
      action={updatePost.bind(null, post.id)}
      deleteAction={deletePost.bind(null, post.id)}
      heading={`Editando “${post.title}”`}
      submitLabel="Guardar cambios"
    />
  );
}
