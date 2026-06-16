"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  BarChart3,
  Users,
  Settings,
  Menu,
  X,
  Tent,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoutAction } from "@/app/actions/auth";

export type NavRole = "ADMIN" | "GROUP";

type NavItem = { href: string; label: string; icon: React.ElementType };

const GROUP_NAV: NavItem[] = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/reports/new", label: "تقرير جديد", icon: PlusCircle },
  { href: "/reports", label: "تقاريري", icon: FileText },
  { href: "/settings", label: "الإعدادات", icon: Settings },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "لوحة المدير", icon: LayoutDashboard },
  { href: "/admin/reports", label: "كل التقارير", icon: FileText },
  { href: "/admin/analytics", label: "التحليلات", icon: BarChart3 },
  { href: "/admin/users", label: "إدارة المستخدمين", icon: Users },
  { href: "/settings", label: "الإعدادات", icon: Settings },
];

export function Sidebar({
  role,
  userName,
  groupName,
}: {
  role: NavRole;
  userName: string;
  groupName?: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = role === "ADMIN" ? ADMIN_NAV : GROUP_NAV;

  const isActive = (href: string) =>
    href === pathname || (href !== "/admin" && href !== "/dashboard" && pathname.startsWith(href + "/")) ||
    (href === pathname);

  const Nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {nav.map((item) => {
        const active = isActive(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-brand-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const Inner = (
    <div className="flex h-full flex-col p-4">
      <div className="mb-6 flex items-center gap-3 px-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
          <Tent className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">التقارير الكشفية</p>
          <p className="truncate text-xs text-gray-500">
            {role === "ADMIN" ? "حساب المدير" : groupName ?? "فوج"}
          </p>
        </div>
      </div>

      {Nav}

      <div className="mt-4 space-y-3 border-t border-gray-200 pt-4 dark:border-gray-800">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="truncate">{userName}</span>
          </div>
          <ThemeToggle />
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            تسجيل الخروج
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur md:hidden dark:border-gray-800 dark:bg-gray-950/90">
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="فتح القائمة"
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="font-bold">التقارير الكشفية</span>
        <ThemeToggle />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 border-l border-gray-200 bg-white md:block dark:border-gray-800 dark:bg-gray-900">
        {Inner}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 right-0 w-72 bg-white shadow-xl dark:bg-gray-900">
            <button
              onClick={() => setOpen(false)}
              className="absolute left-3 top-3 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="إغلاق القائمة"
            >
              <X className="h-5 w-5" />
            </button>
            {Inner}
          </div>
        </div>
      )}
    </>
  );
}
