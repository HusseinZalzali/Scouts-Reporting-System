import Link from "next/link";
import { Badge, EmptyState } from "@/components/ui";
import { toInputDate, toArabicDigits } from "@/lib/utils";
import { FileText, ChevronLeft, MapPin, Users } from "lucide-react";

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

function rowTotal(r: Row) {
  return (
    r.attendanceBaraem +
    r.attendanceAshbal +
    r.attendanceKashafa +
    r.attendanceJawala +
    r.attendanceQada
  );
}

function StatusBadge({ status }: { status: Row["status"] }) {
  return status === "SUBMITTED" ? (
    <Badge tone="green">مُقدّم</Badge>
  ) : (
    <Badge tone="amber">مسودة</Badge>
  );
}

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
    <>
      {/* Mobile: stacked cards (whole card is tappable) */}
      <div className="space-y-3 md:hidden">
        {rows.map((r) => (
          <Link
            key={r.id}
            href={`${hrefBase}/${r.id}`}
            className="block rounded-2xl border border-gray-200 bg-white p-4 transition active:scale-[0.99] dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                {showGroup && (
                  <p className="truncate font-semibold">{r.scoutGroup?.name}</p>
                )}
                <p className="text-sm tabular-nums text-gray-600 dark:text-gray-300">
                  {toInputDate(r.reportDate)}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </div>

            <div className="mt-3 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <span className="flex min-w-0 items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="truncate">{r.location || "—"}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1.5">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="font-semibold tabular-nums">{toArabicDigits(rowTotal(r))}</span>
              </span>
            </div>

            <div className="mt-3 flex items-center justify-end text-sm font-medium text-brand-600 dark:text-brand-400">
              عرض التفاصيل
              <ChevronLeft className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 md:block dark:border-gray-800">
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
            {rows.map((r) => (
              <tr key={r.id} className="bg-white hover:bg-gray-50 dark:bg-gray-950 dark:hover:bg-gray-900">
                {showGroup && <td className="px-4 py-3 font-medium">{r.scoutGroup?.name}</td>}
                <td className="px-4 py-3 tabular-nums">{toInputDate(r.reportDate)}</td>
                <td className="max-w-[220px] truncate px-4 py-3">{r.location || "—"}</td>
                <td className="px-4 py-3 font-semibold tabular-nums">{toArabicDigits(rowTotal(r))}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3">
                  <Link
                    href={`${hrefBase}/${r.id}`}
                    className="font-medium text-brand-600 hover:underline dark:text-brand-400"
                  >
                    عرض
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
