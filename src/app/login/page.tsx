import { Suspense } from "react";
import { Tent } from "lucide-react";
import { LoginForm } from "./login-form";

export const metadata = { title: "تسجيل الدخول" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-bl from-brand-50 to-gray-100 p-4 dark:from-gray-950 dark:to-gray-900">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg">
            <Tent className="h-9 w-9" />
          </div>
          <h1 className="text-2xl font-bold">نظام التقارير اليومية</h1>
          <p className="mt-1 text-sm text-gray-500">للأفواج الكشفية</p>
        </div>

        <div className="card">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} نظام التقارير الكشفية
        </p>
      </div>
    </div>
  );
}
