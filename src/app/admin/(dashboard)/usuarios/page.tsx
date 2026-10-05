import { prisma } from "@/lib/prisma";
import { requireManagerPage } from "@/lib/permissions";
import { UsersManager } from "@/components/admin/users-manager";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const me = await requireManagerPage();
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: { id: true, name: true, email: true, role: true, bio: true, avatarUrl: true, createdAt: true, _count: { select: { posts: true } } },
  });

  return (
    <div className="px-5 md:px-10 py-9">
      <h1 className="font-bold text-[28px]">Usuarios</h1>
      <p className="mt-1 text-[15px] text-neutral-600 max-w-[640px]">
        Las personas que se registran en el sitio entran como <strong>Lectoras</strong>: reciben un correo con cada entrada nueva y pueden comentar.
        Cámbialas a <strong>Autora</strong> para que puedan subir sus propias entradas (sin editar la página). También puedes registrar a alguien tú misma.
      </p>
      <UsersManager
        users={users.map((u) => ({ ...u, postCount: u._count.posts, createdAt: u.createdAt.toISOString() }))}
        currentUserId={me.id}
        currentUserIsAdmin={me.role === "ADMIN"}
      />
    </div>
  );
}
