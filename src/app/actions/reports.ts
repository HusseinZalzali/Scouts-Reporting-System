"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { reportSchema, draftSchema } from "@/lib/validations";
import { toDateOnly } from "@/lib/utils";
import { ReportStatus } from "@prisma/client";

export type ReportFormState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  reportId?: string;
};

function parseProgramItems(formData: FormData): string[] {
  // program items submitted as repeated "programItems" fields.
  return formData.getAll("programItems").map((v) => String(v));
}

async function requireGroupUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "GROUP" || !session.user.scoutGroupId) {
    throw new Error("هذا الإجراء متاح لمستخدمي الأفواج فقط");
  }
  return { userId: session.user.id, scoutGroupId: session.user.scoutGroupId };
}

/**
 * Create or update today's (or the chosen day's) report as SUBMITTED.
 * Enforces one report per group per day via the unique constraint.
 */
export async function submitReportAction(
  _prev: ReportFormState,
  formData: FormData
): Promise<ReportFormState> {
  const { userId, scoutGroupId } = await requireGroupUser();

  const parsed = reportSchema.safeParse({
    reportDate: formData.get("reportDate"),
    location: formData.get("location"),
    programItems: parseProgramItems(formData),
    attendanceBaraem: formData.get("attendanceBaraem"),
    attendanceAshbal: formData.get("attendanceAshbal"),
    attendanceKashafa: formData.get("attendanceKashafa"),
    attendanceJawala: formData.get("attendanceJawala"),
    attendanceQada: formData.get("attendanceQada"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors, error: "يرجى تصحيح الأخطاء" };
  }

  const data = parsed.data;
  const reportDate = toDateOnly(data.reportDate);
  const editingId = (formData.get("reportId") as string) || null;

  // Duplicate-day guard (only when creating a new report).
  const existing = await prisma.dailyReport.findUnique({
    where: { scoutGroupId_reportDate: { scoutGroupId, reportDate } },
    select: { id: true },
  });
  if (existing && existing.id !== editingId) {
    return { error: "يوجد تقرير مُسجّل لهذا اليوم بالفعل" };
  }

  let reportId: string;

  if (existing) {
    // Update existing report (today's edit / promoting a draft).
    await prisma.$transaction([
      prisma.programItem.deleteMany({ where: { reportId: existing.id } }),
      prisma.dailyReport.update({
        where: { id: existing.id },
        data: {
          location: data.location,
          status: ReportStatus.SUBMITTED,
          submittedById: userId,
          attendanceBaraem: data.attendanceBaraem,
          attendanceAshbal: data.attendanceAshbal,
          attendanceKashafa: data.attendanceKashafa,
          attendanceJawala: data.attendanceJawala,
          attendanceQada: data.attendanceQada,
          programItems: {
            create: data.programItems.map((text, i) => ({ order: i + 1, text })),
          },
        },
      }),
    ]);
    reportId = existing.id;
  } else {
    const created = await prisma.dailyReport.create({
      data: {
        scoutGroupId,
        reportDate,
        location: data.location,
        status: ReportStatus.SUBMITTED,
        submittedById: userId,
        attendanceBaraem: data.attendanceBaraem,
        attendanceAshbal: data.attendanceAshbal,
        attendanceKashafa: data.attendanceKashafa,
        attendanceJawala: data.attendanceJawala,
        attendanceQada: data.attendanceQada,
        programItems: {
          create: data.programItems.map((text, i) => ({ order: i + 1, text })),
        },
      },
    });
    reportId = created.id;
  }

  revalidatePath("/reports");
  revalidatePath("/dashboard");
  revalidatePath(`/reports/${reportId}`);
  redirect(`/reports/${reportId}?saved=1`);
}

/**
 * Save (or update) a DRAFT for the given day. Lenient validation.
 * Used by auto-save.
 */
export async function saveDraftAction(
  _prev: ReportFormState,
  formData: FormData
): Promise<ReportFormState> {
  const { userId, scoutGroupId } = await requireGroupUser();

  const parsed = draftSchema.safeParse({
    reportDate: formData.get("reportDate") || "",
    location: formData.get("location") || "",
    programItems: parseProgramItems(formData),
    attendanceBaraem: formData.get("attendanceBaraem") || 0,
    attendanceAshbal: formData.get("attendanceAshbal") || 0,
    attendanceKashafa: formData.get("attendanceKashafa") || 0,
    attendanceJawala: formData.get("attendanceJawala") || 0,
    attendanceQada: formData.get("attendanceQada") || 0,
  });

  if (!parsed.success || !parsed.data.reportDate) {
    return { error: "تعذّر حفظ المسودة" };
  }

  const data = parsed.data;
  const reportDate = toDateOnly(data.reportDate as string);

  const existing = await prisma.dailyReport.findUnique({
    where: { scoutGroupId_reportDate: { scoutGroupId, reportDate } },
    select: { id: true, status: true },
  });

  // Never overwrite a finalized report with a draft.
  if (existing && existing.status === ReportStatus.SUBMITTED) {
    return { success: true, reportId: existing.id };
  }

  const items = (data.programItems ?? []).map((t) => t.trim()).filter(Boolean);

  if (existing) {
    await prisma.$transaction([
      prisma.programItem.deleteMany({ where: { reportId: existing.id } }),
      prisma.dailyReport.update({
        where: { id: existing.id },
        data: {
          location: data.location ?? "",
          attendanceBaraem: data.attendanceBaraem ?? 0,
          attendanceAshbal: data.attendanceAshbal ?? 0,
          attendanceKashafa: data.attendanceKashafa ?? 0,
          attendanceJawala: data.attendanceJawala ?? 0,
          attendanceQada: data.attendanceQada ?? 0,
          programItems: { create: items.map((text, i) => ({ order: i + 1, text })) },
        },
      }),
    ]);
    return { success: true, reportId: existing.id };
  }

  const created = await prisma.dailyReport.create({
    data: {
      scoutGroupId,
      reportDate,
      location: data.location ?? "",
      status: ReportStatus.DRAFT,
      submittedById: userId,
      attendanceBaraem: data.attendanceBaraem ?? 0,
      attendanceAshbal: data.attendanceAshbal ?? 0,
      attendanceKashafa: data.attendanceKashafa ?? 0,
      attendanceJawala: data.attendanceJawala ?? 0,
      attendanceQada: data.attendanceQada ?? 0,
      programItems: { create: items.map((text, i) => ({ order: i + 1, text })) },
    },
  });
  return { success: true, reportId: created.id };
}

export async function deleteReportAction(formData: FormData) {
  const { scoutGroupId } = await requireGroupUser();
  const id = String(formData.get("id"));

  const report = await prisma.dailyReport.findUnique({
    where: { id },
    select: { scoutGroupId: true },
  });
  if (!report || report.scoutGroupId !== scoutGroupId) {
    throw new Error("غير مصرّح بحذف هذا التقرير");
  }

  await prisma.dailyReport.delete({ where: { id } });
  revalidatePath("/reports");
  revalidatePath("/dashboard");
  redirect("/reports");
}

/** Admin can delete any report (program items cascade). */
export async function adminDeleteReportAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("هذا الإجراء متاح للمدير فقط");
  }
  const id = String(formData.get("id"));

  const report = await prisma.dailyReport.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!report) throw new Error("التقرير غير موجود");

  await prisma.dailyReport.delete({ where: { id } });
  revalidatePath("/admin/reports");
  revalidatePath("/admin");
  redirect("/admin/reports");
}
