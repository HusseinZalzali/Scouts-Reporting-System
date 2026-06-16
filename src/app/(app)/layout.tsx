import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Group name comes from the JWT — no DB round-trip on every navigation.
  return (
    <DashboardShell
      role={session.user.role}
      userName={session.user.name ?? session.user.username}
      groupName={session.user.scoutGroupName}
    >
      {children}
    </DashboardShell>
  );
}
