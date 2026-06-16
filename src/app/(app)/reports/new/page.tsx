import { redirect } from "next/navigation";
import { requireGroup } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getReportForDate } from "@/lib/queries";
import { todayDateOnly, toInputDate } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard-shell";
import { ReportForm } from "@/components/report-form";
import { Alert } from "@/components/ui";

export const metadata = { title: "تقرير جديد" };

export default async function NewReportPage() {
  const user = await requireGroup();
  const today = todayDateOnly();

  const existing = await getReportForDate(user.scoutGroupId, today);

  // Prevent duplicate: if a SUBMITTED report already exists for today, send to it.
  if (existing?.status === "SUBMITTED") {
    redirect(`/reports/${existing.id}`);
  }

  const group = await prisma.scoutGroup.findUnique({
    where: { id: user.scoutGroupId },
    select: { name: true },
  });

  const initial = existing
    ? {
        id: existing.id,
        reportDate: toInputDate(existing.reportDate),
        location: existing.location,
        programItems: existing.programItems.map((p) => p.text),
        attendanceBaraem: existing.attendanceBaraem,
        attendanceAshbal: existing.attendanceAshbal,
        attendanceKashafa: existing.attendanceKashafa,
        attendanceJawala: existing.attendanceJawala,
        attendanceQada: existing.attendanceQada,
      }
    : undefined;

  return (
    <>
      <PageHeader
        title="تقرير يومي جديد"
        description="املأ بيانات نشاط الفوج لهذا اليوم."
      />
      {existing && (
        <div className="mb-4">
          <Alert tone="info">لديك مسودة محفوظة لهذا اليوم — يمكنك متابعتها وتقديمها.</Alert>
        </div>
      )}
      <ReportForm
        groupName={group?.name ?? "فوج"}
        todayStr={toInputDate(today)}
        initial={initial}
      />
    </>
  );
}
