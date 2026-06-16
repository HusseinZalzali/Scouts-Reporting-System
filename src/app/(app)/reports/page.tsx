import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { requireGroup } from "@/lib/session";
import { getGroupReports } from "@/lib/queries";
import { PageHeader } from "@/components/dashboard-shell";
import { ReportTable } from "@/components/report-table";
import { Button, Alert } from "@/components/ui";

export const metadata = { title: "تقاريري" };

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const user = await requireGroup();
  const { submitted } = await searchParams;
  const reports = await getGroupReports(user.scoutGroupId);

  return (
    <>
      <PageHeader
        title="تقاريري"
        description="جميع التقارير اليومية التي قمت بتقديمها."
        action={
          <Link href="/reports/new">
            <Button>
              <PlusCircle className="h-5 w-5" />
              تقرير جديد
            </Button>
          </Link>
        }
      />
      {submitted === "1" && (
        <div className="mb-4">
          <Alert tone="success">تم تقديم التقرير بنجاح.</Alert>
        </div>
      )}
      <ReportTable rows={reports} />
    </>
  );
}
