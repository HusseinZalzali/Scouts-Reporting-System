import { requireAdmin } from "@/lib/session";
import {
  getAttendanceOverTime,
  getAttendanceByGroup,
  getAttendanceTotals,
  getScoutGroups,
} from "@/lib/queries";
import { reportFilterSchema } from "@/lib/validations";
import { PageHeader } from "@/components/dashboard-shell";
import { Card } from "@/components/ui";
import { StatCard } from "@/components/stat-card";
import { AttendanceOverTimeChart, AttendanceByGroupChart } from "@/components/charts";
import { AnalyticsFilters } from "@/components/analytics-filters";

export const metadata = { title: "التحليلات" };

export default async function AnalyticsPage({
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
  });

  const [groups, series, byGroup, totals] = await Promise.all([
    getScoutGroups(),
    getAttendanceOverTime(filters),
    getAttendanceByGroup(filters),
    getAttendanceTotals(filters),
  ]);

  return (
    <>
      <PageHeader title="التحليلات" description="تحليل الحضور عبر الزمن وحسب كل فوج." />

      <AnalyticsFilters groups={groups} />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="براعم" value={totals.baraem} />
        <StatCard label="أشبال" value={totals.ashbal} tone="blue" />
        <StatCard label="كشافة" value={totals.kashafa} tone="amber" />
        <StatCard label="جوالة" value={totals.jawala} tone="violet" />
        <StatCard label="قادة" value={totals.qada} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-bold">الحضور عبر الزمن</h2>
          <AttendanceOverTimeChart data={series} />
        </Card>
        <Card>
          <h2 className="mb-4 text-lg font-bold">الحضور حسب الفوج</h2>
          <AttendanceByGroupChart data={byGroup} />
        </Card>
      </div>
    </>
  );
}
