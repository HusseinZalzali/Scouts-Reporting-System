"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-900/40">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h2 className="text-xl font-bold">حدث خطأ غير متوقع</h2>
      <p className="max-w-sm text-sm text-gray-500">
        {error.message || "تعذّر تحميل هذه الصفحة. حاول مرة أخرى."}
      </p>
      <Button onClick={reset}>إعادة المحاولة</Button>
    </div>
  );
}
