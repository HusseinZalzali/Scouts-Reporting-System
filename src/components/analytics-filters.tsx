"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { Button, Card, Field, Input } from "@/components/ui";

export function AnalyticsFilters({
  groups,
}: {
  groups: { id: string; name: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [from, setFrom] = useState(params.get("from") ?? "");
  const [to, setTo] = useState(params.get("to") ?? "");
  const [groupId, setGroupId] = useState(params.get("groupId") ?? "");

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const sp = new URLSearchParams();
    if (from) sp.set("from", from);
    if (to) sp.set("to", to);
    if (groupId) sp.set("groupId", groupId);
    router.push(`/admin/analytics?${sp.toString()}`);
  }

  function reset() {
    setFrom(""); setTo(""); setGroupId("");
    router.push("/admin/analytics");
  }

  return (
    <Card className="mb-6">
      <form onSubmit={apply} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="من تاريخ" htmlFor="from">
            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="إلى تاريخ" htmlFor="to">
            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
          <Field label="الفوج" htmlFor="groupId">
            <select id="groupId" value={groupId} onChange={(e) => setGroupId(e.target.value)} className="input-base">
              <option value="">كل الأفواج</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="flex gap-2">
          <Button type="submit">
            <Search className="h-4 w-4" />
            تطبيق
          </Button>
          <Button type="button" variant="ghost" onClick={reset}>
            <X className="h-4 w-4" />
            إعادة تعيين
          </Button>
        </div>
      </form>
    </Card>
  );
}
