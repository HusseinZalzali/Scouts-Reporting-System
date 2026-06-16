import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

// 29LT Adir (self-hosted via next/font/local). Exposes the --font-adir CSS var.
const adir = localFont({
  src: [
    { path: "../fonts/29LTAdir-Regular.otf", weight: "400", style: "normal" },
    { path: "../fonts/29LTAdir-Medium.otf", weight: "500", style: "normal" },
    { path: "../fonts/29LTAdir-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-adir",
  display: "swap",
});

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
    <html lang="ar" dir="rtl" className={adir.variable} suppressHydrationWarning>
      <body className="font-adir">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
