import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canWritePosts, isManager } from "@/lib/permissions";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session!.user;
  const manager = isManager(user.role);
  const unread = manager ? await prisma.notification.count({ where: { read: false } }) : 0;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-panel text-[15px]">
      <AdminSidebar
        name={user.name ?? "Usuaria"}
        role={user.role}
        avatarUrl={user.image}
        manager={manager}
        writer={canWritePosts(user.role)}
        unread={unread}
      />
      <div className="flex-1 min-w-0">
        <div className="max-w-[1180px] mx-auto">{children}</div>
      </div>
    </div>
  );
}
