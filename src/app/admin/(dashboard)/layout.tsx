import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session!.user;

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar
        name={user.name ?? "Usuario"}
        role={user.role}
        avatarUrl={user.image}
      />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
