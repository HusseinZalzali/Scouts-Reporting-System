"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Plus, Trash2, Save, Check, Loader2 } from "lucide-react";
import {
  submitReportAction,
  saveDraftAction,
  type ReportFormState,
} from "@/app/actions/reports";
import { Alert, Button, Card, Field, Input } from "@/components/ui";

export type ReportFormValues = {
  id?: string;
  reportDate: string;
  location: string;
  programItems: string[];
  attendanceBaraem: number;
  attendanceAshbal: number;
  attendanceKashafa: number;
  attendanceJawala: number;
  attendanceQada: number;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      <Check className="h-5 w-5" />
      تقديم التقرير
    </Button>
  );
}

/**
 * Attendance count input tuned for mobile: shows an empty box (with a 0
 * placeholder) instead of a literal "0", and selects existing text on focus
 * so you can type the number directly without first deleting the zero.
 */
function CountField({
  label,
  name,
  value,
  onChange,
  error,
}: {
  label: string;
  name: string;
  value: number;
  onChange: (n: number) => void;
  error?: string;
}) {
  return (
    <Field label={label} htmlFor={name} error={error}>
      <Input
        id={name}
        name={name}
        type="number"
        inputMode="numeric"
        min={0}
        placeholder="0"
        value={value === 0 ? "" : value}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? 0 : Math.max(0, Number(v) || 0));
        }}
      />
    </Field>
  );
}

export function ReportForm({
  groupName,
  initial,
  todayStr,
  locked = false,
}: {
  groupName: string;
  initial?: Partial<ReportFormValues>;
  todayStr: string;
  /** When true, the report is already submitted — read-only-ish guard handled server side. */
  locked?: boolean;
}) {
  const [state, formAction] = useActionState<ReportFormState, FormData>(
    submitReportAction,
    {}
  );

  const [reportDate, setReportDate] = useState(initial?.reportDate ?? todayStr);
  const [location, setLocation] = useState(initial?.location ?? "");
  const [items, setItems] = useState<string[]>(
    initial?.programItems?.length ? initial.programItems : ["", "", "", ""]
  );
  const [baraem, setBaraem] = useState(initial?.attendanceBaraem ?? 0);
  const [ashbal, setAshbal] = useState(initial?.attendanceAshbal ?? 0);
  const [kashafa, setKashafa] = useState(initial?.attendanceKashafa ?? 0);
  const [jawala, setJawala] = useState(initial?.attendanceJawala ?? 0);
  const [qada, setQada] = useState(initial?.attendanceQada ?? 0);

  const [draftState, setDraftState] = useState<"idle" | "saving" | "saved">("idle");
  const [, startTransition] = useTransition();
  const firstRender = useRef(true);
  // Once the user submits, stop auto-saving drafts so a late draft write can't
  // race the submit and flip the report back to مسودة.
  const submitting = useRef(false);
  const total = baraem + ashbal + kashafa + jawala + qada;

  // Arabic weekday name for the selected date (e.g. "الأحد").
  const weekday = reportDate
    ? new Intl.DateTimeFormat("ar-EG", { weekday: "long", timeZone: "UTC" }).format(
        new Date(`${reportDate}T00:00:00Z`)
      )
    : "";

  // ---- Auto-save draft (debounced) ----
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (locked || submitting.current) return;

    const handle = setTimeout(() => {
      const fd = new FormData();
      fd.set("reportDate", reportDate);
      fd.set("location", location);
      items.forEach((i) => fd.append("programItems", i));
      fd.set("attendanceBaraem", String(baraem));
      fd.set("attendanceAshbal", String(ashbal));
      fd.set("attendanceKashafa", String(kashafa));
      fd.set("attendanceJawala", String(jawala));
      fd.set("attendanceQada", String(qada));

      setDraftState("saving");
      startTransition(async () => {
        const res = await saveDraftAction({}, fd);
        setDraftState(res.success ? "saved" : "idle");
      });
    }, 1500);

    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportDate, location, items, baraem, ashbal, kashafa, jawala, qada]);

  function updateItem(idx: number, value: string) {
    setItems((prev) => prev.map((it, i) => (i === idx ? value : it)));
  }
  function addItem() {
    setItems((prev) => [...prev, ""]);
  }
  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  const fe = state.fieldErrors ?? {};

  return (
    <form
      action={formAction}
      onSubmit={() => {
        submitting.current = true;
      }}
      className="space-y-6"
    >
      {initial?.id && <input type="hidden" name="reportId" value={initial.id} />}

      {state.error && <Alert tone="error">{state.error}</Alert>}

      {/* Auto-save indicator */}
      {!locked && (
        <div className="flex items-center justify-end gap-2 text-xs text-gray-500">
          {draftState === "saving" && (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> جارٍ حفظ المسودة…
            </>
          )}
          {draftState === "saved" && (
            <>
              <Save className="h-3.5 w-3.5 text-brand-600" /> تم حفظ المسودة تلقائياً
            </>
          )}
        </div>
      )}

      <Card className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="اسم الفوج">
            <Input value={groupName} disabled readOnly />
          </Field>
          <Field
            label="التاريخ"
            htmlFor="reportDate"
            error={fe.reportDate?.[0]}
            hint={weekday ? `اليوم: ${weekday}` : undefined}
          >
            <Input
              id="reportDate"
              name="reportDate"
              type="date"
              value={reportDate}
              max={todayStr}
              onChange={(e) => setReportDate(e.target.value)}
              required
            />
          </Field>
        </div>

        <Field label="مكان الاحياء" htmlFor="location" error={fe.location?.[0]}>
          <Input
            id="location"
            name="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="مثال: مقر الفوج - بيروت"
            required
          />
        </Field>
      </Card>

      {/* Program items */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">برنامج الاحياء</h3>
          <Button type="button" variant="secondary" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4" />
            إضافة بند
          </Button>
        </div>
        {fe.programItems && <p className="text-xs font-medium text-red-600">{fe.programItems[0]}</p>}
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-6 shrink-0 text-center text-sm text-gray-400">{idx + 1}.</span>
              <Input
                name="programItems"
                value={item}
                onChange={(e) => updateItem(idx, e.target.value)}
                placeholder={`بند البرنامج رقم ${idx + 1}`}
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="shrink-0 rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                  aria-label="حذف البند"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Attendance */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">الحضور</h3>
          <span className="text-sm text-gray-500">
            الإجمالي: <span className="font-bold text-brand-600">{total}</span>
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <CountField label="براعم" name="attendanceBaraem" value={baraem} onChange={setBaraem} error={fe.attendanceBaraem?.[0]} />
          <CountField label="أشبال" name="attendanceAshbal" value={ashbal} onChange={setAshbal} error={fe.attendanceAshbal?.[0]} />
          <CountField label="كشافة" name="attendanceKashafa" value={kashafa} onChange={setKashafa} error={fe.attendanceKashafa?.[0]} />
          <CountField label="جوالة" name="attendanceJawala" value={jawala} onChange={setJawala} error={fe.attendanceJawala?.[0]} />
          <CountField label="قادة" name="attendanceQada" value={qada} onChange={setQada} error={fe.attendanceQada?.[0]} />
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <SubmitButton />
      </div>
    </form>
  );
}
