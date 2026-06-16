import Link from "next/link";
import { Users, FileText, Tent, TrendingUp, BarChart3 } from "lucide-react";
import { requireAdmin } from "@/lib/session";
import { getAdminDashboard } from "@/lib/queries";
import { todayDateOnly, toInputDate, formatArabicDate } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard-shell";
import { StatCard } from "@/components/stat-card";
import { Card, Button } from "@/components/ui";
import { AttendanceOverTimeChart } from "@/components/charts";
import { ReportTable } from "@/components/report-table";

export const metadata = { title: "لوحة المدير" };

function monthRange() {
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return { from: toInputDate(from), to: toInputDate(todayDateOnly()) };
}

export default async function AdminDashboard() {
  await requireAdmin();

  const todayStr = toInputDate(todayDateOnly());
  const { from, to } = monthRange();

  const { groupCount, reportCount, todayTotal, monthTotal, series, latest } =
    await getAdminDashboard({ todayStr, monthFrom: from, monthTo: to });

  return (
    <>
      <PageHeader
        title="لوحة المدير"
        description={formatArabicDate(new Date())}
        action={
          <Link href="/admin/analytics">
            <Button variant="secondary">
              <BarChart3 className="h-5 w-5" />
              التحليلات
            </Button>
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="عدد الأفواج" value={groupCount} icon={<Tent className="h-6 w-6" />} />
        <StatCard label="إجمالي التقارير" value={reportCount} icon={<FileText className="h-6 w-6" />} tone="blue" />
        <StatCard label="حضور اليوم" value={todayTotal} icon={<Users className="h-6 w-6" />} tone="amber" />
        <StatCard label="حضور هذا الشهر" value={monthTotal} icon={<TrendingUp className="h-6 w-6" />} tone="violet" />
      </div>

      <Card className="mb-6">
        <h2 className="mb-4 text-lg font-bold">الحضور خلال هذا الشهر</h2>
        <AttendanceOverTimeChart data={series} />
      </Card>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">أحدث التقارير</h2>
        <Link href="/admin/reports" className="text-sm font-medium text-brand-600 hover:underline">
          عرض الكل
        </Link>
      </div>
      <ReportTable rows={latest.slice(0, 8)} showGroup hrefBase="/admin/reports" />
    </>
  );
}
