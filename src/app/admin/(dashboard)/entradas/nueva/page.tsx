import { prisma } from "@/lib/prisma";
import { PostForm } from "@/components/admin/post-form";
import { createPost } from "../actions";

export default async function NewPostPage() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="flex flex-col h-screen">
      <div className="h-[72px] shrink-0 border-b border-neutral-200 flex items-center px-8">
        <h1 className="font-serif text-[20px]">Nueva entrada</h1>
      </div>
      <PostForm categories={categories} action={createPost} submitLabel="Publicar entrada" />
    </div>
  );
}
