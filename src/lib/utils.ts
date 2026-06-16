import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Normalize a Date/string to a UTC date-only Date (midnight UTC). */
export function toDateOnly(input: Date | string): Date {
  const d = typeof input === "string" ? new Date(input) : input;
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

/** Today as a UTC date-only Date. */
export function todayDateOnly(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

/** Format a date as YYYY-MM-DD (for <input type="date"> and keys). */
export function toInputDate(input: Date | string): string {
  const d = typeof input === "string" ? new Date(input) : input;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const AR_DATE = new Intl.DateTimeFormat("ar-EG", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

/** Human-friendly Arabic date. */
export function formatArabicDate(input: Date | string): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return AR_DATE.format(d);
}

/** Convert Western digits to Arabic-Indic digits. */
export function toArabicDigits(value: number | string): string {
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(value).replace(/\d/g, (d) => map[Number(d)]);
}
