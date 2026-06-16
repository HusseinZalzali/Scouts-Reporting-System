import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "نظام التقارير اليومية للأفواج الكشفية",
  description: "نظام إدارة وتقديم التقارير الكشفية اليومية لكل فوج",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#26732d",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="font-adir">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
