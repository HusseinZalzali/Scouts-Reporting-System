import Link from "next/link";
import { PlusCircle, Users, CalendarCheck, Sprout, FileText } from "lucide-react";
import { requireGroup } from "@/lib/session";
import { getGroupReports, getReportForDate } from "@/lib/queries";
import { todayDateOnly, formatArabicDate, toArabicDigits } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard-shell";
import { StatCard } from "@/components/stat-card";
import { Button, Card, Badge, EmptyState } from "@/components/ui";
import { ReportTable } from "@/components/report-table";

export const metadata = { title: "الرئيسية" };

export default async function GroupDashboard() {
  const user = await requireGroup();
  const [reports, todayReport] = await Promise.all([
    getGroupReports(user.scoutGroupId),
    getReportForDate(user.scoutGroupId, todayDateOnly()),
  ]);

  const submitted = reports.filter((r) => r.status === "SUBMITTED");
  const totalAttendance = submitted.reduce(
    (sum, r) =>
      sum + r.attendanceBaraem + r.attendanceAshbal + r.attendanceKashafa + r.attendanceJawala,
    0
  );

  return (
    <>
      <PageHeader
        title={`أهلاً، ${user.name}`}
        description={formatArabicDate(new Date())}
        action={
          <Link href="/reports/new">
            <Button>
              <PlusCircle className="h-5 w-5" />
              تقرير اليوم
            </Button>
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="عدد التقارير" value={submitted.length} icon={<FileText className="h-6 w-6" />} />
        <StatCard label="إجمالي الحضور" value={totalAttendance} icon={<Users className="h-6 w-6" />} tone="blue" />
        <StatCard
          label="تقرير اليوم"
          value={todayReport?.status === "SUBMITTED" ? "مُقدّم" : todayReport ? "مسودة" : "غير مُقدّم"}
          icon={<CalendarCheck className="h-6 w-6" />}
          tone="amber"
        />
      </div>

      {/* Today status */}
      <Card className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold">تقرير اليوم</p>
              <p className="text-sm text-gray-500">
                {todayReport?.status === "SUBMITTED" ? (
                  <>تم تقديم تقرير اليوم <Badge tone="green">مُقدّم</Badge></>
                ) : todayReport ? (
                  <>لديك مسودة محفوظة <Badge tone="amber">مسودة</Badge></>
                ) : (
                  "لم تقم بتقديم تقرير اليوم بعد"
                )}
              </p>
            </div>
          </div>
          <Link href={todayReport ? `/reports/${todayReport.id}` : "/reports/new"}>
            <Button variant={todayReport?.status === "SUBMITTED" ? "secondary" : "primary"}>
              {todayReport?.status === "SUBMITTED"
                ? "عرض التقرير"
                : todayReport
                ? "متابعة المسودة"
                : "إنشاء تقرير اليوم"}
            </Button>
          </Link>
        </div>
      </Card>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">آخر التقارير</h2>
        <Link href="/reports" className="text-sm font-medium text-brand-600 hover:underline">
          عرض الكل ({toArabicDigits(reports.length)})
        </Link>
      </div>

      {reports.length ? (
        <ReportTable rows={reports.slice(0, 5)} />
      ) : (
        <EmptyState
          title="لا توجد تقارير بعد"
          description="ابدأ بإنشاء أول تقرير يومي لفوجك."
          icon={<FileText className="h-10 w-10" />}
          action={
            <Link href="/reports/new">
              <Button>إنشاء تقرير</Button>
            </Link>
          }
        />
      )}
    </>
  );
}
