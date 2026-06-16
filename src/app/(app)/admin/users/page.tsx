import { requireAdmin } from "@/lib/session";
import { getAllUsers } from "@/lib/queries";
import { PageHeader } from "@/components/dashboard-shell";
import { UserManager } from "@/components/user-manager";

export const metadata = { title: "إدارة المستخدمين" };

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await getAllUsers();

  return (
    <>
      <PageHeader
        title="إدارة المستخدمين"
        description="تعديل الأسماء وأسماء المستخدمين، تغيير كلمات المرور، وإعادة تسمية الأفواج."
      />
      <UserManager
        users={users.map((u) => ({
          id: u.id,
          name: u.name,
          username: u.username,
          role: u.role,
          scoutGroup: u.scoutGroup ? { id: u.scoutGroup.id, name: u.scoutGroup.name } : null,
        }))}
      />
    </>
  );
}
