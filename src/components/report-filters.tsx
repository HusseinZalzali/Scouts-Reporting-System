"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { X, FileSpreadsheet, FileText } from "lucide-react";
import { Button, Card, Field, Input } from "@/components/ui";
import { DateField } from "@/components/date-field";

export function ReportFilters({
  groups,
  initial,
}: {
  groups: { id: string; name: string }[];
  /** Effective default values (e.g. today) reflected in the date inputs. */
  initial?: { from?: string; to?: string };
}) {
  const router = useRouter();
  const params = useSearchParams();

  const [from, setFrom] = useState(params.get("from") ?? initial?.from ?? "");
  const [to, setTo] = useState(params.get("to") ?? initial?.to ?? "");
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

  // Apply filters on change (debounced so typing in text fields doesn't
  // navigate on every keystroke). No "apply" button needed.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const handle = setTimeout(() => {
      const qs = buildQuery();
      router.push(qs ? `/admin/reports?${qs}` : "/admin/reports");
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, groupId, location, q]);

  function reset() {
    setFrom(""); setTo(""); setGroupId(""); setLocation(""); setQ("");
  }

  const exportHref = (format: "excel" | "pdf") => {
    const sp = new URLSearchParams(buildQuery());
    sp.set("format", format);
    return `/api/export?${sp.toString()}`;
  };

  return (
    <Card className="mb-6">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="من تاريخ">
            <DateField name="from" value={from} onChange={setFrom} />
          </Field>
          <Field label="إلى تاريخ">
            <DateField name="to" value={to} onChange={setTo} />
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
      </div>
    </Card>
  );
}
