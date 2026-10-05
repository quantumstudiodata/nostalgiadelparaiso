import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostForm } from "@/components/admin/post-form";
import { updatePost, deletePost } from "../actions";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [post, categories] = await Promise.all([
    prisma.post.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!post) notFound();

  return (
    <PostForm
      post={post}
      categories={categories}
      action={updatePost.bind(null, post.id)}
      deleteAction={deletePost.bind(null, post.id)}
      heading={`Editando “${post.title}”`}
      submitLabel="Guardar cambios"
    />
  );
}
