import { prisma } from "@/lib/prisma";
import { requireManagerPage } from "@/lib/permissions";
import { WritersManager } from "@/components/admin/writers-manager";

export const dynamic = "force-dynamic";

export default async function WritersPage() {
  await requireManagerPage();
  const writers = await prisma.writer.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  return (
    <div className="px-5 md:px-10 py-9">
      <h1 className="font-bold text-[28px]">Escritores</h1>
      <p className="mt-1 text-[15px] text-neutral-600">Agrega y administra los escritores del blog y edita sus perfiles públicos.</p>
      <WritersManager
        writers={writers.map((w) => ({
          id: w.id,
          name: w.name,
          bio: w.bio,
          avatarUrl: w.avatarUrl,
          coverUrl: w.coverUrl,
          postCount: w._count.posts,
        }))}
      />
    </div>
  );
}
