import { requireAdmin } from "@/lib/auth/admin";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // requireAdmin() throws a redirect to /admin/login when no session exists.
  const session = await requireAdmin();
  return <AdminShell email={session.email}>{children}</AdminShell>;
}
