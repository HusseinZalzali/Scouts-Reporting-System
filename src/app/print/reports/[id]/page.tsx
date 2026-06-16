import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getReportById } from "@/lib/queries";
import { ReportDetail } from "@/components/report-detail";
import { PrintTrigger } from "@/components/print-trigger";

export const metadata = { title: "طباعة التقرير" };

export default async function PrintReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const report = await getReportById(id);
  if (!report) notFound();

  if (user.role === "GROUP" && report.scoutGroupId !== user.scoutGroupId) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <PrintTrigger />
      <h1 className="mb-6 text-center text-2xl font-bold">التقرير اليومي الكشفي</h1>
      <ReportDetail report={report} />
    </div>
  );
}
