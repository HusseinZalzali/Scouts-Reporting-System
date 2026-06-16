import { requireAdmin } from "@/lib/session";
import { getAllUsers } from "@/lib/queries";
import { PageHeader } from "@/components/dashboard-shell";
import { UserManager } from "@/components/user-manager";
import { CreateGroup } from "@/components/create-group";

export const metadata = { title: "إدارة المستخدمين" };

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await getAllUsers();

  return (
    <>
      <PageHeader
        title="إدارة المستخدمين"
        description="إضافة أفواج جديدة، تعديل الأسماء وأسماء المستخدمين، تغيير كلمات المرور، وإعادة تسمية الأفواج."
      />
      <CreateGroup />
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
