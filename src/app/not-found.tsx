import Link from "next/link";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-6xl font-black text-brand-600">٤٠٤</p>
      <h2 className="text-xl font-bold">الصفحة غير موجودة</h2>
      <p className="max-w-sm text-sm text-gray-500">عذراً، لم نتمكن من العثور على الصفحة المطلوبة.</p>
      <Link href="/">
        <Button>العودة للرئيسية</Button>
      </Link>
    </div>
  );
}
