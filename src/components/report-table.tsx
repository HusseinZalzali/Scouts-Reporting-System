import Link from "next/link";
import { Badge, EmptyState } from "@/components/ui";
import { toInputDate, toArabicDigits } from "@/lib/utils";
import { FileText } from "lucide-react";

type Row = {
  id: string;
  reportDate: Date;
  location: string;
  status: "DRAFT" | "SUBMITTED";
  attendanceBaraem: number;
  attendanceAshbal: number;
  attendanceKashafa: number;
  attendanceJawala: number;
  attendanceQada: number;
  scoutGroup?: { name: string };
  hrefBase?: string;
};

export function ReportTable({
  rows,
  showGroup = false,
  hrefBase = "/reports",
}: {
  rows: Row[];
  showGroup?: boolean;
  hrefBase?: string;
}) {
  if (!rows.length) {
    return (
      <EmptyState
        title="لا توجد تقارير"
        description="لم يتم العثور على أي تقارير مطابقة."
        icon={<FileText className="h-10 w-10" />}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
      <table className="w-full text-right text-sm">
        <thead className="bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-300">
          <tr>
            {showGroup && <th className="px-4 py-3 font-semibold">الفوج</th>}
            <th className="px-4 py-3 font-semibold">التاريخ</th>
            <th className="px-4 py-3 font-semibold">المكان</th>
            <th className="px-4 py-3 font-semibold">الإجمالي</th>
            <th className="px-4 py-3 font-semibold">الحالة</th>
            <th className="px-4 py-3 font-semibold">إجراء</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {rows.map((r) => {
            const total =
              r.attendanceBaraem + r.attendanceAshbal + r.attendanceKashafa + r.attendanceJawala + r.attendanceQada;
            return (
              <tr key={r.id} className="bg-white hover:bg-gray-50 dark:bg-gray-950 dark:hover:bg-gray-900">
                {showGroup && <td className="px-4 py-3 font-medium">{r.scoutGroup?.name}</td>}
                <td className="px-4 py-3 tabular-nums">{toInputDate(r.reportDate)}</td>
                <td className="px-4 py-3">{r.location || "—"}</td>
                <td className="px-4 py-3 font-semibold tabular-nums">{toArabicDigits(total)}</td>
                <td className="px-4 py-3">
                  {r.status === "SUBMITTED" ? (
                    <Badge tone="green">مُقدّم</Badge>
                  ) : (
                    <Badge tone="amber">مسودة</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`${hrefBase}/${r.id}`}
                    className="font-medium text-brand-600 hover:underline dark:text-brand-400"
                  >
                    عرض
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
