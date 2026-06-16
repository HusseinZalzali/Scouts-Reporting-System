import { notFound } from "next/navigation";
import Link from "next/link";
import { Printer } from "lucide-react";
import { requireAdmin } from "@/lib/session";
import { getReportById } from "@/lib/queries";
import { PageHeader } from "@/components/dashboard-shell";
import { ReportDetail } from "@/components/report-detail";
import { Button } from "@/components/ui";

export const metadata = { title: "تفاصيل التقرير" };

export default async function AdminReportViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const report = await getReportById(id);
  if (!report) notFound();

  return (
    <>
      <PageHeader
        title="تفاصيل التقرير"
        action={
          <Link href={`/print/reports/${report.id}`} target="_blank">
            <Button variant="secondary" size="sm">
              <Printer className="h-4 w-4" />
              طباعة
            </Button>
          </Link>
        }
      />
      <ReportDetail report={report} />
    </>
  );
}
