import { Sidebar, type NavRole } from "@/components/sidebar";

export function DashboardShell({
  role,
  userName,
  groupName,
  children,
}: {
  role: NavRole;
  userName: string;
  groupName?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar role={role} userName={userName} groupName={groupName} />
      <main className="flex-1 animate-fade-in p-4 md:p-8">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {action && <div className="no-print">{action}</div>}
    </div>
  );
}
