"use client";

import { useRef } from "react";
import { Calendar } from "lucide-react";

const AR_DATE = new Intl.DateTimeFormat("ar-EG", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

/**
 * Custom date picker that fully controls the visible display (RTL, no native
 * overlap) while still using the OS-native date picker under the hood.
 *
 * A transparent native <input type="date"> is layered over a styled box.
 * Tapping anywhere opens the native picker; we render the value ourselves.
 */
export function DateField({
  name,
  value,
  max,
  onChange,
  required,
}: {
  name: string;
  value: string; // YYYY-MM-DD
  max?: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const display = value
    ? AR_DATE.format(new Date(`${value}T00:00:00Z`))
    : "اختر التاريخ";

  function openPicker() {
    const el = inputRef.current;
    if (!el) return;
    // showPicker() is supported on modern mobile + desktop browsers.
    if (typeof el.showPicker === "function") {
      try {
        el.showPicker();
        return;
      } catch {
        /* fall through to focus */
      }
    }
    el.focus();
    el.click();
  }

  return (
    <div
      className="relative flex w-full cursor-pointer items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/30 dark:border-gray-700 dark:bg-gray-950"
      onClick={openPicker}
    >
      <Calendar className="h-5 w-5 shrink-0 text-gray-400" />
      <span
        className={
          value
            ? "flex-1 text-sm text-gray-900 dark:text-gray-100"
            : "flex-1 text-sm text-gray-400"
        }
      >
        {display}
      </span>

      {/* The real form field — transparent and overlaid so it stays accessible
          and submits with the form, but its native UI is never visible. */}
      <input
        ref={inputRef}
        name={name}
        type="date"
        value={value}
        max={max}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        aria-label="التاريخ"
      />
    </div>
  );
}
