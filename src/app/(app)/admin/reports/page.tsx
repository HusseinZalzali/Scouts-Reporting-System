import { requireAdmin } from "@/lib/session";
import { getReports, getScoutGroups, getAttendanceTotals } from "@/lib/queries";
import { reportFilterSchema } from "@/lib/validations";
import { PageHeader } from "@/components/dashboard-shell";
import { ReportFilters } from "@/components/report-filters";
import { ReportTable } from "@/components/report-table";
import { StatCard } from "@/components/stat-card";
import { Users } from "lucide-react";

export const metadata = { title: "كل التقارير" };

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const raw = await searchParams;
  const filters = reportFilterSchema.parse({
    from: typeof raw.from === "string" ? raw.from : undefined,
    to: typeof raw.to === "string" ? raw.to : undefined,
    groupId: typeof raw.groupId === "string" ? raw.groupId : undefined,
    location: typeof raw.location === "string" ? raw.location : undefined,
    q: typeof raw.q === "string" ? raw.q : undefined,
  });

  const [groups, reports, totals] = await Promise.all([
    getScoutGroups(),
    getReports(filters),
    getAttendanceTotals(filters),
  ]);

  return (
    <>
      <PageHeader
        title="كل التقارير"
        description="تصفية، بحث، وتصدير تقارير جميع الأفواج."
      />

      <ReportFilters groups={groups} />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="عدد التقارير" value={totals.reportCount} icon={<Users className="h-5 w-5" />} />
        <StatCard label="براعم" value={totals.baraem} />
        <StatCard label="أشبال" value={totals.ashbal} />
        <StatCard label="كشافة" value={totals.kashafa} />
        <StatCard label="جوالة" value={totals.jawala} />
        <StatCard label="قادة" value={totals.qada} />
        <StatCard label="إجمالي الحضور" value={totals.total} tone="blue" />
      </div>

      <ReportTable rows={reports} showGroup hrefBase="/admin/reports" />
    </>
  );
}
