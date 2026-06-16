"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button, Card, Field } from "@/components/ui";
import { DateField } from "@/components/date-field";

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

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const handle = setTimeout(() => {
      const sp = new URLSearchParams();
      if (from) sp.set("from", from);
      if (to) sp.set("to", to);
      if (groupId) sp.set("groupId", groupId);
      const qs = sp.toString();
      router.push(qs ? `/admin/analytics?${qs}` : "/admin/analytics");
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, groupId]);

  function reset() {
    setFrom(""); setTo(""); setGroupId("");
  }

  return (
    <Card className="mb-6">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="من تاريخ">
            <DateField name="from" value={from} onChange={setFrom} />
          </Field>
          <Field label="إلى تاريخ">
            <DateField name="to" value={to} onChange={setTo} />
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
          <Button type="button" variant="ghost" onClick={reset}>
            <X className="h-4 w-4" />
            إعادة تعيين
          </Button>
        </div>
      </div>
    </Card>
  );
}
