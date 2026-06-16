import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getReports } from "@/lib/queries";
import { buildExcel, buildPdf } from "@/lib/export";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("غير مصرّح", { status: 403 });
  }

  const sp = req.nextUrl.searchParams;
  const format = sp.get("format") ?? "excel";

  const reports = await getReports({
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
    groupId: sp.get("groupId") ?? undefined,
    location: sp.get("location") ?? undefined,
    q: sp.get("q") ?? undefined,
  });

  const stamp = new Date().toISOString().slice(0, 10);

  if (format === "pdf") {
    const pdf = buildPdf(reports);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="reports-${stamp}.pdf"`,
      },
    });
  }

  const xlsx = await buildExcel(reports);
  return new NextResponse(new Uint8Array(xlsx), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="reports-${stamp}.xlsx"`,
    },
  });
}
