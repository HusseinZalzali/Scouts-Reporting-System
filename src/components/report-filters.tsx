"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, X, FileSpreadsheet, FileText } from "lucide-react";
import { Button, Card, Field, Input } from "@/components/ui";

export function ReportFilters({
  groups,
}: {
  groups: { id: string; name: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  const [from, setFrom] = useState(params.get("from") ?? "");
  const [to, setTo] = useState(params.get("to") ?? "");
  const [groupId, setGroupId] = useState(params.get("groupId") ?? "");
  const [location, setLocation] = useState(params.get("location") ?? "");
  const [q, setQ] = useState(params.get("q") ?? "");

  function buildQuery() {
    const sp = new URLSearchParams();
    if (from) sp.set("from", from);
    if (to) sp.set("to", to);
    if (groupId) sp.set("groupId", groupId);
    if (location) sp.set("location", location);
    if (q) sp.set("q", q);
    return sp.toString();
  }

  function apply(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/admin/reports?${buildQuery()}`);
  }

  function reset() {
    setFrom(""); setTo(""); setGroupId(""); setLocation(""); setQ("");
    router.push("/admin/reports");
  }

  const exportHref = (format: "excel" | "pdf") => {
    const sp = new URLSearchParams(buildQuery());
    sp.set("format", format);
    return `/api/export?${sp.toString()}`;
  };

  return (
    <Card className="mb-6">
      <form onSubmit={apply} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="من تاريخ" htmlFor="from">
            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="إلى تاريخ" htmlFor="to">
            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
          <Field label="الفوج" htmlFor="groupId">
            <select
              id="groupId"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="input-base"
            >
              <option value="">كل الأفواج</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </Field>
          <Field label="المكان" htmlFor="location">
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="بحث بالمكان" />
          </Field>
          <Field label="بحث عام" htmlFor="q">
            <Input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="فوج، مكان، أو بند برنامج" />
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit">
            <Search className="h-4 w-4" />
            تطبيق
          </Button>
          <Button type="button" variant="ghost" onClick={reset}>
            <X className="h-4 w-4" />
            إعادة تعيين
          </Button>
          <div className="flex-1" />
          <a href={exportHref("excel")}>
            <Button type="button" variant="secondary" size="sm">
              <FileSpreadsheet className="h-4 w-4" />
              تصدير Excel
            </Button>
          </a>
          <a href={exportHref("pdf")}>
            <Button type="button" variant="secondary" size="sm">
              <FileText className="h-4 w-4" />
              تصدير PDF
            </Button>
          </a>
        </div>
      </form>
    </Card>
  );
}
