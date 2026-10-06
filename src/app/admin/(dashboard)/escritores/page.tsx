import { prisma } from "@/lib/prisma";
import { requireManagerPage } from "@/lib/permissions";
import { WritersManager, type WriterRow } from "@/components/admin/writers-manager";

export const dynamic = "force-dynamic";

export default async function WritersPage() {
  const viewer = await requireManagerPage();
  const users = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "EDITOR", "AUTHOR"] } },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { posts: true } } },
  });
  const writers: WriterRow[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    role: u.role as WriterRow["role"],
    bio: u.bio,
    avatarUrl: u.avatarUrl,
    coverUrl: u.coverUrl,
    websiteUrl: u.websiteUrl,
    postCount: u._count.posts,
  }));

  return (
    <div className="px-5 md:px-10 py-9">
      <h1 className="font-bold text-[28px]">Escritores</h1>
      <p className="mt-1 text-[15px] text-neutral-600">Agrega y administra los escritores del blog y edita sus perfiles públicos.</p>
      <WritersManager writers={writers} currentUserId={viewer.id} currentUserIsAdmin={viewer.role === "ADMIN"} />
    </div>
  );
}
