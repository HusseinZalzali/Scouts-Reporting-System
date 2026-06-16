"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { EmptyState } from "@/components/ui";
import { BarChart3 } from "lucide-react";

const BRAND = "#26732d";

export function AttendanceOverTimeChart({
  data,
}: {
  data: { date: string; total: number }[];
}) {
  if (!data.length) {
    return <EmptyState title="لا توجد بيانات" description="لا توجد تقارير في النطاق المحدد" icon={<BarChart3 className="h-10 w-10" />} />;
  }
  return (
    <div className="min-w-0">
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} reversed />
        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} orientation="right" />
        <Tooltip
          contentStyle={{ direction: "rtl", borderRadius: 12, fontSize: 13 }}
          labelFormatter={(l) => `التاريخ: ${l}`}
          formatter={(v) => [`${v}`, "إجمالي الحضور"]}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke={BRAND}
          strokeWidth={2.5}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
    </div>
  );
}

export function AttendanceByGroupChart({
  data,
}: {
  data: { group: string; total: number }[];
}) {
  if (!data.length) {
    return <EmptyState title="لا توجد بيانات" description="لا توجد تقارير في النطاق المحدد" icon={<BarChart3 className="h-10 w-10" />} />;
  }
  return (
    <div className="min-w-0">
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
        <XAxis dataKey="group" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} orientation="right" />
        <Tooltip
          contentStyle={{ direction: "rtl", borderRadius: 12, fontSize: 13 }}
          formatter={(v) => [`${v}`, "إجمالي الحضور"]}
        />
        <Legend />
        <Bar dataKey="total" name="إجمالي الحضور" fill={BRAND} radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
}
