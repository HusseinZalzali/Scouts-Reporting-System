import { Card } from "@/components/ui";
import { cn, toArabicDigits } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  tone = "brand",
}: {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  tone?: "brand" | "blue" | "amber" | "violet";
}) {
  const tones: Record<string, string> = {
    brand: "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    violet: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  };
  return (
    <Card className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 text-2xl font-bold">
          {typeof value === "number" ? toArabicDigits(value) : value}
        </p>
      </div>
      {icon && (
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", tones[tone])}>
          {icon}
        </div>
      )}
    </Card>
  );
}
