import { Card, Badge } from "@/components/ui";
import { formatArabicDate, toArabicDigits } from "@/lib/utils";
import { MapPin, Calendar, Users } from "lucide-react";

type Detail = {
  reportDate: Date;
  location: string;
  status: "DRAFT" | "SUBMITTED";
  attendanceBaraem: number;
  attendanceAshbal: number;
  attendanceKashafa: number;
  attendanceJawala: number;
  attendanceQada: number;
  programItems: { id: string; text: string }[];
  scoutGroup: { name: string };
  submittedBy?: { name: string } | null;
};

export function ReportDetail({ report }: { report: Detail }) {
  const total =
    report.attendanceBaraem +
    report.attendanceAshbal +
    report.attendanceKashafa +
    report.attendanceJawala +
    report.attendanceQada;

  const attendance = [
    { label: "براعم", value: report.attendanceBaraem },
    { label: "أشبال", value: report.attendanceAshbal },
    { label: "كشافة", value: report.attendanceKashafa },
    { label: "جوالة", value: report.attendanceJawala },
    { label: "قادة", value: report.attendanceQada },
  ];

  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">{report.scoutGroup.name}</h2>
          {report.status === "SUBMITTED" ? (
            <Badge tone="green">مُقدّم</Badge>
          ) : (
            <Badge tone="amber">مسودة</Badge>
          )}
        </div>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Calendar className="h-4 w-4 text-gray-400" />
            {formatArabicDate(report.reportDate)}
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <MapPin className="h-4 w-4 text-gray-400" />
            {report.location || "—"}
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 font-semibold">برنامج الاحياء</h3>
        {report.programItems.length ? (
          <ol className="list-inside list-decimal space-y-2 text-sm">
            {report.programItems.map((p) => (
              <li key={p.id}>{p.text}</li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-gray-500">لا توجد بنود.</p>
        )}
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold">
            <Users className="h-5 w-5 text-gray-400" />
            الحضور
          </h3>
          <span className="text-sm text-gray-500">
            الإجمالي: <span className="font-bold text-brand-600">{toArabicDigits(total)}</span>
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {attendance.map((a) => (
            <div
              key={a.label}
              className="rounded-xl border border-gray-200 p-3 text-center dark:border-gray-800"
            >
              <p className="text-sm text-gray-500">{a.label}</p>
              <p className="mt-1 text-xl font-bold">{toArabicDigits(a.value)}</p>
            </div>
          ))}
        </div>
      </Card>

      {report.submittedBy && (
        <p className="text-xs text-gray-400">قُدِّم بواسطة: {report.submittedBy.name}</p>
      )}
    </div>
  );
}
