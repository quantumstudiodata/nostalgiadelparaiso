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

  const boundUpdate = updatePost.bind(null, post.id);
  const boundDelete = deletePost.bind(null, post.id);

  return (
    <div className="flex flex-col h-screen">
      <div className="h-[72px] shrink-0 border-b border-neutral-200 flex items-center justify-between px-8">
        <div>
          <h1 className="font-serif text-[20px]">Editar entrada</h1>
          <div className="text-xs text-neutral-500 mt-0.5">
            Última edición{" "}
            {post.updatedAt.toLocaleDateString("es-MX", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
        <form action={boundDelete}>
          <button className="text-sm text-red-600 px-4 py-2 border border-red-200 rounded-lg hover:bg-red-50">
            Eliminar entrada
          </button>
        </form>
      </div>
      <PostForm
        post={post}
        categories={categories}
        action={boundUpdate}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
