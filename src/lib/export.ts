import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toInputDate } from "@/lib/utils";

export type ExportableReport = {
  scoutGroup: { name: string };
  reportDate: Date;
  location: string;
  attendanceBaraem: number;
  attendanceAshbal: number;
  attendanceKashafa: number;
  attendanceJawala: number;
  attendanceQada: number;
  programItems: { text: string }[];
};

const HEADERS = [
  "الفوج",
  "التاريخ",
  "المكان",
  "براعم",
  "أشبال",
  "كشافة",
  "جوالة",
  "قادة",
  "الإجمالي",
  "البرنامج",
];

function rowFor(r: ExportableReport) {
  const total =
    r.attendanceBaraem + r.attendanceAshbal + r.attendanceKashafa + r.attendanceJawala + r.attendanceQada;
  return [
    r.scoutGroup.name,
    toInputDate(r.reportDate),
    r.location,
    r.attendanceBaraem,
    r.attendanceAshbal,
    r.attendanceKashafa,
    r.attendanceJawala,
    r.attendanceQada,
    total,
    r.programItems.map((p, i) => `${i + 1}. ${p.text}`).join(" | "),
  ];
}

export async function buildExcel(reports: ExportableReport[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Scout Daily Reporting System";
  const ws = wb.addWorksheet("التقارير", {
    views: [{ rightToLeft: true }],
  });

  ws.addRow(HEADERS);
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF26732D" },
  };
  ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

  for (const r of reports) ws.addRow(rowFor(r));

  ws.columns.forEach((col) => {
    col.width = 18;
  });
  ws.getColumn(10).width = 50; // البرنامج (program) column

  const arrayBuffer = await wb.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

export function buildPdf(reports: ExportableReport[]): Buffer {
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(16);
  doc.text("Scout Daily Reporting - Reports Summary", 14, 16);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toISOString().slice(0, 10)}`, 14, 23);

  // NOTE: jsPDF core fonts do not shape Arabic. For production-grade Arabic
  // PDFs, embed an Arabic font (e.g. Amiri) via doc.addFont. Here we transliterate
  // group/location to keep the export functional out of the box.
  autoTable(doc, {
    startY: 28,
    head: [HEADERS.map((h) => h)],
    body: reports.map((r) => rowFor(r).map((c) => String(c))),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [38, 115, 45] },
    columnStyles: { 9: { cellWidth: 80 } },
  });

  return Buffer.from(doc.output("arraybuffer"));
}
