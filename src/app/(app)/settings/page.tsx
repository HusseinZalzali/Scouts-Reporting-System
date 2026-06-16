import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard-shell";
import { Card, Field, Input, Badge } from "@/components/ui";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata = { title: "الإعدادات" };

export default async function SettingsPage() {
  const user = await requireUser();

  let groupName: string | null = null;
  if (user.scoutGroupId) {
    const g = await prisma.scoutGroup.findUnique({
      where: { id: user.scoutGroupId },
      select: { name: true },
    });
    groupName = g?.name ?? null;
  }

  return (
    <>
      <PageHeader title="الإعدادات" description="معلومات الحساب وتفضيلات العرض." />

      <div className="space-y-5">
        <Card className="space-y-4">
          <h3 className="font-semibold">معلومات الحساب</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="الاسم">
              <Input value={user.name ?? ""} disabled readOnly />
            </Field>
            <Field label="اسم المستخدم">
              <Input value={user.username} disabled readOnly />
            </Field>
            <Field label="الدور">
              <div className="pt-1">
                {user.role === "ADMIN" ? <Badge tone="green">مدير</Badge> : <Badge>فوج</Badge>}
              </div>
            </Field>
            {groupName && (
              <Field label="الفوج">
                <Input value={groupName} disabled readOnly />
              </Field>
            )}
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">المظهر</h3>
            <p className="mt-1 text-sm text-gray-500">التبديل بين الوضع الفاتح والداكن.</p>
          </div>
          <ThemeToggle />
        </Card>

        <Card>
          <h3 className="font-semibold">تغيير كلمة المرور</h3>
          <p className="mt-1 text-sm text-gray-500">
            لتغيير كلمة المرور، يرجى التواصل مع مدير النظام.
          </p>
        </Card>
      </div>
    </>
  );
}
