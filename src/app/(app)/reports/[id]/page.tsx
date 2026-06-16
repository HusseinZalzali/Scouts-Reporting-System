import { notFound } from "next/navigation";
import Link from "next/link";
import { Pencil, Printer, Trash2 } from "lucide-react";
import { requireGroup } from "@/lib/session";
import { getReportById } from "@/lib/queries";
import { deleteReportAction } from "@/app/actions/reports";
import { todayDateOnly, toInputDate } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard-shell";
import { ReportDetail } from "@/components/report-detail";
import { ReportForm } from "@/components/report-form";
import { Alert, Button } from "@/components/ui";

export const metadata = { title: "تفاصيل التقرير" };

export default async function ReportViewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string; saved?: string }>;
}) {
  const user = await requireGroup();
  const { id } = await params;
  const { edit, saved } = await searchParams;

  const report = await getReportById(id);
  if (!report || report.scoutGroupId !== user.scoutGroupId) notFound();

  const isToday = toInputDate(report.reportDate) === toInputDate(todayDateOnly());
  // Editing allowed only for today's report (group rule).
  const canEdit = isToday;
  const editing = edit === "1" && canEdit;

  if (editing) {
    return (
      <>
        <PageHeader title="تعديل تقرير اليوم" description="قم بتحديث بيانات التقرير ثم احفظ." />
        <ReportForm
          groupName={report.scoutGroup.name}
          todayStr={toInputDate(todayDateOnly())}
          initial={{
            id: report.id,
            reportDate: toInputDate(report.reportDate),
            location: report.location,
            programItems: report.programItems.map((p) => p.text),
            attendanceBaraem: report.attendanceBaraem,
            attendanceAshbal: report.attendanceAshbal,
            attendanceKashafa: report.attendanceKashafa,
            attendanceJawala: report.attendanceJawala,
            attendanceQada: report.attendanceQada,
          }}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="تفاصيل التقرير"
        action={
          <div className="flex gap-2">
            {canEdit && (
              <Link href={`/reports/${report.id}?edit=1`}>
                <Button variant="secondary" size="sm">
                  <Pencil className="h-4 w-4" />
                  تعديل
                </Button>
              </Link>
            )}
            <Link href={`/print/reports/${report.id}`} target="_blank">
              <Button variant="secondary" size="sm">
                <Printer className="h-4 w-4" />
                طباعة
              </Button>
            </Link>
            {canEdit && (
              <form action={deleteReportAction}>
                <input type="hidden" name="id" value={report.id} />
                <Button variant="danger" size="sm" type="submit">
                  <Trash2 className="h-4 w-4" />
                  حذف
                </Button>
              </form>
            )}
          </div>
        }
      />

      {saved === "1" && (
        <div className="mb-4">
          <Alert tone="success">تم حفظ التقرير بنجاح.</Alert>
        </div>
      )}

      <ReportDetail report={report} />
    </>
  );
}
