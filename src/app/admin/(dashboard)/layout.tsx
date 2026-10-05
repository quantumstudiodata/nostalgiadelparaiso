import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { canWritePosts, isManager } from "@/lib/permissions";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session!.user;
  // Registered readers have no panel; they just get emails and can comment.
  if (!canWritePosts(user.role)) redirect("/");

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-panel text-[15px]">
      <AdminSidebar name={user.name ?? "Usuaria"} role={user.role} avatarUrl={user.image} manager={isManager(user.role)} />
      <div className="flex-1 min-w-0">
        <div className="max-w-[1180px] mx-auto">{children}</div>
      </div>
    </div>
  );
}
