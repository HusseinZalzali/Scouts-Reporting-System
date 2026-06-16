"use client";

import { Trash2 } from "lucide-react";
import { adminDeleteReportAction } from "@/app/actions/reports";

export function DeleteReportButton({ id }: { id: string }) {
  return (
    <form action={adminDeleteReportAction}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm("هل أنت متأكد من حذف هذا التقرير نهائياً؟ لا يمكن التراجع.")) {
            e.preventDefault();
          }
        }}
        className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700"
      >
        <Trash2 className="h-4 w-4" />
        حذف التقرير
      </button>
    </form>
  );
}
